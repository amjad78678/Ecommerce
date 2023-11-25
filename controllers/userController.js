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
    console.log(email);//----------------------------------------------------------------------------
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
const loadOtpPage = async (req, res) => {
  try {
    res.render('userOtpRegister');
  } catch (error) {
    console.log(error.message);
  }
};
const postAuthentication=async(req,res)=>{
  try {
       let {otp,userId}=req.body
       console.log('otp'+otp+'userId'+userId);
     
        const userOtpVerificationRecords= await userOtpVerification.find({_id:userId})
        if(!userId || !otp){
          await User.deleteMany({_id:userOtpVerificationRecords[0].userId})
          await userOtpVerification.deleteMany({_id:userId});
          res.redirect('/authenticationPage')
        }else{

        }if (userOtpVerificationRecords.length<=0){
        //no-record found
       res.redirect('/authenticationPage')
        
        }else{
        console.log('2'+userOtpVerificationRecords);  //------------------------------------------------------------
       const { expiresAt } = userOtpVerificationRecords[0];
        const hashedOTP = userOtpVerificationRecords[0].otp;
          if (expiresAt < Date.now()) {
          await userModel.deleteMany({
            _id: UserOTPVerificationRecords[0].userId,
          });
          await userOtpVerification.deleteMany({ _id: userId });

          req.session.message = 'Invalid OTP,Please register again';
          res.redirect('/register');
        } else {
          const validOTP = await bcrypt.compare(otp, hashedOTP);

          if (!validOTP) {
            req.session.otpVerification = userVerificationId;
            req.session.message = 'Invalid OTP,Please try again';

            res.redirect('/emailVerificationpage');
          } else {
            // const user = await userModel.findOne({ _id: session })

            req.session.userId =
              UserOTPVerificationRecords[0].userId.toString();
            await userModel.updateOne(
              { _id: UserOTPVerificationRecords[0].userId },
              { $set: { is_verified: true } },
            );
            const userDetails = await userModel.findOne({
              _id: UserOTPVerificationRecords[0].userId.toString(),
            });
            req.session.user_id = userDetails;

            await userOtpVerification.deleteMany({ _id: userId });

            res.redirect('/login');
          }
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
  loadOtpPage,
  postAuthentication
};
