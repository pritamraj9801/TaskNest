// This code defines an authentication middleware using JSON Web Tokens (JWT).
// It's used to protect your API routes by making sure only authenticated users can access them
//Imports the `jsonwebtoken` library to handle encoding/decoding and verifying JWTs.
const jwt = require('jsonwebtoken');

// Defines a middleware function that Express will use in protected routes.
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Missing token' });
  }

  const token = authHeader.split(' ')[1]; // Format: "Bearer <token>"

  try {
    const decoded = jwt.verify(token, 'SECRET123'); // use the same secret as login
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
}

module.exports = authMiddleware;
