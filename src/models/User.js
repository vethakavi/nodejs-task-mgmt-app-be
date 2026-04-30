// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: { type: Number },
  bio: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);