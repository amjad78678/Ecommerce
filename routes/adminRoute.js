const express= require('express')
const adminRoute=express()
const path = require('path');
const userController = require('../controllers/adminController');
const bodyParser = require('body-parser');
const auth=require('../middleware/adminAuth')
const adminController=require('../controllers/adminController')
const {upload}=require('../middleware/uploadImages')
const session= require('express-session')


adminRoute.set('view engine', 'ejs');
adminRoute.set('views', path.join(__dirname, '..', 'views', 'admin'));
adminRoute.use(bodyParser.json());
adminRoute.use(bodyParser.urlencoded({ extended: true}));
adminRoute.use(express.static(path.join(__dirname, '..', 'public')));
adminRoute.use(express.static(path.join(__dirname, '..', 'public', 'styles')));

adminRoute.use(
  express.static(path.join(__dirname, '..', 'public', 'assetsAdmin','imgs','products')),
);








adminRoute.use(session({
  secret: 'your-secret-keyamjadali', 
  resave: false,
  saveUninitialized: true,
}));




adminRoute.get('/',auth.isLogout,adminController.loadAdminLogin)
adminRoute.post('/',userController.verifyLogin)
adminRoute.get('/adminHome',auth.isLogin,adminController.loadAdminHome)
adminRoute.get('/users',auth.isLogin,adminController.loadUsers)
adminRoute.post('/users/block/:id',adminController.blockingUser)
adminRoute.post('/users/unblock/:id',adminController.unBlockingUser)
adminRoute.get('/category',auth.isLogin,adminController.loadCategory)
adminRoute.get('/addCategory',auth.isLogin,adminController.loadAddCategory)
adminRoute.post('/addCategory',adminController.postAddCategory)
adminRoute.get('/editCategory',auth.isLogin,adminController.loadEditCategory)
adminRoute.post('/editCategory',adminController.postEditCategory)
adminRoute.post('/category/list/:id',adminController.listingCategory)
adminRoute.post('/category/unlist/:id',adminController.unlistingCategory),
adminRoute.post('/category/deleteCategory/:id',adminController.deleteCategory)
adminRoute.get('/products',auth.isLogin,adminController.loadProducts)
adminRoute.get('/addProduct',auth.isLogin,adminController.loadAddProduct)
adminRoute.post('/addProduct',upload,adminController.postAddProduct)
adminRoute.post('/products/list/:id',adminController.listingProduct)
adminRoute.post('/products/unlist/:id',adminController.unlistingProduct)
adminRoute.get('/editProduct',auth.isLogin,adminController.loadEditProduct)
adminRoute.post('/editProduct',upload,adminController.postEditProduct)
adminRoute.post('/products/deleteProducts/:id',adminController.deleteProducts)
adminRoute.get('/logout',auth.isLogin,adminController.loadLogout)
adminRoute.get('/orders',auth.isLogin,adminController.loadOrders)
adminRoute.patch('/updatedStatus',adminController.updatedStatus)
adminRoute.get('/orderDetails',auth.isLogin,adminController.loadOrderDetails)
adminRoute.put('/deleteImg',adminController.postDeleteImg)






module.exports=adminRoute