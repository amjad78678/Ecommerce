const express= require('express')
const adminRoute=express()
const path = require('path');
const userController = require('../controllers/adminController');
const bodyParser = require('body-parser');
const auth=require('../middleware/adminAuth')
const adminController=require('../controllers/adminController')
const session= require('express-session')


adminRoute.set('view engine', 'ejs');
adminRoute.set('views', path.join(__dirname, '..', 'views', 'admin'));
adminRoute.use(bodyParser.json());
adminRoute.use(bodyParser.urlencoded({ extended: true}));
adminRoute.use(express.static(path.join(__dirname, '..', 'public')));
adminRoute.use(express.static(path.join(__dirname, '..', 'public', 'styles')));







adminRoute.use(session({
  secret: 'your-secret-keyamjadali', 
  resave: false,
  saveUninitialized: true,
}));




adminRoute.get('/',adminController.loadAdminLogin)
adminRoute.post('/',userController.verifyLogin)
adminRoute.get('/adminHome',adminController.loadAdminHome)
adminRoute.get('/products',adminController.loadProducts)
adminRoute.get('/users',adminController.loadUsers)
adminRoute.post('/users/block/:id',adminController.blockingUser)
adminRoute.post('/users/unblock/:id',adminController.unBlockingUser)
adminRoute.get('/category',adminController.loadCategory)




module.exports=adminRoute