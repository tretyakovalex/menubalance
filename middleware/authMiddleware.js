const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Get the token from the Authorization header (e.g., 'Bearer <token>')
  const token = req.headers['authorization']?.split(' ')[1]; // Extract token part after 'Bearer'
  // If there is no token, return Unauthorized
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  // Verify the token and decode the payload
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      // If token verification fails, send Forbidden (403)
      return res.status(403).json({ message: 'Forbidden: Invalid or expired token' });
    }

    // If token is valid, attach the decoded user info to req.user
    req.user = decoded;

    // Proceed to the next middleware or route handler
    next();
  });
};
