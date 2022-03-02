const nodemailer = require('nodemailer');

module.exports = class Email {
  constructor(user, url = 'www.example.com') {
    this.to = user.email;
    this.from = `${process.env.EMAIL_NAME} <${process.env.EMAIL_FROM}>`;
    this.url = url;
  }

  newTransport() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  async send(subject, text) {
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text,
    };
    //create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }
  async sendPasswordReset(text) {
    await this.send('password_reset', text);
  }
};
