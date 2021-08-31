const nodemailer = require('nodemailer');
const config = require('../configs/email');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.user,
      pass: config.pass
    }
  });

  const email = async (to, subject, html) => {
    await transporter.sendMail({
        from: '"Sunny School"<'+config.user+'>',
        to: to,
        subject: "Hello ✔",
        text: subject,
        html: html
      }); 
  };

  module.exports = email;