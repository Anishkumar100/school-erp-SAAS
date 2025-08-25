// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.authCheck = (req, res, next) => {
  try {
    let token = req.header('Authorization');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Remove "Bearer " if it exists
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length).trim();
    }

    const decoded = jwt.verify(token, process.env.JWTSECRET);
    req.user = decoded; // attach user info
    next();
  } catch (error) {
    console.error("JWT Error:", error.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};
