// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.authCheck = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
    
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWTSECRET);
    req.user = decoded; 
    next(); // ✅ allow request to continue to the controller
  } catch (error) {
    console.log("Error", error)
    res.status(401).json({ message: 'Token is not valid' });
  }
};
