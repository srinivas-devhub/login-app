const mongoose = require('mongoose');

// Define the blueprint (Schema) for a User document in MongoDB
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true, // Prevents duplicate accounts with the same email
      lowercase: true, // Automatically converts email to lowercase
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      // Note: The actual plain text password will NEVER be stored here.
      // We will hash it using bcrypt before saving.
    },
  },
  {
    // Automatically creates and manages 'createdAt' and 'updatedAt' fields
    timestamps: true,
  }
);

// Create and export the User model based on userSchema
const User = mongoose.model('User', userSchema);

module.exports = User;
