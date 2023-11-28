const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  confirmPassword: {
    type: String,
    required: true,
  },
  is_Admin: {
    type: Number,
    required: true,
  },
  is_Verified: {
    type: Boolean,
  },
  is_Blocked:{
    type:Boolean,
  }
});

module.exports = mongoose.model('User', userSchema);
