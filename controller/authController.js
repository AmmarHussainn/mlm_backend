// const User = require('../models/user');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');

// exports.register = async (req, res) => {
//   try {
//     const { username, email, password, contactInformation, role } = req.body;

//     // Check if the user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: 'User with this email already exists' });
//     }

//     // Create a new user
//     const newUser = new User({
//       username,
//       email,
//       password,
//       contactInformation,
//       role: role || 'user', // Set a default role if not provided
//     });

//     // Save the user to the database
//     await newUser.save();

//     res.status(201).json({ message: 'User registered successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

// // Login a user
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Find the user by email
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Compare the provided password with the stored hashed password
//     const isPasswordMatch = await user.comparePassword(password);
//     if (!isPasswordMatch) {
//       return res.status(401).json({ message: 'Incorrect password' });
//     }

//     // Check if the user's role is either "user" or "admin"
//     if (!user.role || (user.role !== 'user' && user.role !== 'admin')) {
//       return res.status(403).json({ message: 'Unauthorized access' });
//     }

//     // Send the role information in the response
//     res.status(200).json({ message: 'Login successful', role: user.role, username: user.username });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// User registration
exports.register = async (req, res) => {
  try {
    const { username, email, password, role, contactInformation } = req.body;

    // Check if the email is already in use
    const existingUserWithEmail = await User.findOne({ email });
    if (existingUserWithEmail) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create a new user with a default status of 'Pending'
    const newUser = new User({
      username,
      email,
      password,
      role: role || 'user',
      contactInformation,
      status: 'Pending',
    });

    await newUser.save();

    res.status(201).json({
      message: 'User registration request submitted successfully',
      user: {
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        contactInformation: newUser.contactInformation,
        status: newUser.status,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



// Approve a user registration
exports.approveUser = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.status !== 'Pending') {
      return res.status(400).json({ message: 'User is not in a pending state' });
    }

    user.status = 'Approved';
    await user.save();

    res.status(200).json({
      message: `User registration ${user.status.toLowerCase()} successfully`,
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Reject a user registration
exports.rejectUser = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.status !== 'Pending') {
      return res.status(400).json({ message: 'User is not in a pending state' });
    }

    user.status = 'Rejected';
    await user.save();

    res.status(200).json({
      message: `User registration ${user.status.toLowerCase()} successfully`,
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Assign subscription to a user
exports.assignSubscription = async (req, res) => {
  try {
    const { email } = req.params;
    const { subscriptionPrice } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user's status is 'Approved'
    if (user.status !== 'Approved') {
      return res.status(400).json({ message: 'User is not approved, subscription cannot be assigned' });
    }

    // Assign subscription logic (you may want to save subscriptionPrice to user object or elsewhere)
    // For example, you can save it to the user object:
    user.subscriptionPrice = subscriptionPrice;

    // Save the updated user
    await user.save();

    // Send a response with the user's details, status, and a success message
    res.status(200).json({
      message: `Subscription assigned to user ${email} successfully`,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status, // Include the status in the response
      subscriptionPrice: user.subscriptionPrice,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Login a user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user's status is 'Approved' before allowing login
    if (user.status !== 'Approved') {
      return res.status(401).json({ message: 'User registration is pending approval' });
    }

    // Compare the provided password with the stored hashed password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // Check if the user's role is either "user" or "admin"
    if (!user.role || (user.role !== 'user' && user.role !== 'admin')) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // Send the role and status information in the response
    res.status(200).json({
      message: 'Login successful',
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

