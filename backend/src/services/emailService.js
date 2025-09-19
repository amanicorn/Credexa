const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send email function
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Credexa" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || html?.replace(/<[^>]*>/g, '') // Strip HTML for text version
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Send session notification email
const sendSessionNotificationEmail = async (userEmail, sessionData) => {
  const { userName, device, ipAddress, loginTime, loginMethod, location } = sessionData;
  
  return await sendEmail({
    to: userEmail,
    subject: 'New Login to Your Credexa Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #0ea5e9; margin: 0;">Credexa</h1>
        </div>
        
        <h2 style="color: #1f2937; margin-bottom: 20px;">🔐 New Login Detected</h2>
        
        <p style="color: #374151; font-size: 16px;">Hello ${userName || 'User'},</p>
        
        <p style="color: #374151; font-size: 16px;">We detected a new login to your Credexa account. Here are the details:</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Login Method:</td>
              <td style="padding: 8px 0; color: #6b7280;">${loginMethod?.charAt(0).toUpperCase() + loginMethod?.slice(1)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Device:</td>
              <td style="padding: 8px 0; color: #6b7280;">${device}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">IP Address:</td>
              <td style="padding: 8px 0; color: #6b7280;">${ipAddress}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Time:</td>
              <td style="padding: 8px 0; color: #6b7280;">${new Date(loginTime).toLocaleString()}</td>
            </tr>
            ${location?.country ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Location:</td>
              <td style="padding: 8px 0; color: #6b7280;">${location.city ? location.city + ', ' : ''}${location.country}</td>
            </tr>
            ` : ''}
          </table>
        </div>
        
        <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">⚠️ If this wasn't you:</h3>
          <ul style="color: #92400e; margin: 10px 0; padding-left: 20px;">
            <li>Change your password immediately</li>
            <li>Review your active sessions in Settings</li>
            <li>Enable two-factor authentication</li>
            <li>Contact our support team if needed</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL}/dashboard/settings" 
             style="background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Manage Security Settings
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          This email was sent because you have session notifications enabled. You can change this setting in your account preferences.
        </p>
        
        <p style="color: #374151; font-size: 16px; margin-top: 20px;">
          Best regards,<br>
          <strong>The Credexa Team</strong>
        </p>
      </div>
    `
  });
};

module.exports = {
  sendEmail,
  sendSessionNotificationEmail
};