const User=require('../models/userModel')
const bcrypt=require('bcrypt')

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


const loadProducts=async(req,res)=>{
     try {
        res.render('products')
     } catch (error) {
        console.log(error.message);
     }
}


loadUsers=async(req,res)=>{
    try {
    var search = '';

    if (req.query.Search) {
      search = req.query.Search;
    }
    const page=parseInt(req.query.userPage)||1;
    const pageSize=10
    const regex=new RegExp(search,'i')
   

    const count = await User.find({
      is_Admin: 0,
      $or: [
        { userName: { $regex: regex } },
        { email: { $regex: regex } },
        { mobileNumber: { $regex: regex } },
      ],
    }).countDocuments()

    
    const totalPages = Math.ceil(count / pageSize);
    const skip = (page - 1) * pageSize;
   


    const usersData = await User.find({
      is_Admin: 0,
      $or: [
        { userName: { $regex: regex } },
        { email: { $regex: regex } },
        { mobileNumber: { $regex: regex } },
      ],
    }).skip(skip).limit(pageSize)
     
    
    res.render('users', { users : usersData,totalPages,currentPage:page });
        
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
           res.render('category')
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
       loadCategory
    }