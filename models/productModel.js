const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  imageUrl: [{
    type: String,
    required:true
    

  }],
  stockQuantity: {
    type: Number,
    required:true
  },
   date:{   
    type:String,
    required:true
   },
   is_Listed:{
    type:Boolean,
    required:true,
   },
   wood:{
    type:String,
    required:true
   }
});

module.exports= mongoose.model('Product', productSchema);


