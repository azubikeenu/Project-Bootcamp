const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');
const colors = require('colors');
require('dotenv').config({
  path: path.join(__dirname, 'config', 'config.env'),
});

//Load models
const { Bootcamp } = require('./models');
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log(`DB Connected Successfully ⭐`));

const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8')
);

// Import Data
const importData = async () => {
  try {
    await Bootcamp.create(bootcamps);
    console.log(`Data imported`.green.inverse);
  } catch (err) {
    console.log(err);
  } finally {
    process.exit();
  }
};

// Delete Data
const deleteData = async () => {
  try {
    await Bootcamp.deleteMany();
    console.log(`Data destoryed`.red.inverse);
  } catch (err) {
    console.log(err);
  } finally {
    process.exit();
  }
};

if (process.argv[2] === '--import') {
  importData();
}
if (process.argv[2] === '--delete') {
  deleteData();
}
