const User=require('../models/userModel')
const Category= require('../models/categoryModel')
const Product=require('../models/productModel')
const bcrypt=require('bcrypt')
const Cart = require('../models/cartModel')
const Order=require('../models/orderModel')
const { default: mongoose } = require('mongoose')


const loadOrders = async (req, res) => {
  try {
    const userId = req.session.userId;


    var page = 1;
    if(req.query.page)[
      page=req.query.page
    ]

    const limit=7;

   
    const userData = await Order.find({ user_id: userId })
     
const aggrOrderData = await Order.aggregate([
  {
    $match: {
      user_id: new mongoose.Types.ObjectId(userId),
    },
  },
  {
    $sort: {
      date: -1,
    },
  },
   {
    $skip: (page - 1) * limit,
  },
  {
    $limit: limit * 1, // Convert limit to a number if it's a string
  },
 
]);

 console.log(aggrOrderData);

 const count= await Order.aggregate([{$match:{user_id:new mongoose.Types.ObjectId(userId)}},{$count:'totalCount'}])
 const totalCount = count.length > 0 ? count[0].totalCount : 0;
 console.log(totalCount);
const totalPages = Math.ceil(totalCount / limit);

    res.render('orders', {aggrOrderData, user: userData,totalPages,currentPage:page});
  } catch (error) {
    console.log(error.message);
  }
};




const patchCancelOrder=async(req,res)=>{
      try {
        console.log('hiii');
        const {orderId}=req.body
        console.log('iam orderid'+orderId);
        const statusOfOrder = 'cancelled'
         const orderData= await Order.findOne({_id:orderId}).populate('items.product_id')
         console.log('hellobro'+orderData);
         await Order.updateOne({_id:orderId},{$set:{status:statusOfOrder}})
         for (let products of orderData.items) {
         await Product.updateOne({_id:products.product_id},{$inc:{stockQuantity:products.quantity}})
         }
         if(orderData.payment=='razorPay'||orderData.payment=='cod'){
          await User.updateOne({_id:req.session.userId},
                               {$inc:{wallet:orderData.total_amount}, 
                                $push:{wallet_history:{date:new Date(),
                                amount:orderData.total_amount,
                                description:`Refunded for Order cancel - Order ${orderId}`,
                              }}})

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
  const userData= await  User.findOne({_id:userId})
  const orders= await Order.findOne({_id:orderId}).populate('items.product_id')

  console.log('ordersofjhs',orders);

    var status = 0;
        if (orders.status == 'pending') {
            status = 1;
        } else if (orders.status.toString() == 'placed') {
            status = 2;
        } else if (orders.status == 'dispatched') {
            status = 3;
        } else if (orders.status == 'delivered') {
            status = 4;
        } else if (orders.status == 'returned') {
            status = 5;
        } else if (orders.status == 'cancelled') {
            status = 6;
        } else if (orders.status == 'pending for return approval') {
            status = 7
        }
      res.render('viewOrdered',{orders,user:userData,statuss:status})
     } catch (error) {
      console.log(error.message);
     }
}








module.exports={
  loadOrders,
  patchCancelOrder,
  loadViewOrdered
}