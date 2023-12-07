const User=require('../models/userModel')
const Category= require('../models/categoryModel')
const Product=require('../models/productModel')
const bcrypt=require('bcrypt')
const Cart = require('../models/cartModel')
const Order=require('../models/orderModel')


const loadOrders=async(req,res)=>{
   try {
   const userId= req.session.userId
 const userData= await Order.find({user_id:userId}).sort({ date: -1 });


 res.render('orders',{userData,user:userData})
   } catch (error) {
      console.log(error.message);
   }
}



const patchCancelOrder=async(req,res)=>{
      try {
        console.log('hiii');
        const {orderId}=req.body
        console.log('iam orderid'+orderId);
       const statusOfOrder = 'Cancelled'
         const orderData= await Order.findOne({_id:orderId}).populate('items.product_id')
         console.log('hellobro'+orderData);
         await Order.updateOne({_id:orderId},{$set:{status:statusOfOrder}})
         for (let products of orderData.items) {
         await Product.updateOne({_id:products.product_id},{$inc:{stockQuantity:products.quantity}})
         }
         res.send({success:true,status:statusOfOrder})

    
      } catch (error) {
        console.log(error.message)
      }
}



const loadViewOrdered=async(req,res)=>{
     try {
      const orderId = req.query.id
     const userId= req.session.userId
  const user= await  User.findOne({_id:userId})
  const orders= await Order.findOne({_id:orderId}).populate('items.product_id')
      res.render('viewOrdered',{orders,user})
     } catch (error) {
      console.log(error.message);
     }
}








module.exports={
  loadOrders,
  patchCancelOrder,
    loadViewOrdered
}