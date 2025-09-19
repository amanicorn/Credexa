const express = require('express');
const {
  getSettings,
  updateSettings,
  changePassword,
  getConnectedAccounts,
  disconnectAccount,
  toggle2FA
} = require('../controllers/settingsController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get user settings
router.get('/', getSettings);

// Update user settings
router.put('/', updateSettings);

// Change password
router.put('/change-password', changePassword);

// Get connected accounts
router.get('/connected-accounts', getConnectedAccounts);

// Disconnect account
router.delete('/connected-accounts/:provider', disconnectAccount);

// Toggle 2FA
router.put('/2fa', toggle2FA);

module.exports = router;