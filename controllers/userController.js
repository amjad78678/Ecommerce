const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const userOtpVerification = require('../models/userOtpVarification');
const nodemailer = require('nodemailer');

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};
const loadHome = async (req, res) => {
  try {
    res.render('userHome');
  } catch (error) {
    console.log(error.message);
  }
};

const loadRegister = async (req, res) => {
  try {
    res.render('userRegister');
  } catch (error) {
    console.log(error.message);
  }
};
const insertUser = async (req, res) => {
  try {
    sPassword = await securePassword(req.body.password);
    sConfirmPassword = await securePassword(req.body.confirmPassword);
    const user = User({
      userName: req.body.userName,
      email: req.body.email,
      mobileNumber: req.body.mobileNumber,
      password: sPassword,
      confirmPassword: sConfirmPassword,
      is_Admin: 0,
      is_Verified: false,
    });
    const userData = await user.save().then((result) => {
      sentOtpVerificationMail(result, res);
    });
    if (userData) {
      res.render('userRegister', { message: 'Your registration sucessfull' });
    } else {
      res.render('userRegister', { message: 'Your registration failed' });
    }
  } catch (error) {
    console.log(error.message);
  }
};
//---------------NODEMAILER TRANSPORT
let transporter = nodemailer.createTransport({
  host: 'smtp-mail.outlook.com',
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
});
const sentOtpVerificationMail = async ({ _id, email }, res) => {
  try {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    //mail---options-------------------
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: 'Verify your email',
      html: `<p>Enter <b>${otp} </b>in the app to verify your email address and complete your registration </p><p>This code <b>expires in 1 hour</b></p>`,
    };

    //----hash-the-otp
    const saltRounds = 10;
    let hashedOtp = await bcrypt.hash(otp, saltRounds);
    const newOtpVerification = new userOtpVerification({
      userId: _id,
      otp: hashedOtp,
      createdDate: Date.now(),
      expiryDate: Date.now() + 3600000,
    });
    //----save otp record
    let userData = await newOtpVerification.save();
    await transporter.sendMail(mailOptions);
    res.json({
      status: 'PENDING',
      message: 'Verification otp email sent',
      data: {
        userId: _id,
        email,
      },
    });
  } catch (error) {
    res.json({
      status: 'FAILED',
      message: error.message,
    });
    console.log(error.message);
  }
};
const loadLogin = async (req, res) => {
  try {
    res.render('userSignIn');
  } catch (error) {
    console.log(error.message);
  }
};
const loadOtp = async (req, res) => {
  try {
    res.render('userOtpRegister');
  } catch (error) {
    console.log(error.message);
  }
};
module.exports = {
  loadHome,
  loadRegister,
  insertUser,
  loadLogin,
  loadOtp,
};
