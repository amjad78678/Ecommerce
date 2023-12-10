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
};const postRegister = async (req, res) => {
  try {
    const existingUser = await User.findOne({email:req.body.email})
    if (existingUser){
      res.render('userRegister',{message:'User already exists enter new details or  <a href="/userSignIn?id=existingUser._id">Login Now</a> '})//-------------------------------------------------------
      
    }else{
    const bodyPassword =req.body.password
    sPassword = await securePassword(bodyPassword);
    
    const user =new User({
      userName: req.body.userName,
      email: req.body.email,
      mobileNumber: req.body.mobileNumber,
      password: sPassword,
      confirmPassword: req.body.confirmPassword,
      is_Admin: 0,
      is_Blocked:false,
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
  const transporter = nodemailer.createTransport({
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
        html: `     <div style="font-family: Helvetica, Arial, sans-serif; min-width: 1000px; overflow: auto; line-height: 2">
        <div style="margin: 50px auto; width: 70%; padding: 20px 0">
          <div style="border-bottom: 1px solid #eee">
            <a href="" style="font-size: 1.4em; color: #82AE46; text-decoration: none; font-weight: 600">
              Cornerstone
            </a>
          </div>
          <p style="font-size: 1.1em">Hi,</p>
          <p>Thank you for choosing Cornerstone . Use the following OTP to complete your Sign Up procedures. OTP is valid for a few minutes</p>
          <h2 style="background: #82AE46; margin: 0 auto; width: max-content; padding: 0 10px; color: white; border-radius: 4px;">
            ${otp}
          </h2>
          <p style="font-size: 0.9em;">Regards,<br />Fresh Pick</p>
          <hr style="border: none; border-top: 1px solid #eee" />
          <div style="float: right; padding: 8px 0; color: #aaa; font-size: 0.8em; line-height: 1; font-weight: 300">
            <p>Fresh Pick</p>
            <p>1600 Ocean Of Heaven</p>
            <p>Pacific</p>
          </div>
        </div>
      </div>`,
      };

      //----hash-the-otp
  const saltRounds = 10;
  let hashedOtp = await bcrypt.hash(otp, saltRounds);
  const filter = { userId: _id };
  const update = {
  userId: _id,
  otp: hashedOtp,
  createdDate: Date.now(),
  expiresAt: Date.now() + 60000,
};

// Use findOneAndUpdate with upsert option
const result = await userOtpVerification.findOneAndUpdate(filter, update, {
  upsert: true,
  new: true, // If set to true, returns the modified document rather than the original
});

// If you want to access the saved or updated document, you can use 'result'
console.log(result);

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
    const resendLink=`/resend-otp?id=${id}`;
    // req.session.userId=req.query.id
    // console.log(`this is session${req.session.userId}`);
    res.render('userOtpRegister',{id:id,resendLink:resendLink});

  } catch (error) {
    console.log(error.message);
  }
};
const verifyOtp=async(req,res)=>{
  try {
    const Otp= req.body.Otp
    const userId=req.body.id
       const resendLink=`/resend-otp?id=${userId}`;

        console.log(`this is session ${userId}`);
        const userOtpVerificationRecords= await userOtpVerification.findOne({userId})
         
       
      
          //user otp record exists
         const {otp:hashedOtp}=userOtpVerificationRecords;
        // console.log(expiryDate);

         const expiresAt=userOtpVerificationRecords.expiresAt
         if (expiresAt < Date.now()) {

          //otp expired so
          res.render('userOtpRegister',{message:'OTP has expired, please request a new one',resendLink:resendLink})
         }
          const enteredOtp=Otp
          //compare the entered otp
          console.log(enteredOtp);
          console.log(hashedOtp);
           const validOtp = await bcrypt.compare(enteredOtp, hashedOtp);
             if(validOtp){
            req.session.userId=userId
             }else{
              
            //case otp invalid
               
             return res.render('userOtpRegister',{message:'Invalid Otp Please try again',resendLink:resendLink,id:userId})
             }

         
         //update user to mask is verified true
          await User.updateOne({_id:userId},{$set:{is_Verified:true }})
          //delete the used otp of otp database 
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
           
     const categoryName= req.query.name
     const category= await Category.find({})
     const userId=req.session.userId

        
        let product=[] 
      
        if(categoryName){
         product = await Product.find({category:categoryName})

         }else{
         product = await Product.find({})
         }
    
        // const  category= await Category.find({})
        let userData=await User.findOne({_id:req.session.userId})   
        res.render('productList',{user:userData,category:category,product:product,userId})

    
    
        
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


const deleteAddress=async(req,res)=>{
   try {
      
        const userId=req.session.userId
       const {addressId}= req.body
        await User.updateOne({_id:userId},{$pull:{address:{_id:addressId}}})
        res.send({success:true});
   } catch (error) {
    console.log(error.message);
     res.status(500).send({ success: false }); // Send an error response if deletion fails
   }
}

const loadProfileNewAddress = async(req,res)=>{
     try {
        res.render('profileNewAddress')
     } catch (error) {
      console.log(err.message);
     }
}

const postProfileNewAddress =async(req,res)=>{
      try {
        const {name,phone,streetAddress,city,state,pincode,email}=req.body

         const user =await User.findOne({_id:req.session.userId})
         if(user){
           await User.updateOne({_id:req.session.userId},{$push:{address:{
                name:name,
                phone:phone,
                street_address:streetAddress,
                city:city,
                state:state,
                pincode:pincode,
                email:email,


            }}})
            res.redirect('/userProfile')
         }else{
            res.redirect('/userSignIn')
         }
    } catch (error) {
        console.log(error.message);
    }
}


const postEditProfile=async(req,res)=>{
       try {
      
     const {profileUserId,profileName,profileMobile} = req.body
    await User.updateOne({_id:profileUserId},{$set:{userName:profileName,mobileNumber:profileMobile}})
    res.redirect('/userProfile')
        
       } catch (error) {
        console.log(error.message);
       }
}

const loadChangePassword=async(req,res)=>{
  try {
   const userId= req.session.userId
   const message=req.session.message
   req.session.message='' 
   const user= await User.findOne({_id:userId})
     

     res.render('changePassword',{user,message})
  } catch (error) {
    console.log(error.message);
  }
}


const postChangePasssword=async(req,res)=>{
      try {
      const {userId,currentPassword,newPassword,confirmNewPassword}= req.body 
         
    const userData=  await User.findOne({_id:userId})
    const passwordMatch=  await bcrypt.compare(currentPassword,userData.password)

    if(passwordMatch){
      if(newPassword===confirmNewPassword){
        const hashedPassword=await bcrypt.hash(newPassword,10)
         await User.updateOne({_id:userId},{$set:{password:hashedPassword}})
         res.redirect('/userProfile')
      }else{
        req.session.message='Password doesnt match'
        res.redirect('/changePassword')
      }
      
     
    }else{
      req.session.message='Password doesnt match'
      res.redirect('/changePassword')
    }
          
      } catch (error) {
        console.log(error.message)
      }
}



// Add a new route for OTP resend
const resendOtp=async (req, res) => {
  try {
    const id = req.query.id;
  const user= await User.findOne({_id:id})
    
    // Fetch user details based on the userId

    // Resend OTP verification email
    await sentOtpVerificationMail(user, res);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
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
  userLogout,
  loginWithOtp,
  verifyLoginWithOtp,
  loadProductList,
  loadEmailVerifyAfter,
  postEmailVerifyAfter,
  loadProductDetail,
  loadProfile,
  loadEditProfileAddress,
  postEditAddress,
  deleteAddress,
  loadProfileNewAddress,
  postProfileNewAddress,
  postEditProfile,
  loadChangePassword,
  postChangePasssword,
  resendOtp,
};