const { connect } = require('mongoose');

module.exports = class DBConfig {
  constructor() {
    this.uri = process.env.MONGO_URI;
    this.con = null;
    this.options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
  }
  async getConnection() {
    this.con = await connect(this.uri, this.options);
    console.log(`MongoDB connected to ${this.con.connection.host}`.white.bold.bgGreen);
  }
};
