const express = require('express');
const path = require('path');
const morgan = require('morgan');
const colors = require('colors');
const router = require('./routes');
const DB = require('./config/db.config');

require('dotenv').config({
  path: path.join(__dirname, 'config', 'config.env'),
});

// CONNECT TO THE DATABSE
new DB().getConnection();

const app = express();

const PORT = process.env.PORT || 5000;

const ROOT_PATH = `/api/v1`;

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));

}
app.use(express.json())


app.use(`${ROOT_PATH}/bootcamps`, router.bootCampRouter);

const server = app.listen(PORT, () => {
  console.log(
    `server running in ${process.env.NODE_ENV} mode on port : ${PORT}`.yellow
      .bold
  );
});

process.on('unhandledRejection', (err) => {
  console.log(err.message.red);
  //Close server and exit
  server.close(() => {
    console.log(`Shutting down server`.white.bgRed.bold);
    process.exit(1);
  });
});
