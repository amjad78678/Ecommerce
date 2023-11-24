const User = require('../models/userModel');

const loadHome = async (req, res) => {
  try {
    res.render('userHome');
  } catch (error) {
    console.log(error.message);
  }
};

const loadLogin = async (req, res) => {
  try {
    res.render('userLogin');
  } catch (error) {
    console.log(error.message);
  }
};
module.exports = {
  loadHome,
  loadLogin,
};
