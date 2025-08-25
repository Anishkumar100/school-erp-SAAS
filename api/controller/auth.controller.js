// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.authCheck = (req, res, next) => {
  try {
    let token = req.header('Authorization') || req.query.token;

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    if (token.startsWith('Bearer ')) {
      token = token.slice(7).trim();
    }

    const decoded = jwt.verify(token, process.env.JWTSECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT Error:", error.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};
