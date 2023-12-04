const User=require('../models/userModel')
const Category= require('../models/categoryModel')
const Product=require('../models/productModel')
const bcrypt=require('bcrypt')
const Cart = require('../models/cartModel')
const Order = require('../models/orderModel')



 const loadCheckout=async(req,res)=>{
          try {
            
              const userId=req.session.userId
              const cart= await Cart.findOne({user_id:userId}).populate({path:'items.product_id'})
              if(userId && cart ){
           


      let originalAmts = 0;

      if (cart && cart.items) {
        cart.items.forEach((cartItem) => {
          let itemPrice = cartItem.price;  // Adjust the property based on your data model
          originalAmts += itemPrice * cartItem.quantity;
        });
      }

            const user= await User.findOne({_id:req.session.userId})
   

            res.render('checkout',{cart,subTotal:originalAmts,user:[user]})
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
                   
 const status=selectedPayment=='cod'?'placed':'pending'
   

   const userData=await User.findOne({_id:userId})
   console.log(userData);

   const cartData=  await Cart.findOne({user_id:userId})
   const cartProducts=  cartData.items
   console.log(cartProducts);

   const date=new Date()
   const orderDate=date.toLocaleString()

   const delivery=new Date(date.getTime()+(10 * 24 * 60 * 60 * 1000))
   const deliveryDate=delivery.toLocaleString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }).replace(/\//g, '-')

    
   const order=new Order({

        user_id:userId,
        delivery_address:selectedAddress,
        user_name:userData.userName,
        total_amount:subTotal,
        status:status,
        date:orderDate,
        expected_delivery:deliveryDate,
        payment:selectedPayment,
        items:cartProducts



   })
   let orderData= await order.save()
   const orderId=orderData._id

   if(orderData.status=='placed'){
    await  Cart.deleteOne({user_id:userId})

    for(i=0;i<cartData.items.length;i++){
      const productId=cartProducts[i].product_id
      console.log('iamproductids'+productId);
      const count=cartProducts[i].quantity
       console.log('iamcountsis'+count);

     await Product.findByIdAndUpdate({_id:productId},{$inc:{stockQuantity:-count}})
    }
      res.json({success:true,params:orderId})
    
   }

      } catch (error) {
        console.log(error.message);
      }
}


const loadOrderPlaced=async(req,res)=>{
   try {

    const orderId=req.params.id
    const userId=req.session.userId


      res.render('orderPlaced',{orderId:orderId,user:userId})

   } catch (error) {
    console.log(error.message);
   }
}




module.exports={
    loadCheckout,
    loadAddNewAddress,
    postAddNewAddress,
    loadOrderPlaced,
    postOrderPlaced

}