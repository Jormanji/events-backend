const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT token and attach user info (including username) to req.user
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authorization denied' });
  }

  try {
    // Verify the token and extract the user data from it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user data (including username) to the request object
    req.user = decoded;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
