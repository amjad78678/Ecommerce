const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/firstProject');
//--------------------------------------------------------------------------------------------------

const express = require('express');
const app = express();


const nocache=require('nocache')
const port = process.env.PORT ||3000;
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(nocache())

app.use((req, res, next) => {
    // Expose session to EJS templates
    res.locals.session = req.session||{};
    next();
});
   
const userRouter = require('./routes/userRoute');
app.use('/', userRouter);
const adminRoute=require('./routes/adminRoute')
app.use('/admin',adminRoute)

    

const errorHandler=require('./middleware/errorHandler')
app.use((req,res)=>{
  res.status(404).render('404')
})
app.use(errorHandler)



app.listen(port, () =>
  console.log('port is running at http://localhost:3000/  port is running at http://localhost:3000/admin'),
);
