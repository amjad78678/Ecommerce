const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
  },
  is_Listed:{
    type:Boolean,
    required:true
  }
});


module.exports= mongoose.model('Category', categorySchema);


