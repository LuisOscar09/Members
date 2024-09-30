const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  id: { type: String, required: false },
  balance: { type: Number, default: 0 },
  accessToken: { type: String, required: false },
  refreshToken: { type: String, required: false },
  email: { type: String, required: false }
});

module.exports = mongoose.model('User', UserSchema);
