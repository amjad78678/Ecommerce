const express = require('express');
const userRouter = express();
const path = require('path');
const userController = require('../controllers/userController');
const bodyParser = require('body-parser');

userRouter.use(bodyParser.json());
userRouter.use(bodyParser.urlencoded({ extended: true }));
userRouter.set('view engine', 'ejs');
userRouter.set('views', path.join(__dirname, '..', 'views', 'users'));

userRouter.use(express.static(path.join(__dirname, '..', 'public')));
userRouter.use(express.static(path.join(__dirname, '..', 'public', 'styles')));

userRouter.get('/', userController.loadHome);
userRouter.get('/userRegister', userController.loadRegister);
userRouter.post('/userRegister', userController.postRegister);
userRouter.get('/userSignIn', userController.loadLogin);
userRouter.get('/authenticationPage', userController.loadOtpPage);
userRouter.post('/authentication',userController.postAuthentication)


module.exports = userRouter;
