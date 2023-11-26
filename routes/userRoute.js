const express = require('express');
const userRouter = express();
const path = require('path');
const userController = require('../controllers/userController');
const bodyParser = require('body-parser');
const session= require('express-session')


userRouter.use(session({
  secret: 'your-secret-keyamjadali', 
  resave: false,
  saveUninitialized: true,
}));

userRouter.use(bodyParser.json());
userRouter.use(bodyParser.urlencoded({ extended: true}));

userRouter.set('view engine', 'ejs');
userRouter.set('views', path.join(__dirname, '..', 'views', 'users'));

userRouter.use(express.static(path.join(__dirname, '..', 'public')));
userRouter.use(express.static(path.join(__dirname, '..', 'public', 'styles')));

userRouter.get('/', userController.loadHome);


userRouter.get('/userRegister', userController.loadRegister);
userRouter.post('/userRegister', userController.postRegister);
userRouter.get('/userSignIn', userController.loadLogin);
userRouter.post('/userSignIn',userController.verifyLogin)
userRouter.get('/authentication', userController.loadOtp);
userRouter.post('/authentication',userController.verifyOtp);
userRouter.get('/userLogout',userController.userLogout);






module.exports = userRouter;