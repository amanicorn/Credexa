const UserSession = require('../models/userSessionModel');
const UserSettings = require('../models/userSettingsModel');
const { sendEmail } = require('./emailService');
const { v4: uuidv4 } = require('uuid');

// Parse user agent to get device information
const parseUserAgent = (userAgent) => {
  const device = {
    type: 'desktop',
    browser: 'unknown',
    os: 'unknown',
    name: 'Unknown Device'
  };

  // Simple user agent parsing (you could use a library like 'ua-parser-js' for more accuracy)
  const ua = userAgent.toLowerCase();
  
  // Device type detection
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    device.type = 'mobile';
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    device.type = 'tablet';
  }
  
  // Browser detection (order matters - check specific browsers first)
  if (ua.includes('edg/')) device.browser = 'Edge';
  else if (ua.includes('firefox')) device.browser = 'Firefox';
  else if (ua.includes('chrome')) device.browser = 'Chrome';
  else if (ua.includes('safari') && !ua.includes('chrome')) device.browser = 'Safari';
  else if (ua.includes('opera')) device.browser = 'Opera';
  
  // OS detection
  if (ua.includes('windows')) device.os = 'Windows';
  else if (ua.includes('mac')) device.os = 'macOS';
  else if (ua.includes('linux')) device.os = 'Linux';
  else if (ua.includes('android')) device.os = 'Android';
  else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) device.os = 'iOS';
  
  // Create friendly device name
  device.name = `${device.browser} on ${device.os}`;
  
  return device;
};

// Get location from IP (basic implementation - you could use a GeoIP service)
const getLocationFromIP = async (ipAddress) => {
  // For now, return null - you could integrate with services like:
  // - MaxMind GeoIP
  // - IP-API
  // - ipinfo.io
  return {
    country: null,
    city: null,
    region: null
  };
};

// Create a new session
const createSession = async (userId, loginMethod, req) => {
  try {
    console.log(`🔧 Session service: Creating session for user ${userId}`);
    
    const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || '';
    const device = parseUserAgent(userAgent);
    const location = await getLocationFromIP(ipAddress);
    
    console.log(`📍 Device info: ${device.name} on ${device.os}`);
    console.log(`🌍 IP Address: ${ipAddress}`);
    
    // Check if this is a new device/location
    const deviceFingerprint = device.name;
    const isNewDevice = await UserSession.checkNewDeviceOrLocation(userId, ipAddress, deviceFingerprint);
    
    console.log(`🆕 Is new device: ${isNewDevice}`);
    
    // Create session
    const session = new UserSession({
      userId,
      sessionId: uuidv4(),
      loginMethod,
      ipAddress,
      userAgent,
      device,
      location,
      isNewDevice,
      isNewLocation: isNewDevice, // For now, treat new device as new location too
    });
    
    await session.save();
    console.log(`✅ Session saved to database successfully!`);
    
    // Send notification if it's a new device and user has notifications enabled
    if (isNewDevice) {
      console.log(`📧 Sending email notification for new device login`);
      await sendSessionNotification(userId, session);
    }
    
    return session;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};

// Send session notification email
const sendSessionNotification = async (userId, session) => {
  try {
    // Check if user has session notifications enabled (default to true if no settings)
    const settings = await UserSettings.findOne({ userId });
    const notificationsEnabled = settings?.accountSecurity?.sessionNotifications !== false;
    
    if (!notificationsEnabled) {
      console.log('📧 Session notifications disabled for user');
      return; // User has explicitly disabled session notifications
    }
    
    // Get user email
    const User = require('../models/userModel');
    const user = await User.findById(userId);
    if (!user?.email) {
      console.log('❌ No email found for user');
      return; // No email to send to
    }
    
    const emailData = {
      to: user.email,
      subject: 'New Login to Your Credexa Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0ea5e9;">New Login Detected</h2>
          
          <p>Hello ${user.fullName?.firstName || 'User'},</p>
          
          <p>We detected a new login to your Credexa account. Here are the details:</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Login Method:</strong> ${session.loginMethod.charAt(0).toUpperCase() + session.loginMethod.slice(1)}</p>
            <p><strong>Device:</strong> ${session.device.name}</p>
            <p><strong>IP Address:</strong> ${session.ipAddress}</p>
            <p><strong>Time:</strong> ${session.loginAt.toLocaleString()}</p>
            ${session.location?.country ? `<p><strong>Location:</strong> ${session.location.city}, ${session.location.country}</p>` : ''}
          </div>
          
          <p>If this was you, no action is needed. If you don't recognize this login, please:</p>
          <ul>
            <li>Change your password immediately</li>
            <li>Review your active sessions in Settings</li>
            <li>Enable two-factor authentication</li>
          </ul>
          
          <p>You can manage your sessions and security settings in your <a href="${process.env.CLIENT_URL}/dashboard/settings" style="color: #0ea5e9;">account settings</a>.</p>
          
          <p>Best regards,<br>The Credexa Team</p>
        </div>
      `
    };
    
    await sendEmail(emailData);
    
    // Mark notification as sent
    session.notificationSent = true;
    await session.save();
    
  } catch (error) {
    console.error('Error sending session notification:', error);
    // Don't throw error - notification failure shouldn't break login
  }
};

// Update session activity
const updateSessionActivity = async (sessionId) => {
  try {
    const session = await UserSession.findOne({ sessionId, isActive: true });
    if (session) {
      await session.updateActivity();
    }
  } catch (error) {
    console.error('Error updating session activity:', error);
  }
};

// Terminate session
const terminateSession = async (sessionId, userId = null) => {
  try {
    const query = { sessionId, isActive: true };
    if (userId) query.userId = userId;
    
    const session = await UserSession.findOne(query);
    if (session) {
      await session.terminate();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error terminating session:', error);
    return false;
  }
};

// Get active sessions for user
const getUserActiveSessions = async (userId) => {
  try {
    return await UserSession.getActiveSessions(userId);
  } catch (error) {
    console.error('Error getting user sessions:', error);
    return [];
  }
};

// Clean up expired sessions (run periodically)
const cleanupExpiredSessions = async () => {
  try {
    const result = await UserSession.cleanupExpiredSessions();
    console.log(`Cleaned up ${result.deletedCount} expired sessions`);
    return result.deletedCount;
  } catch (error) {
    console.error('Error cleaning up sessions:', error);
    return 0;
  }
};

module.exports = {
  createSession,
  updateSessionActivity,
  terminateSession,
  getUserActiveSessions,
  cleanupExpiredSessions,
  sendSessionNotification
};