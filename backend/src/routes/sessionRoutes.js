const express = require('express');
const router = express.Router();
const UserSession = require('../models/userSessionModel');
const { protect } = require('../middlewares/authMiddleware');

// Get all active sessions for the authenticated user
router.get('/', protect, async (req, res) => {
  try {
    console.log('🔍 GET /api/sessions - User ID:', req.user?.id);
    
    const sessions = await UserSession.find({
      userId: req.user.id,
      isActive: true
    })
    .select('-sessionId') // Don't expose session IDs
    .sort({ lastActivity: -1 });

    console.log('📊 Found sessions count:', sessions.length);
    
    const sessionData = sessions.map(session => ({
      id: session._id,
      device: session.device,
      location: session.location,
      ipAddress: session.ipAddress,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity,
      isCurrent: session.sessionId === req.sessionId // if we add session tracking to middleware
    }));

    console.log('✅ Returning sessions:', sessionData);

    res.json({
      success: true,
      sessions: sessionData
    });
  } catch (error) {
    console.error('❌ Error fetching sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sessions'
    });
  }
});

// Terminate a specific session
router.delete('/:sessionId', protect, async (req, res) => {
  try {
    const session = await UserSession.findOne({
      _id: req.params.sessionId,
      userId: req.user.id,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    session.isActive = false;
    session.terminatedAt = new Date();
    session.terminationReason = 'User terminated';
    await session.save();

    res.json({
      success: true,
      message: 'Session terminated successfully'
    });
  } catch (error) {
    console.error('Error terminating session:', error);
    res.status(500).json({
      success: false,
      message: 'Error terminating session'
    });
  }
});

// Terminate all other sessions (keep current session)
router.post('/terminate-others', protect, async (req, res) => {
  try {
    const result = await UserSession.updateMany(
      {
        userId: req.user.id,
        isActive: true,
        _id: { $ne: req.currentSessionId } // Exclude current session if available
      },
      {
        $set: {
          isActive: false,
          terminatedAt: new Date(),
          terminationReason: 'Terminated by user (all sessions)'
        }
      }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} sessions terminated`,
      terminatedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error terminating sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Error terminating sessions'
    });
  }
});

// Get session statistics
router.get('/stats', protect, async (req, res) => {
  try {
    const totalSessions = await UserSession.countDocuments({
      userId: req.user.id
    });

    const activeSessions = await UserSession.countDocuments({
      userId: req.user.id,
      isActive: true
    });

    const recentSessions = await UserSession.countDocuments({
      userId: req.user.id,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    });

    // Get unique devices and locations
    const uniqueDevices = await UserSession.distinct('device.type', {
      userId: req.user.id
    });

    const uniqueLocations = await UserSession.distinct('location.country', {
      userId: req.user.id
    });

    res.json({
      success: true,
      stats: {
        totalSessions,
        activeSessions,
        recentSessions,
        uniqueDevices: uniqueDevices.length,
        uniqueLocations: uniqueLocations.length,
        deviceTypes: uniqueDevices,
        countries: uniqueLocations
      }
    });
  } catch (error) {
    console.error('Error fetching session stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching session statistics'
    });
  }
});

module.exports = router;