const express = require('express');
const app = express();
const port = process.env.PORT || 8000;

const userRouter = require('./routes/userRoute');
app.use('/', userRouter);

app.listen(port, () =>
  console.log('port is running at http://localhost:8000/ '),
);
