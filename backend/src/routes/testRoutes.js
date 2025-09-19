const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// Test login endpoint - bypasses OTP for development
router.post('/test-login', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    });

    res.json({
      success: true,
      message: 'Test login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        provider: user.provider,
        profilePic: user.profilePic,
        isVerified: user.isVerified,
      },
    });

  } catch (error) {
    console.error('Test login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;