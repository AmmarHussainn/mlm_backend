// Import necessary modules
const express = require('express');
const router = express.Router();
const UserController = require('../controller/authController');

// Define routes

// User registration
router.post('/register', UserController.register);

// Get a list of registered users
router.get('/users', UserController.getUsers);

// Approve a user registration
router.put('/approve/:email', UserController.approveUser);

// Reject a user registration
router.put('/reject/:email', UserController.rejectUser);

router.put('/assignSubscription/:email', UserController.assignSubscription);

// Login a user
router.post('/login', UserController.login);

// Save referral code
router.post('/saveReferralCode', UserController.saveReferralCode);

// Export the router
module.exports = router;
