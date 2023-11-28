const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
  },
  // You can add more fields as needed
});


module.exports= mongoose.model('Category', categorySchema);


