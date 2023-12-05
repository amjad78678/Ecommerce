const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const userOtpVerification = require('../models/userOtpVarification');
const Category= require('../models/categoryModel')
const Product=require('../models/productModel')
const nodemailer = require('nodemailer');
const dotenv=require('dotenv')
const mongoose = require('mongoose');
const Cart=require('../models/cartModel')
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
    
    
      const userData=await User.findOne({_id:req.session.userId})
      console.log(req.session.userId);
      res.render('userHome',{user:userData});
    
    }  catch (error) {
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
      res.render('userRegister',{message:'User already exists enter new details or  <a href="/userSignIn?id=existingUser._id">Login Now</a> '})//-------------------------------------------------------
      
    }else{
    sPassword = await securePassword(req.body.password);
    sConfirmPassword = await securePassword(req.body.confirmPassword);
    const user =new User({
      userName: req.body.userName,
      email: req.body.email,
      mobileNumber: req.body.mobileNumber,
      password: sPassword,
      confirmPassword: sConfirmPassword,
      is_Admin: 0,
      is_Blocked:false,
      is_Verified: false,
    });
    if (req.body.password!==req.body.confirmPassword){
     res.render('userRegister',{message:'Password doesnt match enter again'})
    }else{
    const userData = await user.save().then((result) => {
      sentOtpVerificationMail(result, res);
    });

    if (userData) {
      await sentOtpVerificationMail(userData.email, userData._id)
    }
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
        html: `<p>Enter <b>${otp} </b>in the app to verify your email address and complete your registration </p><p>This code <b>expires in 2 minutes</b></p>`,
      };

      //----hash-the-otp
      const saltRounds = 10;
      let hashedOtp = await bcrypt.hash(otp, saltRounds);
      const newOtpVerification = new userOtpVerification({
        userId: _id,
        otp: hashedOtp,
        createdDate: new Date()
      // expiryDate: Date.now() + 300000,
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
    User.findOne({is_Verified:false})
    const id = req.query.id
    // req.session.userId=req.query.id
    // console.log(`this is session${req.session.userId}`);
    res.render('userOtpRegister',{id:id});

  } catch (error) {
    console.log(error.message);
  }
};
const verifyOtp=async(req,res)=>{
  try {
    const Otp= req.body.Otp
    const userId=req.body.id
     
     
        console.log(`this is session ${userId}`);
        const userOtpVerificationRecords= await userOtpVerification.find({userId})
     
        if(!userOtpVerificationRecords.length){
          return res.render('userOtpRegister',{ message:  `Otp expired <a href="/emailVerifyAfter" style="color:blue;">verifyOtp</a> `  })
        }
      
          //user otp record exists
         const {otp:hashedOtp}=userOtpVerificationRecords[0];
        // console.log(expiryDate);
        //  if (expiryDate < Date.now()) {

        //   //otp expired so
        //   res.render('userOtpRegister',{message:'OTP has expired, please request a new one'})
        //  }
          const enteredOtp=Otp
          //compare the entered otp
          console.log(enteredOtp);
          console.log(hashedOtp);
           const validOtp = await bcrypt.compare(enteredOtp, hashedOtp);
          if (userId){
            req.session.userId=userId
          }
           if(!validOtp){
            //case otp invalid
           return res.render('userOtpRegister',{message:'Invalid Otp Please try again'})
           }

         
         //update user to mask is verified true
          await User.updateOne({_id:userId},{$set:{is_Verified:true }})
          //delete the used otp of otp database 
          await userOtpVerification.deleteOne({userId})
          return res.redirect('/home')
        
      
 

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
      //checking is verify or not ----------------------------------------
      if (passwordMatch){
        if(userData.is_Verified===true){
        req.session.userId=userData._id
        req.session.email=userData.email
        res.redirect('/')


        }else{
          await User.deleteOne({_id:userData._id})
          //---------------data query kittaaaaan-----------
              //  await sentOtpVerificationMail(userData._id,userData.email,res)
              //  await sentOtpVerificationMail(user.email, user._id)
          res.render('userSignIn',{message:'Account not verified ,please register now <a href="/userRegister">Register Now</a>'})
        }

       
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
         req.session.destroy()
         res.redirect('/')
      } catch (error) {
        console.log(error.message);
      }
    }
    const loginWithOtp=async(req,res)=>{
            try {

                res.render('loginWithOtp')
            } catch (error) {
              console.log(error.message);
            }
    }

    const verifyLoginWithOtp=async(req,res)=>{
         try {

      const userData = await User.findOne({email:req.body.email });
        if(!userData){
          res.render(loginWithOtp,{message:'You havent signed up or verified your account yet.'})
        }else{
          if(userData.is_Verified===true){
             // req.session.userId=userData._id
             sentOtpVerificationMail(userData,res)
          }
        
        }
         } catch (error) {
           console.log(error.message);
         }
    }

    const loadProductList=async(req,res)=>{
      try {
           
        const product=await Product.find({})
        const  category= await Category.find({})
        let userData=await User.findOne({_id:req.session.userId})   
        res.render('productList',{user:userData,category:category,product:product})

    
    
      } catch (error) {
        console.log(error.message);
      }
    }


    const loadEmailVerifyAfter=async(req,res)=>{
       try {
        
        res.render('emailVerifyAfter')
       } catch (error) {
        console.log(error.message);
       }
    }

       const postEmailVerifyAfter=async(req,res)=>{
         try {
               
      const userData = await User.findOne({email:req.body.email });
        if(userData){
           sentOtpVerificationMail(userData,res)
        }else{
          res.render('emailVerifyAfter',{message:'You havent signed up or verified your account yet.'})
          
        
        }
         } catch (error) {
           console.log(error.message);
         }
    }

    const loadProductDetail=async(req,res)=>{
      try {
        const id=req.query.id
        console.log('hellobruda'+id);
        const userData=await User.findOne({_id:req.session.userId})
        const productAll=await Product.find({})
        const  productOne= await Product.findOne({_id:id})
        res.render('productDetail',{product:productOne,productAll:productAll,user:userData})
      } catch (error) {
        console.log(error.message);
      }
    }

  const loadProfile=async(req,res)=>{
        try {
          const userId=req.session.userId
      
          if(userId){
          const user= await User.findOne({_id:userId})
          const addresses= user.address
           console.log(addresses);
            res.render('profile',{user,addresses})
          }else{
            res.redirect('/userSignIn')
          }
     

        } catch (error) {
            console.log(error.message);
        }
  }

  const loadEditProfileAddress = async (req, res) => {
  try {
    const { userId, addressId} = req.query;
    const addAddressDetails = await User.findOne(
      { _id: userId, "address._id": addressId },
      { "address.$": 1 } // Use  to get the matched address in the array
    );
    

    console.log('iam addaddress', addAddressDetails);

    res.render("editProfileAddress", { addAddressDetails});
  } catch (error) {
    console.log(error.message);
  }
};
const postEditAddress=async(req,res)=>{
     try {
         
    //  const userId= req.query.userId
    //  const addressId=req.query.addressId

     const {name,phone,streetAddress,city,state,pincode,email,userId,addressId}=req.body
       
      await User.updateOne({_id:userId,'address._id':addressId},{$set:{
        'address.$.name':name,
        'address.$.phone':phone,
        'address.$.street_address':streetAddress,
        'address.$.city':city,
        'address.$.state':state,
        'address.$.pincode':pincode,
        'address.$.email':email

      }})
      res.redirect('/userProfile')
           
     } catch (error) {
      console.log(error.message);
     }
}



  //  const userResendOtp =async(req,res)=>{
  //       try {
  //         res.render('userOtpRegister')
  //       } catch (error) {
  //         console.log(error.message);
  //       }
  //  }
  //   const postUserResendOtp=async(req,res)=>{
  //     try {
  //         let {userId,email}=req.body
  //         console.log('this'+userId);
  //         console.log(email);
  //         if(!userId || !email){
  //           res.render('userOtpRegister',{message:'Empty user details are not allowed'})
  //         }else{
  //           //delete existing records and resend

  //            await userOtpVerification.deleteMany({userId})
  //            sentOtpVerificationMail({_id:userId,email})
  //         }
  //     } catch (error) {
  //       console.log(error.message);
  //     }
  //   }



module.exports = {
  loadHome,
  loadRegister,
  postRegister,
  loadLogin,
  loadOtp,
  verifyOtp,
  verifyLogin,
  userLogout,
  loginWithOtp,
  verifyLoginWithOtp,
  loadProductList,
  loadEmailVerifyAfter,
  postEmailVerifyAfter,
  loadProductDetail,
  loadProfile,
  loadEditProfileAddress,
  postEditAddress
 
};