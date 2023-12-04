const User=require('../models/userModel')
const Category= require('../models/categoryModel')
const Product=require('../models/productModel')
const bcrypt=require('bcrypt')
const Cart = require('../models/cartModel')
const { ObjectId } = require('mongodb')




  const loadCart = async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      res.redirect('/userSignIn');
    } else {
      // Fetch cart details
      const cartDetails = await Cart.findOne({ user_id: userId }).populate({path:'items.product_id'});
      const userData = await User.findOne({ _id: userId });

      let originalAmts = 0; 

      if (cartDetails) {
          cartDetails.items.forEach((cartItem) => {
          let itemPrice = cartItem.price;  // Adjust the property based on your data model
          originalAmts += itemPrice * cartItem.quantity;
        });
      }

      res.render('cart', { user: userData, cartDetails, subTotal: originalAmts });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
  



const postAddToCart = async (req, res) => {
  try {
    const userId = req.session.userId;

    if (userId) {
      const productId = req.body.productId;
      const quantity = req.body.quantity || 1;

      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

     
      const totalPrice = product.price * quantity;
      const cart = await Cart.findOneAndUpdate(

        
        {
          user_id: userId,
          'items.product_id': productId
        },
        {
          $inc: { 'items.$.quantity': quantity ,'items.$.total_price':product.price}
         
        },
        { new: true }
      );

      if (!cart) {
        // If the product doesn't exist in the cart, add a new item
        await Cart.findOneAndUpdate(
          { user_id: userId },
          {
            $push: {
              items: {
                product_id: productId,
                quantity: quantity,
                price: product.price,
                total_price: totalPrice
              }
            }
          },
          { upsert: true, new: true }
        );
      }

      return res.json({ success: true });
    } else {
      return res.json({ success: false });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};



    const postDeleteItems=async(req,res)=>{
           try {
         const productOgId=req.body.productOgId
         const userId=req.session.userId

        const cartUser= await Cart.findOne({user_id:userId})
        if(cartUser.items.length==1){
           await Cart.deleteOne({user_id:userId})
        }else{
           await Cart.updateOne({user_id:userId},{$pull:{items:{_id:productOgId}}})
        }

         res.json({ success: true })


           } catch (error) {
            console.log(error.message);
           }
    }







const postChangeQuantity = async (req, res) => {
  try {
    const userId = req.session.userId;
    const productId = req.body.productId;
    const count = req.body.count;

    // Find the user's cart
    const cart = await Cart.findOne({ user_id: req.session.userId });
    if (!cart) {
      return res.json({ success: false, message: 'Cart not found.' });
    }

    // Find the product in the cart
    const cartProduct = cart.items.find((item) => item.product_id.toString() === productId);
    if (!cartProduct) {
      return res.json({ success: false, message: 'Product not found in the cart.' });
    }

    // Find the product in the database
    const product = await Product.findById(productId);
    if (!product) {
      console.log('Product not found in the database.');
      return res.json({ success: false, message: 'Product not found in the database.' });
    }



    if (count == 1) {
      // Increase quantity logic
      if (cartProduct.quantity < product.stockQuantity) {
        await Cart.updateOne(
          { user_id: userId, 'items.product_id': productId },
          { $inc: { 'items.$.quantity': 1,'items.$.total_price':product.price } }
        );
    
        return res.json({ success: true });
      } else {
    
        return res.json({
          success: false,
          message: `The maximum quantity available for this product is ${product.stockQuantity}. Please adjust your quantity.`,
        });
      }
    } else if (count == -1) { 
      // Decrease quantity logic
      if (cartProduct.quantity > 1) {
        await Cart.updateOne(
          { user_id: userId, 'items.product_id': productId },
           { $inc: { 'items.$.quantity': -1,'items.$.total_price': -product.price } }
        );  
    
        return res.json({ success: true });
      } else {
  
        return res.json({ success: false, message: 'Quantity cannot be less than 1.' });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};






    module.exports={
        postAddToCart,
        loadCart,
        postDeleteItems,
        postChangeQuantity

    }
