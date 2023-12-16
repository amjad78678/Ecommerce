const User=require('../models/userModel')
const Category= require('../models/categoryModel')
const Product=require('../models/productModel')
const bcrypt=require('bcrypt')
const Cart = require('../models/cartModel')
const Coupon = require('../models/couponModel')
const Order = require('../models/orderModel')
const Razorpay = require('razorpay');
const { default: mongoose } = require('mongoose')

var instance = new Razorpay({
  key_id: process.env.RAZ_KEYID,
  key_secret: process.env.RAZ_KEYSECRET,
});



 const loadCheckout=async(req,res)=>{
          try {
            
              const userId=req.session.userId
             
              const cart= await Cart.findOne({user_id:userId}).populate({path:'items.product_id'})
              req.session.couponApplied=false
              const availableCoupons=await Coupon.aggregate([{$match:{$and:[{status:true},{'userUsed.user_id':{$nin:[new mongoose.Types.ObjectId(userId)]}}]}}]) 
        if(userId && cart){
           

      let originalAmts = 0;

      if (cart && cart.items) {
        cart.items.forEach((cartItem) => {
          let itemPrice = cartItem.price;  // Adjust the property based on your data model
          originalAmts += itemPrice * cartItem.quantity;
        });
      }

            const user= await User.findOne({_id:req.session.userId})
              const wallet= user.wallet

            res.render('checkout',{cart,subTotal:originalAmts,user:[user],wallet,availableCoupons})
              }else{
                res.redirect('/')
              }
             
          } catch (error) {
            console.log(error.message);
          }
    }


    const loadAddNewAddress=async(req,res)=>{
             try {
              res.render('addNewAddress')
             } catch (error) {
              console.log(error.message);
             }
    }








const postAddNewAddress=async(req,res)=>{
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
            res.redirect('/checkout')
         }else{
            res.redirect('/userSignIn')
         }
    } catch (error) {
        console.log(error.message);
    }
}










const postOrderPlaced=async(req,res)=>{
      try {
  const {selectedAddress,selectedPayment,subTotal}=req.body
  
  const userId=req.session.userId
  console.log('iam coupon session',req.session.coupon);
                   
 const status=selectedPayment=='cod'||selectedPayment=='walletPayment'?'placed':'pending'


 

   const userData=await User.findOne({_id:userId})


   const cartData=  await Cart.findOne({user_id:userId})
   const cartProducts=  cartData.items

   console.log('iam cart products'+cartProducts);

   const date=new Date()
   const orderDate=date.toLocaleString()

   const delivery=new Date(date.getTime()+(10 * 24 * 60 * 60 * 1000))
   const deliveryDate=delivery.toLocaleString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }).replace(/\//g, '-')

   var couponName=''
   var couponDiscount=0
  if(req.session.coupon!=null){
   couponName=req.session.coupon.couponName
   couponDiscount=req.session.coupon.discountAmount 

  }
    
   const order=new Order({

        user_id:userId,
        delivery_address:selectedAddress,
        user_name:userData.userName,
        total_amount:subTotal,
        status:status,
        date:orderDate,
        expected_delivery:deliveryDate,
        payment:selectedPayment,
        items:cartProducts,
        couponName:couponName,
        couponDiscount:couponDiscount



   })
   let orderData= await order.save()
   const orderId=orderData._id

   if(orderData.status=='placed'){

      if(selectedPayment=='walletPayment'){
        if(userData.wallet>subTotal){
      await User.updateOne({_id:userId},{$inc:{wallet:-subTotal},$push:{wallet_history:{date:new Date(),amount:-subTotal,description:"Order Payment using Wallet Amount"}}})
    

       await  Cart.deleteOne({user_id:userId})

    for(i=0;i<cartData.items.length;i++){
      const productId=cartProducts[i].product_id

      const count=cartProducts[i].quantity
       console.log('iamcountsis'+count);
        
     await Product.updateOne({_id:productId},{$inc:{stockQuantity:-count}})
    }
    res.json({success:true,params:orderId})
  }else{
    res.json({walletFailed:true})
  }


      }else if(selectedPayment=='cod'){
    await  Cart.deleteOne({user_id:userId})

    for(i=0;i<cartData.items.length;i++){
      const productId=cartProducts[i].product_id

      const count=cartProducts[i].quantity
       console.log('iamcountsis'+count);
        
     await Product.updateOne({_id:productId},{$inc:{stockQuantity:-count}})
    }
    res.json({success:true,params:orderId})
  }
    
   }else{
    const orderId=orderData._id
    const totalAmount=orderData.total_amount
   
     var options={
      amount:totalAmount*100,  // Ensure amount is an integer
      currency:'INR',
      receipt:'' + orderId

     };

     instance.orders.create(options,function(err,order){
      if(err){
        console.log(err);
      }else{
        console.log('newOrders', JSON.stringify(order));
        return res.json({ success: false, order: order });
      }

     })
     
   }

      } catch (error) {
        console.log(error.message);
      }
}


const loadOrderPlaced=async(req,res)=>{
   try {

    const orderId=req.params.id
    const userId=req.session.userId
     req.session.coupon=null
    const order= await Order.findOne({_id:orderId})



      res.render('orderPlaced',{orderId:orderId,user:userId,orderId,order})

   } catch (error) {
    console.log(error.message);
   }
}

const applyCoupon=async(req,res)=>{
     try {
 const {couponCode,cartTotal} = req.body
const {userId}=req.session
const couponData=await Coupon.findOne({couponCode:couponCode})

req.session.coupon=couponData
let discountedTotal=0;
if(couponData){
  let currentDate=new Date()
  console.log('currnewdate',currentDate);

  let minAmount=couponData.minAmount
  if(cartTotal>couponData.minAmount){


    if(currentDate<=couponData.expiryDate && couponData.status!==false ){

    const id=couponData._id
    const couponUsed=await Coupon.findOne({_id:id,'userUsed.user_id':userId})
   if(couponUsed){
    console.log("this coupon is already used");
    res.send({usedCoupon:true})
   }else{
     if(req.session.couponApplied===false){
     const updateCouponUsed=  await Coupon.updateOne ({_id:id},{$push:{userUsed:{user_id:userId}}})
     await Coupon.updateOne({_id:id},{$inc:{Availability:-1}})
      discountedTotal=cartTotal-couponData.discountAmount
      let discountAmount=couponData.discountAmount
      req.session.couponApplied=true
      res.send({couponApplied:true,discountedTotal,discountAmount})
     }else{
      res.send({onlyOneTime:true})
     }
   }
  }else{
    console.log('Coupon expired');
    res.send({expired:true})
  }
}else{
  console.log(`you should purchase atleast ${cartTotal}`);
  res.send({shouldMinAmount:true,minAmount})
}
}else{
  console.log('Wrong Coupon');
  res.send({wrongCoupon:true})
}

console.log('coupondata',couponData);

  
     } catch (error) {
      console.log(error.message);
     }
}





module.exports={
    loadCheckout,
    loadAddNewAddress,
    postAddNewAddress,
    loadOrderPlaced,
    postOrderPlaced,
    applyCoupon

}