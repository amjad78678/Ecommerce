const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/firstProject');
//--------------------------------------------------------------------------------------------------

const express = require('express');
const app = express();
const path=require('path')

const nocache=require('nocache')
const port = process.env.PORT ||8000;
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(nocache())

app.use((req, res, next) => {
    // Expose session to EJS templates
    res.locals.session = req.session||{};
    next();
});
   

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const userRouter = require('./routes/userRoute');
app.use('/', userRouter);
const adminRoute=require('./routes/adminRoute')
app.use('/admin',adminRoute)



app.get('*',(req,res)=>{
   res.render('404')
})


app.listen(port, () =>
  console.log('port is running at http://localhost:8000/  port is running at http://localhost:8000/admin'),
);
