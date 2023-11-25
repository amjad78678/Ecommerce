const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const userOtpVerification = require('../models/userOtpVarification');
const nodemailer = require('nodemailer');
const dotenv=require('dotenv')
dotenv.config();

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
const postRegister = async (req, res) => {
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
    let otpVerification = await sentOtpVerificationMail(userData.email, userData._id)
    }
  } catch (error) {
    console.log(error.message);
  }
};

const sentOtpVerificationMail = async ({ _id, email }, res) => {
  console.log(_id +'email'+email)    //-----------------------------------------------------------------------
  try {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    //---------------NODEMAILER TRANSPORT
let transporter = nodemailer.createTransport({
  service:'gmail',
  host: 'smtp.gmail.com',
  port:587,
  secure:true,
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: 'gasd cdmy jhlt gnhf'
  },
});
    //mail---options-
    console.log(email);
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: 'Verify your email for Cornerstone',
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
    let verified = await newOtpVerification.save();
    await transporter.sendMail(mailOptions);
    res.redirect('/authentication')

    

  }catch (error) {
    
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
const verifyOtp=async(req,res)=>{
  try {
      let {userId,otp}= req.body
      if(!userId || !otp){
        res.render('userOtpRegister',{message:'Empty otp details are not allowed'})
      }else{
        const userOtpVerificationRecords= await userOtpVerification.find({userId})
        if (userOtpVerificationRecords.length<=0){
        //no-record found
       res.render('userOtpRegister',{message:'account record doesnt exist'})
        }else{
        console.log(userOtpVerificationRecords);  //------------------------------------------------------------
          //user otp record exists

        
        }
      }
  } catch (error) {
    console.log(error.message);
  }
}
module.exports = {
  loadHome,
  loadRegister,
  postRegister,
  loadLogin,
  loadOtp,
  verifyOtp
};