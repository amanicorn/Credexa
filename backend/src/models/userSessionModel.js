const mongoose = require("mongoose");

const userSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    // Session identification
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    
    // Login information
    loginMethod: {
      type: String,
      enum: ["email", "google", "github", "facebook", "discord", "linkedin", "web3"],
      required: true,
    },
    
    // Device and network information
    ipAddress: {
      type: String,
      required: true,
    },
    
    userAgent: {
      type: String,
      required: true,
    },
    
    // Parsed device information
    device: {
      type: {
        type: String, // mobile, desktop, tablet
        default: "unknown"
      },
      browser: {
        type: String,
        default: "unknown"
      },
      os: {
        type: String,
        default: "unknown"
      },
      name: {
        type: String, // Friendly device name
        default: "Unknown Device"
      }
    },
    
    // Location information (optional)
    location: {
      country: { type: String },
      city: { type: String },
      region: { type: String },
    },
    
    // Session status
    isActive: {
      type: Boolean,
      default: true,
    },
    
    // Timestamps
    loginAt: {
      type: Date,
      default: Date.now,
    },
    
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
    
    logoutAt: {
      type: Date,
    },
    
    expiresAt: {
      type: Date,
      default: function() {
        // Default session expiry: 30 days from now
        return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      }
    },
    
    // Security flags
    isNewDevice: {
      type: Boolean,
      default: false,
    },
    
    isNewLocation: {
      type: Boolean,
      default: false,
    },
    
    notificationSent: {
      type: Boolean,
      default: false,
    },
  },
  { 
    timestamps: true,
    // Create index for performance
    indexes: [
      { userId: 1, isActive: 1 },
      { sessionId: 1 },
      { expiresAt: 1 }, // For TTL cleanup
    ]
  }
);

// Index for automatic cleanup of expired sessions
userSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to clean up expired sessions
userSessionSchema.statics.cleanupExpiredSessions = function() {
  return this.deleteMany({ 
    $or: [
      { expiresAt: { $lt: new Date() } },
      { isActive: false, logoutAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
    ]
  });
};

// Method to terminate session
userSessionSchema.methods.terminate = function() {
  this.isActive = false;
  this.logoutAt = new Date();
  return this.save();
};

// Method to update last activity
userSessionSchema.methods.updateActivity = function() {
  this.lastActivityAt = new Date();
  return this.save();
};

// Static method to get active sessions for user
userSessionSchema.statics.getActiveSessions = function(userId) {
  return this.find({ 
    userId, 
    isActive: true,
    expiresAt: { $gt: new Date() }
  }).sort({ lastActivityAt: -1 });
};

// Check if this is a new device/location for the user
userSessionSchema.statics.checkNewDeviceOrLocation = async function(userId, ipAddress, deviceFingerprint) {
  // Check if we've seen this EXACT combination of device and IP before
  const existingSession = await this.findOne({
    userId,
    $and: [
      { ipAddress },
      { 'device.name': deviceFingerprint }
    ],
    loginAt: { $gt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Within last 30 days
  });
  
  return !existingSession;
};

module.exports = mongoose.model("UserSession", userSessionSchema);