// middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  
 const authHeader = req.headers.authorization;
 // Handle both "Bearer <token>" and raw token
  const token = authHeader.startsWith('Bearer ') 
    ? authHeader.split(' ')[1] 
    : authHeader;

  if (!token) return res.status(401).send("No token");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;

  next();
};