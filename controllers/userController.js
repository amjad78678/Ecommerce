const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const userOtpVerification = require('../models/userOtpVarification');
const Category= require('../models/categoryModel')
const Order= require('../models/orderModel')
const Product=require('../models/productModel')
const nodemailer = require('nodemailer');
const dotenv=require('dotenv')
const mongoose = require('mongoose');
const Cart=require('../models/cartModel');
const { search } = require('../routes/userRoute');
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
    console.log(req.body);
   
const existingUser = await User.findOne({ email: req.body.email, is_Verified: { $eq: true } })

console.log('iam exist user',existingUser);
   if(existingUser){

     return res.json({ message: "User already exists." });
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
          <p style="font-size: 0.9em;">Regards,<br />Cornerstone</p>
          <hr style="border: none; border-top: 1px solid #eee" />
          <div style="float: right; padding: 8px 0; color: #aaa; font-size: 0.8em; line-height: 1; font-weight: 300">
            <p>Cornerstone</p>
            <p>Ocean Of Heaven</p>
            <p>Omanoor</p>
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
  
    console.log('iamidmwone',_id);
 

    res.send({success:true,id:_id})

      

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
   
     
   await User.findOne({is_Verified:false})
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
 

      console.log('queryid'+req.query.id);
      console.log('bodyid'+req.body.id);

      console.log('lastOtp'+Otp);


          console.log(`this is session ${userId}`);
          const userOtpVerificationRecords= await userOtpVerification.findOne({userId:userId})
          
         console.log('iamverificqtionrecords'+userOtpVerificationRecords);

         if (!userOtpVerificationRecords) {
    // Handle the case where no matching record is found
    return res.json({ message: "User not found or verification record does not exist." });
  }
        
           const {otp:hashedOtp}=userOtpVerificationRecords;
          
            //user otp record exists
        
          // console.log(expiryDate);

          const expiresAt=userOtpVerificationRecords.expiresAt
          if (expiresAt < Date.now()) {

            //otp expired so
            return res.json({ message: "Otp expired resent otp" });
          }
            const enteredOtp=Otp
            //compare the entered otp
            console.log(enteredOtp);
            console.log(hashedOtp);
            const validOtp = await bcrypt.compare(enteredOtp, hashedOtp);
        
              if(validOtp){
              req.session.userId=userId
              //update user to mask is verified true
              await User.updateOne({_id:userId},{$set:{is_Verified:true }})
               return res.json({ success:true });
              //delete the used otp of otp database 
              
              }else{
                
              //case otp invalid
                
              return res.json({ message: "Otp doesnt match" });

              }

            
          

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

const loadProductList = async (req, res) => {
    try {
        let { searchInput, minPrice, maxPrice,selectedCateg,pageno } = req.body;

        if (searchInput || minPrice || maxPrice ||selectedCateg||pageno) {
            if (searchInput) {
                let isSearch = await Product.find({
                    name: { $regex: searchInput, $options: 'i' },
                });

                if (isSearch.length > 0) {
                    req.session.searchInput = searchInput;
                }
            }

            if (minPrice && maxPrice) {
                let productsInRange = await Product.find({
                    price: { $gte: minPrice, $lte: maxPrice },
                });


                if (productsInRange.length > 0) {
                    req.session.minPrice = minPrice;
                    req.session.maxPrice = maxPrice;
                }
            }
            if(selectedCateg=='All'){
            const allProduct= await Product.find({})
            if(allProduct.length>0){
              req.session.allProduct=true
            }
           
            }else{

            const selectedCat= await Product.find({category:selectedCateg})
            console.log(selectedCat);
            if (selectedCat.length>0){
              req.session.selectedCategory=selectedCateg
              req.session.allProduct=false
            }
            }

            if(pageno){
              req.session.pageno=pageno
            }
             

         return res.json({ success: true });
        } else {
            let condition = {};
            

            if (req.session.searchInput) {
                condition.name = {
                    $regex: req.session.searchInput,
                    $options: 'i',
                };
                delete req.session.searchInput;
            }

            

            if (req.session.minPrice !== undefined && req.session.maxPrice !== undefined) {
                condition.price = {
                    $gte: req.session.minPrice,
                    $lte: req.session.maxPrice,
                };
                delete req.session.minPrice;
                delete req.session.maxPrice;
            }
            if (req.session.selectedCategory) {
                // If there's a category filter, apply it
              condition.category=req.session.selectedCategory;
              delete req.session.selectedCategory
              }else if(req.session.allProduct){
                delete req.session.allProduct
              }

console.log('Before skip calculation - pageno:', req.session.pageno);

let page = 1; // Default to page 1
let skip = 0;

if (req.session.pageno) {
  page = req.session.pageno;
  skip = (page - 1) * 6;
  console.log('Page:', page);
  console.log('Calculated skip:', skip);
  delete req.session.pageno;
}

        

            let product = [];

            
             if (condition.name || condition.price ||condition.category) {
                // If there's a search or price condition, apply it to all products
                product = await Product.find(condition).skip(skip).limit(6)
            } else {
                // If no filters are specified, get all products
                product = await Product.find({}).skip(skip).limit(6)
            }
             
            
            const productsCount=await Product.find(condition).count()
            console.log('procount'+productsCount);
            let totalPages=Math.ceil(productsCount/6)
            const count=await Product.find(condition).count()
            const currentPage='productList'

            console.log('Skip:', skip);

            console.log('Number of products:', product.length);

            const category = await Category.find({});
            const userId = req.session.userId;
        // const  category= await Category.find({})
        let userData=await User.findOne({_id:req.session.userId})   
        res.render('productList',{user:userData,category:category,product:product,userId,currentPage,count,productsCount,totalPages})

  
  }

        
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



const resendOtp = async (req, res) => {
  try {
    const id = req.body.id;
    console.log('dsofiodiouseId'+id);
    const user = await User.findOne({ _id: id });
     console.log('euryuriam user'+user);
    // Fetch user details based on the userId

    // Resend OTP verification email
    await sentOtpVerificationMail(user,res);


  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}






const verifyPayment=async(req,res)=>{
  try {

    const cartData=await Cart.findOne({user_id:req.session.userId})
    const cartProducts= cartData.items
    const details =req.body 

  console.log(details);

const crypto = require('crypto');

// Your secret key from the environment variable
const secretKey = process.env.RAZ_KEYSECRET;

// Creating an HMAC with SHA-256
const hmac = crypto.createHmac('sha256', secretKey);
console.log(hmac);

// Updating the HMAC with the data
hmac.update(details.payment.razorpay_order_id + '|' + details.payment.razorpay_payment_id );

// Getting the hexadecimal representation of the HMAC
const hmacFormat = hmac.digest('hex');

console.log(hmacFormat);
console.log(details.payment.razorpay_signature);
       if (hmacFormat==details.payment.razorpay_signature){
        await Order.findByIdAndUpdate({_id:details.order.receipt},{$set:{paymentId:details.payment.razorpay_payment_id}})
       

       for(let i=0;i<cartProducts.length;i++){
        let count=cartProducts[i].quantity
       await Product.findByIdAndUpdate({_id:cartProducts[i].product_id},{$inc:{stockQuantity:-count}})
       }

       await Order.findByIdAndUpdate({_id:details.order.receipt},{$set:{status:'placed'}})

 
      const userData= await User.findOne({_id:req.session.userId})
        await Cart.deleteOne({user_id:userData._id})

         res.json({success:true, params:details.order.receipt })

       }else{
        await Order.findByIdAndDelete({_id:details.order.receipt})
         res.json({ success: false }); 
       }



   
  } catch (error) {
    console.log(error.message);
  }
}


const loadWalletHistory=async(req,res)=>{
   try {
    const {userId}=req.session
   const userData=await User.findOne({_id:req.session.userId})

   console.log(req.session.userId);
   const walletHistory = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      {$project:{wallet_history:1}},
      { $unwind: "$wallet_history" },
      { $sort: { "wallet_history.date": -1 } },
    ]);
console.log('walletHistorires'+walletHistory);
      res.render('wallet',{user:userData,walletHistory})
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
  verifyPayment,
  loadWalletHistory
};