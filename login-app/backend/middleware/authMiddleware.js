const jwt = require('jsonwebtoken');

// ==========================================
// MIDDLEWARE: protect
// DESC:  Verifies JWT token from request header.
//        Protects private routes from unauthorized access.
// ==========================================
const protect = (req, res, next) => {
  try {
    // 1. Read the Authorization header from the request
    // It should look like: "Bearer eyJhbGciOiJIUzI1NiIsIn..."
    const authHeader = req.headers['authorization'];

    // 2. Check if the header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // 3. Extract only the token part (remove "Bearer " prefix)
    const token = authHeader.split(' ')[1];

    // 4. Verify and decode the token using our JWT secret key
    // If the token is expired or tampered with, jwt.verify() will throw an error
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Attach the decoded user info to the request object
    // Now any route that uses this middleware can access req.user
    req.user = decoded;

    // 6. Call next() to pass control to the actual route handler
    next();

  } catch (error) {
    // Token was invalid, expired, or tampered with
    return res.status(401).json({ message: 'Access denied. Invalid or expired token.' });
  }
};

module.exports = protect;
