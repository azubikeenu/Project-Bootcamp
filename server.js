const express = require('express');
const path = require('path');
const router = require('./routes');

require('dotenv').config({
  path: path.join(__dirname, 'config', 'config.env'),
});

const app = express();

const PORT = process.env.PORT || 5000;

const ROOT_PATH = `/api/v1`;

app.use(`${ROOT_PATH}/bootcamps`,router.bootCampRouter);


app.listen(PORT, () => {
  console.log(
    `server running in ${process.env.NODE_ENV} mode on port : ${PORT}`
  );
});
