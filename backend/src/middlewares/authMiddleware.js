const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = async (req, res, next) => {
  let token;

  console.log('🔐 Auth middleware - Headers:', req.headers.authorization);

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log('🔑 Token extracted:', token ? 'Token exists' : 'No token');

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Token decoded, user ID:', decoded.id);

      req.user = await User.findById(decoded.id).select("-password");
      
      if (!req.user) {
        console.log('❌ User not found for ID:', decoded.id);
        return res.status(401).json({ message: "Not authorized, user not found" });
      }

      console.log('✅ User authenticated:', req.user.email);
      next();
    } catch (error) {
      console.error("❌ Token verification failed:", error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    console.log('❌ No token provided');
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = { protect };
