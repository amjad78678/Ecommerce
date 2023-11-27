const mongoose = require('mongoose');

const userOtpVerificationSchema = new mongoose.Schema({
  userId: {
    type: String,
  },
  otp: {
    type: String,
  },
  createdDate: {
    type: Date,default:Date.now()
  }
});
userOtpVerificationSchema.index({ createdDate: 1 }, { expireAfterSeconds: 60 });
  

module.exports = mongoose.model(
  'userOtpVerification',
  userOtpVerificationSchema,
);

