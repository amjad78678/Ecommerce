const User=require('../models/userModel')
const Category= require('../models/categoryModel')
const Product=require('../models/productModel')
const bcrypt=require('bcrypt')
const mongoose = require('mongoose');


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
         const cateData=await Category.find({name:name})
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
         await Category.findByIdAndUpdate({_id:req.body.id},{name:req.body.name,description:req.body.description})
          res.redirect('/admin/category')

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
    await Category.deleteOne({_id:categoryId})

    
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
           res.render('addProduct',{category:category})
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
     console.log(req.body);
     console.log(req.query.id);
    await Product.findByIdAndUpdate({_id:req.body.id},{name:req.body.name,description:req.body.description,price:req.body.price,category:req.body.category, imageUrl : req.files.map(file => file.filename),stockQuantity:req.body.quantity,wood:req.body.wood})
    res.redirect('/admin/products')

           
       } catch (error) {
        console.log(error.message);
       }
}

const deleteProducts=async(req,res)=>{
     try {
      console.log(req.params);
      const productId=req.params.id
      await Product.deleteOne({_id:productId})  

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
       loadLogout
    }