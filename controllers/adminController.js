const User=require('../models/userModel')
const Category= require('../models/categoryModel')
const Product=require('../models/productModel')
const Order=require('../models/orderModel')
const bcrypt=require('bcrypt')
  const path=    require('path')
const mongoose = require('mongoose');
const fs = require("fs");
const { OrderedBulkOperation } = require('mongodb');


const loadAdminLogin=async(req,res)=>{
    try {
        res.render('adminLogin')  
    } catch (error) {
        console.log(error.message);
    }
}


const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await User.findOne({ email: email });
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        if (userData.is_Admin === 0) {
          res.render('adminLogin', { message: 'Email and password is incorrect' });
        } else {
          req.session.user_id = userData._id;

          res.redirect('/admin/adminHome');
        }
      } else {
        res.render('adminLogin', { message: 'Email and password is incorrect' });
      }
    } else {
      res.render('adminLogin', { message: 'Email and password is incorrect' });
    }
  } catch (error) {
    console.log(error.message);
  }
};


const loadAdminHome=async(req,res)=>{
    try {
    const userData =await User.findOne({_id:req.session.user_id})
    
      res.render('adminHome',{admin:userData})
    
       
    } catch (error) {
        console.log(error.message);
    }
}
const logout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect('/admin');
  } catch (error) {
    console.log(error.message);
  }
};



loadUsers=async(req,res)=>{
    try {
    // var search = '';

    // if (req.query.Search) {
    //   search = req.query.Search;
    // }

    // const page=parseInt(req.query.userPage)||1;
    // const pageSize=10

    // const regex=new RegExp(search,'i')
   

    // const count = await User.find({
    //   is_Admin: 0,
    //   $or: [
    //     { userName: { $regex: regex } },
    //     { email: { $regex: regex } },
    //     { mobileNumber: { $regex: regex } },
    //   ],
    // }).countDocuments()

    
    // const totalPages = Math.ceil(count / pageSize);
    // const skip = (page - 1) * pageSize;
   


    // const usersData = await User.find({
    //   is_Admin: 0,
    //   $or: [
    //     { userName: { $regex: regex } },
    //     { email: { $regex: regex } },
    //     { mobileNumber: { $regex: regex } },
    //   ],
    // }).skip(skip).limit(pageSize)
     
    
    // res.render('users', { users : usersData,totalPages,currentPage:page });

    const usersData = await User.find({ is_Admin: 0})
    if (usersData){
         res.render('users', { users : usersData});
    }

        
    } catch (error) {
        console.log(error.message);
    }
}



const blockingUser = async (req, res) => {
  try {
    const id = req.params.id;
    const updateUser = await User.findByIdAndUpdate(id, { is_Blocked: true }, { new: true });
    if (!updateUser) {
      return res.status(404).send('User not found');
    }
    res.status(200).json(updateUser);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
};

const unBlockingUser = async (req, res) => {
  try {
    const id = req.params.id;
    const updateUser = await User.findByIdAndUpdate(id, { is_Blocked: false }, { new: true });
    if (!updateUser) {
      return res.status(404).send('User not found');
    }
    res.status(200).json(updateUser);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
};  
const loadCategory=async(req,res)=>{
      try {
        var search=''
        if(req.query.Search){
          search=req.query.Search
        }

    const regex=new RegExp(search,'i')

         const cateData= await Category.find({
      $or: [
        { name: { $regex: regex } },
        { description: { $regex: regex } },
      ],
    });

  
     res.render('category',{categ:cateData})

    
 } catch (error) {
          console.log(error.message);
 }
}



const loadAddCategory =async(req,res)=>{
    try {
      res.render('addCategory')
    } catch (error) {
      console.log(error.message);
    }
}
const postAddCategory=async(req,res)=>{
   try {
 const name=  req.body.name
 const description=req.body.description

        if (!name || !description) {
            return res.render('addCategory', { message: 'Invalid data provided' });
        }
         const cateData=await Category.find({name:{$regex:new RegExp(name,'i')}})
         if(cateData.length>0){
           res.render('addCategory',{message:'The category already exists'})
         }else{
          const cate=new Category({
          name:name,
          description:description,
          is_Listed:true

        }) 

         let cateData= await cate.save()
         if(cateData){

        res.redirect('/admin/category')
      }
  
  }


       } catch (error) {
        console.log(error.message);
       }
}
const loadEditCategory=async(req,res)=>{
     try {
     const id= req.query.id
     const cateData =await Category.findOne({_id:id})
     console.log(cateData);
      
        if (!cateData){
          res.render('editCategory',{message:'Data Not Found'})
        }else{
          res.render('editCategory',{categ:cateData})
        }
     } catch (error) {
      console.log(error.message);
     }
}

const postEditCategory=async(req,res)=>{
        try {

      let existData =await Category.findOne({name:{$regex:new RegExp(req.body.name,'i')},_id:{$ne:req.body.id}})
       console.log(existData);
      if (!existData){
        await Category.findByIdAndUpdate({_id:req.body.id},{name:req.body.name,description:req.body.description})
        res.redirect('/admin/category')
      }else{
        const cateData=await Category.findOne({_id:req.body.id})
        
        res.render('editCategory',{message:'Already exists category',categ:cateData||null})
      }

         

        } catch (error) {
          console.log(error.message);
        }
}
const listingCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const updateUser = await Category.findByIdAndUpdate(id, { is_Listed: true }, { new: true });
    if (!updateUser) {
      return res.status(404).send('Category not found');
    }
    res.status(200).json(updateUser);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
};  
  
const unlistingCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const updateUser = await Category.findByIdAndUpdate(id, { is_Listed: false }, { new: true });
    if (!updateUser) {
      return res.status(404).send('Category not found');
    }
    res.status(200).json(updateUser);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
};  

