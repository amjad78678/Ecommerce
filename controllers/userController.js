const User = require('../models/userModel');
const bcrypt = require('bcrypt');

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};
const loadHome = async (req, res) => {
  try {
    res.render('userHome');
  } catch (error) {
    console.log(error.message);
  }
};

const loadRegister = async (req, res) => {
  try {
    res.render('userRegister');
  } catch (error) {
    console.log(error.message);
  }
};
const insertUser = async (req, res) => {
  try {
    sPassword = await securePassword(req.body.password);
    sConfirmPassword = await securePassword(req.body.confirmPassword);
    const user = User({
      userName: req.body.userName,
      email: req.body.email,
      mobileNumber: req.body.mobileNumber,
      password: sPassword,
      confirmPassword: sConfirmPassword,
      is_Admin: 0,
    });
    const userData = await user.save();
    if (userData) {
      res.render('userRegister', { message: 'Your registration sucessfull' });
    } else {
      res.render('userRegister', { message: 'Your registration failed' });
    }
  } catch (error) {
    console.log(error.message);
  }
};
module.exports = {
  loadHome,
  loadRegister,
  insertUser,
};
