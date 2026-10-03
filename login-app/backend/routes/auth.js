const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// ==========================================
// ROUTE: POST /api/auth/register
// DESC:  Register a new user
// ACCESS: Public
// ==========================================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Basic validation: ensure all fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields (name, email, password)' });
    }

    // 2. Password length validation
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // 3. Check if user already exists with this email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    // 4. Hash the password using bcrypt
    // Salt adds random string to the password before hashing to prevent rainbow table attacks
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Create and save the new user in MongoDB
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword, // Store the hashed password, NEVER the plain text!
    });

    await newUser.save();

    // 6. Return success response (Notice: We DO NOT send back the password!)
    return res.status(201).json({
      message: 'User registered successfully!',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error during registration' });
  }
});

// ==========================================
// ROUTE: POST /api/auth/login
// DESC:  Authenticate user and return JWT token
// ACCESS: Public
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validation: check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password' });
    }

    // 2. Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Intentionally use generic message so attackers can't guess valid emails
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // 3. Compare provided password with hashed password in database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // 4. Generate JWT Token
    // Payload contains non-sensitive identity info (user ID and email)
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' } // Token expires in 24 hours
    );

    // 5. Send response with token and basic user info
    return res.status(200).json({
      message: 'Login successful!',
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
});

// ==========================================
// ROUTE: GET /api/auth/profile
// DESC:  Returns logged-in user's profile data
// ACCESS: Private (requires valid JWT token)
// ==========================================
const protect = require('../middleware/authMiddleware');

router.get('/profile', protect, async (req, res) => {
  try {
    // req.user was set by the protect middleware after verifying the token
    // We query MongoDB to get the latest user data (excluding the password field)
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      message: 'Welcome to your dashboard!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Profile error:', error);
    return res.status(500).json({ message: 'Server error fetching profile' });
  }
});

module.exports = router;
