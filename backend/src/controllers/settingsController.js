const bcrypt = require('bcrypt');
const UserSettings = require('../models/userSettingsModel');
const User = require('../models/userModel');

// Get user settings
const getSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const settings = await UserSettings.getOrCreateSettings(userId);
    
    res.json({
      success: true,
      settings: settings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings'
    });
  }
};

// Update user settings
const updateSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    // Remove sensitive fields that shouldn't be directly updated
    delete updates.userId;
    delete updates._id;
    delete updates.createdAt;
    delete updates.updatedAt;

    const settings = await UserSettings.findOneAndUpdate(
      { userId },
      { $set: updates },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings: settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings'
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const user = await User.findById(userId);
    if (!user || !user.password) {
      return res.status(400).json({
        success: false,
        message: 'Password change not available for social login accounts'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and timestamp
    await User.findByIdAndUpdate(userId, {
      password: hashedNewPassword
    });

    // Update password change timestamp in settings
    await UserSettings.findOneAndUpdate(
      { userId },
      { 
        $set: { 
          'accountSecurity.passwordLastChanged': new Date() 
        }
      },
      { upsert: true }
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};

// Get connected accounts
const getConnectedAccounts = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('googleId githubId facebookId discordId linkedinId walletAddress provider email');

    const connectedAccounts = {
      email: user.email ? { connected: true, primary: user.provider === 'email' } : { connected: false },
      google: user.googleId ? { connected: true, primary: user.provider === 'google' } : { connected: false },
      github: user.githubId ? { connected: true, primary: user.provider === 'github' } : { connected: false },
      facebook: user.facebookId ? { connected: true, primary: user.provider === 'facebook' } : { connected: false },
      discord: user.discordId ? { connected: true, primary: user.provider === 'discord' } : { connected: false },
      linkedin: user.linkedinId ? { connected: true, primary: user.provider === 'linkedin' } : { connected: false },
      web3: user.walletAddress ? { connected: true, primary: user.provider === 'web3', address: user.walletAddress } : { connected: false }
    };

    res.json({
      success: true,
      connectedAccounts: connectedAccounts,
      primaryProvider: user.provider
    });
  } catch (error) {
    console.error('Get connected accounts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch connected accounts'
    });
  }
};

// Disconnect account (except primary)
const disconnectAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { provider } = req.params;

    const user = await User.findById(userId);
    
    if (user.provider === provider) {
      return res.status(400).json({
        success: false,
        message: 'Cannot disconnect your primary login method'
      });
    }

    const updateField = {};
    switch (provider) {
      case 'google':
        updateField.googleId = null;
        break;
      case 'github':
        updateField.githubId = null;
        break;
      case 'facebook':
        updateField.facebookId = null;
        break;
      case 'discord':
        updateField.discordId = null;
        break;
      case 'linkedin':
        updateField.linkedinId = null;
        break;
      case 'web3':
        updateField.walletAddress = null;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid provider'
        });
    }

    await User.findByIdAndUpdate(userId, { $unset: updateField });

    res.json({
      success: true,
      message: `${provider.charAt(0).toUpperCase() + provider.slice(1)} account disconnected successfully`
    });
  } catch (error) {
    console.error('Disconnect account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disconnect account'
    });
  }
};

// Enable/Disable 2FA (placeholder - would need proper 2FA implementation)
const toggle2FA = async (req, res) => {
  try {
    const userId = req.user.id;
    const { enable } = req.body;

    await UserSettings.findOneAndUpdate(
      { userId },
      { 
        $set: { 
          'accountSecurity.twoFactorEnabled': enable 
        }
      },
      { upsert: true }
    );

    res.json({
      success: true,
      message: `Two-factor authentication ${enable ? 'enabled' : 'disabled'} successfully`,
      // Note: In real implementation, you'd return 2FA setup QR code when enabling
    });
  } catch (error) {
    console.error('Toggle 2FA error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update 2FA settings'
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  changePassword,
  getConnectedAccounts,
  disconnectAccount,
  toggle2FA
};