const express = require('express');
const path = require('path')
require('dotenv').config({path : path.join(__dirname , 'config' , 'config.env')})

const app = express();

const PORT = process.env.PORT || 5000 ;

app.listen(PORT ,()=>{
   console.log(`server runninng in  ${process.env.NODE_ENV} mode on port : ${PORT}`);
})
