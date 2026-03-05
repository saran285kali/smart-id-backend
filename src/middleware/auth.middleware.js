const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // 1. Get token from header (Standard: Bearer <token>)
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // MATCH: Axios interceptor will catch this 401
    return res.status(401).json({ message: "Access Denied: No Token Provided" });
  }

  try {
    // 2. Verify token
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Attach user data to request object
    req.user = verified;

    next(); // Move to the actual route logic
  } catch (err) {
    // MATCH: Happens if token is expired, forged, or invalid
    return res.status(401).json({ message: "Invalid or Expired Token" });
  }
};

// Polyfill for existing routes that use { protect }
authMiddleware.protect = authMiddleware;

module.exports = authMiddleware;