const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Step 1: Find the category to get its name
    const category = await Category.findOne({ _id: categoryId });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Step 2: Delete the category document
    await Category.deleteOne({ _id: categoryId });

    // Step 3: Find and delete all products associated with the category
    const products = await Product.find({ category: category.name });
     console.log('products',products);
    // Loop through products to get image filenames
    const imageFilenames = products.map((product) => product.imageUrl).flat();

    console.log('imagefilename',imageFilenames);

    // Delete all products associated with the category
    await Product.deleteMany({ category: category.name });

    // Step 4: Loop through the list of image filenames and unlink each file
    for (const filename of imageFilenames) {
      const imagePath = path.join(__dirname, '..', 'public', 'assetsAdmin', 'imgs', 'products', filename);

      // Check if the file exists before attempting to unlink
      try {
        await fs.unlink(imagePath,()=>{});
        console.log(`Image ${filename} deleted successfully.`);
      } catch (err) {
        console.error(`Error deleting image ${filename}: ${err.message}`);
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



const loadProducts=async(req,res)=>{
     try {
     const product=await Product.find({})
        res.render('products',{product:product})
     } catch (error) {
        console.log(error.message);
     }
}

const loadAddProduct=async(req,res)=>{
       try {

   const category=await Category.find({})
        const message= req.session.message
        req.session.message=''
        res.render('addProduct',{category:category,message})
       } catch (error) {
        console.log(error.message);
       }
}


const postAddProduct=async(req,res)=>{
     try {
        const name= req.body.name
        const description=req.body.description
        const image= req.files.map(file => file.filename);
        const price=req.body.price
        const wood = req.body.wood
        const quantity=req.body.quantity
        const category=req.body.category

        if(req.files.length!==5||req.files.length>5){
      
             req.session.message='only 5 images allowed'
             res.redirect('/admin/addProduct')

          // res.render('addProduct',{message:'Only 5 images allowed',category})
        }else{
            const product=new Product({
             name:name,
             description:description,
             imageUrl:image,
             price:price,
             wood:wood,
             stockQuantity:quantity,
             category:category,
             date:formatDate(Date.now()), // Format the date
             is_Listed:true

        })


   //format our date
   function formatDate(timestamp) {
    const date = new Date(timestamp);

    // Extracting date, month, and year
    const day = date.getDate();
    const month = date.getMonth() + 1; // Months are zero-based
    const year = date.getFullYear();

    // Formatting as "dd/mm/yyyy" (you can adjust the format as needed)
    const formattedDate = `${day}/${month}/${year}`;

    return formattedDate;
}



let productData =await product.save()
if (!productData){
  res.render('addProduct',{message:'Invalid input'})
}else{
  res.redirect('/admin/products')
}


}

    


 } catch (error) {
      console.log(error.message);
 }
}


const listingProduct=async(req,res)=>{
   try {
    const id = req.params.id;
    const updateProduct = await Product.findByIdAndUpdate(id, { is_Listed: true }, { new: true });
    if (!updateProduct) {
      return res.status(404).send('Category not found');
    }
    res.status(200).json(updateProduct);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
}


const unlistingProduct=async(req,res)=>{
      try {
    const id = req.params.id;
    const updateProduct = await Product.findByIdAndUpdate(id, { is_Listed: false }, { new: true });
    if (!updateProduct) {
      return res.status(404).send('Category not found');
    }
    res.status(200).json(updateProduct);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
}

const loadEditProduct=async(req,res)=>{
    try {
      const id=req.query.id
      const productData=await Product.findOne({_id:id})
      const category =await  Category.find({})
      res.render('editProduct',{product:productData,categ:category})
    } catch (error) {
      
    }
}


const postEditProduct=async(req,res)=>{
       try {
 
 console.log(req.query.id);
 const product =await Product.findOne({_id:req.body.id})
 const categ =await Product.find({is_Listed:1})

  
 console.log('files',req.files.length);

     if(req.files){
     const existingCount=(await Product.findById(req.body.id)).imageUrl.length
     console.log('existCount'+existingCount);
     if(existingCount+req.files.length!==5||existingCount+req.files.length>5){
       res.render('editProduct',{message:'Only 5 images  allowed',product,categ})
     }else{

  await Product.findByIdAndUpdate(
  { _id: req.body.id },
  {
    $push: { imageUrl: { $each: req.files.map(file => file.filename) } },
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    stockQuantity: req.body.quantity,
    wood: req.body.wood
  }
);

 res.redirect('/admin/products')
     

     }
     }
    
           
       } catch (error) {
        console.log(error.message);
       }
}

const deleteProducts=async(req,res)=>{
     try {
      console.log(req.params);
      const productId=req.params.id

     
    // Step 1: Retrieve the list of image filenames
    const product = await Product.findById(productId);
    const imageFilenames = product.imageUrl || [];

    console.log('iamgefilenames'+imageFilenames);

    // Step 2: Delete the product document from the database
    await Product.deleteOne({ _id: productId });

    // Step 3: Loop through the list of image filenames and unlink each file
    for (const filename of imageFilenames) {
      const imagePath = path.join(__dirname, '..', 'public', 'assetsAdmin','imgs','products',filename);

      // Check if the file exists before attempting to unlink
      try {
         await fs.unlink(imagePath,()=>{});
        console.log(`Image ${filename} deleted successfully.`);
      } catch (err) {
        console.error(`Error deleting image ${filename}: ${err.message}`);
      }
    }


     } catch (error) {
       console.log(error.message);
     }
}

const loadLogout=async(req,res)=>{
      try {
          req.session.destroy()
          res.redirect('/admin/')
      } catch (error) {
        console.log(error.message);
      }
}

const loadOrders=async(req,res)=>{
        try {
       const user_id= req.session.user_id
        const orderData=  await Order.aggregate([{$match:{user_id:new mongoose.Types.ObjectId(user_id)}},{$sort:{date:-1}},{
      $lookup: {
      from: 'products',  // Replace with the actual name of the collection to populate from
      localField: 'items.product_id',
      foreignField: '_id',
      as: 'amjad',
    },
  },])

        console.log(orderData);
          res.render('orders',{orderData})
        } catch (error) {
          console.log(error.message);
      }
}

const updatedStatus = async (req, res) => {
  try {
    const { status, orderId } = req.body;
    await Order.updateOne({ _id: orderId }, { $set: { status: status } });

    if (status === 'cancelled'||'returned') {
      const orderData = await Order.findOne({ _id: orderId }).populate('items.product_id');
      for (let i = 0; i < orderData.items.length; i++) {
        const productId = orderData.items[i].product_id._id;
        const productQuantity = orderData.items[i].quantity;
        await Product.updateOne({ _id: productId }, { $inc: { stockQuantity: -productQuantity } });
      }
    }

    res.send({ success: true });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ success: false, message: 'Internal server error.' });
  }
};



const loadOrderDetails=async(req,res)=>{
    try {


  const orderId=req.query.id

  const orderData = await Order.findOne({ _id: orderId }).populate('items.product_id').populate('user_id')
  
    console.log('orderData'+orderData);
      res.render('orderDetails',{orderData})
    } catch (error) {
      console.log(error.message);
    }
}

const postDeleteImg=async(req,res)=>{
      try { 
       const {productId,img,index}= req.body
       console.log(productId+img+index);
  
     fs.unlink(path.join(__dirname, '..', 'public', 'assetsAdmin','imgs','products',img),()=>{})
      await Product.updateOne({_id:productId},{$pull:{imageUrl:img}})
       res.send({success:true})
      } catch (error) {
        console.log(error.message);
      }
}


module.exports={
       loadAdminHome,
       loadAdminLogin,
       verifyLogin, 
       logout,
       loadProducts,
       loadUsers,
       blockingUser,
       unBlockingUser,
       loadCategory,
       loadAddCategory,
       postAddCategory,
       loadEditCategory,
       postEditCategory,
       listingCategory,
       unlistingCategory,
       deleteCategory,
       loadAddProduct,
       postAddProduct,
       listingProduct,
       unlistingProduct,
       loadEditProduct,
       postEditProduct,
       deleteProducts,
       loadLogout,
       loadOrders,
       updatedStatus,
       loadOrderDetails,
       postDeleteImg,

    }