const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  name: { type: String, default: 'Fighter' },
  picture: { type: String, default: '' },
  googleId: { type: String, default: '' },
  walletAddress: { type: String, default: '' },
  arxBalance: { type: Number, default: 0 },
  solBalance: { type: Number, default: 0 },
  referralCode: { type: String, unique: true },
  referredBy: { type: String, default: '' },
  totalReferrals: { type: Number, default: 0 },
  earningSessions: { type: Number, default: 0 },
  totalFights: { type: Number, default: 0 },
  totalWins: { type: Number, default: 0 },
  totalLosses: { type: Number, default: 0 },
  loginMethod: { type: String, enum: ['google', 'wallet', 'phantom', 'guest'], default: 'guest' },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now }
});

// Generate unique 6-char referral code before save
userSchema.pre('save', function(next) {
  if (!this.referralCode) {
    this.referralCode = this._id.toString().slice(-6).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
