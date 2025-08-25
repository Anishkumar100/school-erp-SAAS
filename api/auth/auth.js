// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    let token = req.header('Authorization');

    // Handle undefined or raw token
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    // Remove 'Bearer ' prefix if present
    if (token.startsWith('Bearer ')) token = token.slice(7);

    try {
      const decoded = jwt.verify(token, process.env.JWTSECRET);
      req.user = decoded;

      if (roles.length > 0 && !roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      next();
    } catch (error) {
      console.error("JWT Error:", error.message);
      res.status(401).json({ message: 'Token is not valid' });
    }
  };
};

module.exports = authMiddleware;
