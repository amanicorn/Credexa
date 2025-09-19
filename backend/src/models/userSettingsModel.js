const mongoose = require("mongoose");

const userSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Account Security Settings
    accountSecurity: {
      twoFactorEnabled: { type: Boolean, default: false },
      twoFactorSecret: { type: String }, // For storing 2FA secret
      loginSessionsLimit: { type: Number, default: 5 },
      passwordLastChanged: { type: Date },
      sessionNotifications: { type: Boolean, default: true },
    },

    // Connected Accounts
    connectedAccounts: {
      showLinkedProviders: { type: Boolean, default: true },
      allowAccountLinking: { type: Boolean, default: true },
      autoLinkSimilarEmails: { type: Boolean, default: false },
    },

    // Privacy & Visibility Settings
    privacy: {
      profileVisibility: { 
        type: String, 
        enum: ["public", "private", "friends"], 
        default: "public" 
      },
      showCredentialsPublicly: { type: Boolean, default: true },
      showOnLeaderboards: { type: Boolean, default: true },
      showLearningProgress: { type: Boolean, default: true },
      showSkillsPublicly: { type: Boolean, default: true },
      allowDataExport: { type: Boolean, default: true },
    },

    // Data & Analytics
    dataAnalytics: {
      trackLearningAnalytics: { type: Boolean, default: true },
      shareAnalyticsData: { type: Boolean, default: false },
      allowPersonalizedRecommendations: { type: Boolean, default: true },
    },

    // Notification Settings
    notifications: {
      // Email Notifications
      email: {
        credentialUpdates: { type: Boolean, default: true },
        achievementAlerts: { type: Boolean, default: true },
        learningReminders: { type: Boolean, default: true },
        weeklyReports: { type: Boolean, default: true },
        monthlyReports: { type: Boolean, default: false },
        securityAlerts: { type: Boolean, default: true },
        marketingEmails: { type: Boolean, default: false },
      },
      // Push Notifications (for future web push)
      push: {
        enabled: { type: Boolean, default: false },
        achievementAlerts: { type: Boolean, default: true },
        learningReminders: { type: Boolean, default: true },
        socialUpdates: { type: Boolean, default: false },
      },
    },

    // Display & Experience Settings
    display: {
      theme: { 
        type: String, 
        enum: ["light", "dark", "system"], 
        default: "system" 
      },
      language: { type: String, default: "en" },
      timezone: { type: String, default: "UTC" },
      dateFormat: { 
        type: String, 
        enum: ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"], 
        default: "MM/DD/YYYY" 
      },
      compactMode: { type: Boolean, default: false },
      animationsEnabled: { type: Boolean, default: true },
    },

    // Credentials & Verification Settings
    credentials: {
      autoVerificationEnabled: { type: Boolean, default: true },
      requireManualApproval: { type: Boolean, default: false },
      allowCredentialSharing: { type: Boolean, default: true },
      defaultSharingLevel: { 
        type: String, 
        enum: ["public", "private", "link-only"], 
        default: "public" 
      },
      expirationReminders: { type: Boolean, default: true },
      blockchainStorage: { type: Boolean, default: false },
    },

    // Blockchain/Web3 Settings
    blockchain: {
      preferredNetwork: { 
        type: String, 
        enum: ["ethereum", "polygon", "bsc", "none"], 
        default: "none" 
      },
      autoMintNFTCredentials: { type: Boolean, default: false },
      gasFeePreference: { 
        type: String, 
        enum: ["low", "medium", "high"], 
        default: "medium" 
      },
    },

    // Learning & Skills Settings
    learning: {
      skillTrackingEnabled: { type: Boolean, default: true },
      showLearningPath: { type: Boolean, default: true },
      goalReminders: { type: Boolean, default: true },
      difficultyPreference: { 
        type: String, 
        enum: ["beginner", "intermediate", "advanced", "mixed"], 
        default: "mixed" 
      },
      preferredLearningStyle: { 
        type: String, 
        enum: ["visual", "auditory", "kinesthetic", "mixed"], 
        default: "mixed" 
      },
    },
  },
  { 
    timestamps: true,
    // Ensure settings are created with default values
    minimize: false 
  }
);

// Create default settings for new users
userSettingsSchema.statics.createDefaultSettings = function(userId) {
  return this.create({ userId });
};

// Get or create settings for a user
userSettingsSchema.statics.getOrCreateSettings = async function(userId) {
  let settings = await this.findOne({ userId });
  if (!settings) {
    settings = await this.createDefaultSettings(userId);
  }
  return settings;
};

module.exports = mongoose.model("UserSettings", userSettingsSchema);