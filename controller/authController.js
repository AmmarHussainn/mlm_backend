

const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


// Function to find a user by their email
const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

// Function to generate a random referral code
const generateReferralCode = () => {
  return Math.random().toString(36).substring(7);
};

// Function to handle referral rewards
const handleReferral = async (referralCode, referredUser) => {
  try {
    if (referralCode) {
      // Find the user who referred this user using the referral code
      const referrer = await User.findOne({ referralCode });

      if (referrer) {
        // Implement your referral reward logic here
        // For example, you can increment a referral count or provide some bonus to the referrer
        referrer.referralCount = (referrer.referralCount || 0) + 1;
        await referrer.save();

        // You can do more with the referredUser and referrer information here
        console.log(`Referred by: ${referrer.username}`);
      }
    }
  } catch (error) {
    console.error("Error handling referral:", error);
  }
};

// User registration
exports.register = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      role,
      contactInformation,
      referrerCode,
      referralCode,
    } = req.body;

    // Check if a referral code is provided, otherwise generate one
    const userReferralCode = referralCode || generateReferralCode();

    // Find the user who referred this user (if referrerCode is provided)
    const referrer = referrerCode ? await User.findOne({ referralCode: referrerCode }) : null;

    // Create a new user with the generated referral code and associate the referrer
    const newUser = new User({
      username,
      email,
      password,
      role: role || 'user',
      contactInformation,
      status: 'Pending',
      referredBy: referrerCode,
      referralCode: userReferralCode,
      referrer: referrer, // Reference to the referrer user
    });

    await newUser.save();

    // Call handleReferral function after the user is successfully registered
    await handleReferral(referralCode, newUser);

    res.status(200).json({
      message: 'User registration request submitted successfully',
      user: {
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        contactInformation: newUser.contactInformation,
        status: newUser.status,
        referredBy: newUser.referredBy,
        referralCode: newUser.referralCode, // Include the referral code in the response
        referrer: referrer ? referrer.username : null, // Include referrer information in the response
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Save referral code
// ... (other imports)

// Save referral code
// Save referral code
exports.saveReferralCode = async (req, res) => {
  console.log('===>', req.body)
  try {
    const { referralCode, id } = req.body;

    // Check if the user is logged in
    const loggedInUserId = req.user.id;

    if (!loggedInUserId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Find the user by ID
    const loggedInUser = await User.findById(loggedInUserId);

    if (!loggedInUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Associate the referral code with the currently logged-in user
    loggedInUser.referralCode = referralCode;
    console.log(loggedInUser)
    await loggedInUser.save();

    res.status(200).json({
      message: 'Referral code saved successfully',
      referralCode,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error saving referral code' });
  }
};


// ... (other functions)

// User registration
exports.register = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      role,
      contactInformation,
      referrerCode,
      referralCode,
    } = req.body;

    // Check if a referral code is provided, otherwise generate one
    const userReferralCode = referralCode || generateReferralCode();

    // Find the user who referred this user (if referrerCode is provided)
    const referrer = referrerCode ? await User.findOne({ referralCode: referrerCode }) : null;

    // Create a new user with the generated referral code and associate the referrer
    const newUser = new User({
      username,
      email,
      password,
      role: role || 'user',
      contactInformation,
      status: 'Pending',
      referredBy: referrerCode,
      referralCode: userReferralCode,
      referrer: referrer, // Reference to the referrer user
    });

    await newUser.save();

    // Call handleReferral function after the user is successfully registered
    await handleReferral(referralCode);

    res.status(200).json({
      message: 'User registration request submitted successfully',
      user: {
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        contactInformation: newUser.contactInformation,
        status: newUser.status,
        referredBy: newUser.referredBy,
        referralCode: newUser.referralCode, // Include the referral code in the response
        referrer: referrer ? referrer.username : null, // Include referrer information in the response
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ... (other endpoints)




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

