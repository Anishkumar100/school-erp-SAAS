// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.authCheck = (req, res, next) => {
  // Accept token from either 'Authorization' header or directly as the header value
  let token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // If the frontend sends 'Bearer undefined', just remove 'Bearer ' and check
  if (token.startsWith("Bearer ")) token = token.slice(7);

  // If token is literally 'undefined', reject it
  if (!token || token === 'undefined') {
    return res.status(401).json({ message: 'Token is not valid' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWTSECRET);
    req.user = decoded; 
    next();
  } catch (error) {
    console.error("JWT Error:", error.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};
