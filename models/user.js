const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  contactInformation: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  status: { type: String, default: 'Pending' },
  referredBy: { type: String, default: null }, // Field to store the referrer's code
  referralCode: { type: String }, // New field to store the user's referral code
  referrer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the referrer user
});

// Hash the password before saving to the database
userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password') || user.isNew) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      user.password = hashedPassword;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Method to compare passwords during login
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
