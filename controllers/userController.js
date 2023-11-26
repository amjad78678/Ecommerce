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
    
    if (req.session.userId){
      const userData=await User.findById({_id:req.session.userId})
        console.log(req.session.userId);
      res.render('userHome',{user:userData});
    
    }
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
    const existingUser = await User.findOne({email:req.body.email})
    if (existingUser){
      res.render('userRegister',{message:'User already exists enter new details'})
      
    }else{
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
      await sentOtpVerificationMail(userData.email, userData._id)
    }
  } 
}
  catch (error) {
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
    
    await newOtpVerification.save();
    await transporter.sendMail(mailOptions);
    res.redirect(`/authentication?id=${_id}`)

    

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
    req.session.userId=req.query.id
    console.log(req.session.userId);
    res.render('userOtpRegister');

  } catch (error) {
    console.log(error.message);
  }
};
const verifyOtp=async(req,res)=>{
  try {
    const {Otp}= req.body
    const userId=req.session.userId
      console.log(Otp);
      console.log(userId);
     
      if(!userId || !Otp){
       return res.render('userOtpRegister',{message:'Empty otp details are not allowed'})
      }
        const userOtpVerificationRecords= await userOtpVerification.find({userId})
        console.log(userOtpVerificationRecords);
        if(!userOtpVerificationRecords){
       return res.render('userOtpRegister',{message:'account record doesnt exist'})
        }
      
          //user otp record exists
         const {expiryDate,otp:hashedOtp}=userOtpVerificationRecords[0];
         console.log(hashedOtp);
         console.log(expiryDate);
         if (expiryDate<Date.now()){
          //otp expired so
          res.render('userOtpRegister',{message:'OTP has expired, please request a new one'})
         }
           const enteredOtp=Otp
          //compare the entered otp
           const validOtp=await bcrypt.compare(enteredOtp,hashedOtp)
           if(!validOtp){
            //case otp invalid
           return res.render('userOtpRegister',{message:'Invalid Otp Please try again'})
           }
         
         //update user to mask is verified true
          await User.updateOne({_id:userId},{$set:{is_Verified:true }})
          //delete the used otp of otp database 
          await userOtpVerification.deleteOne({userId})
          return res.redirect('/userSignIn')
        
      
 

  } catch (error) {
    console.log(error.message);
  }
}

const verifyLogin=async(req,res)=>{
     try {
    
      const password= req.body.password
      const email=req.body.email
     let userData=await User.findOne({email:email})
     if (userData){
      const passwordMatch= await bcrypt.compare(password,userData.password)
      if (passwordMatch){
        req.session.userId=userData._id
        res.redirect('/')
      }else{
        res.render('userSignIn',{message:'Email and password is incorrect'})
      }
     }else{
       res.render('userSignIn',{message:'Email and password is incorrect'})
     }
    

     } catch (error) {
      console.log(error.message);
     }
    }
    const userLogout=async(req,res)=>{
      try {
         req.session.userId=null
         res.redirect('/userSignIn')
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
  verifyOtp,
  verifyLogin,
  userLogout
};