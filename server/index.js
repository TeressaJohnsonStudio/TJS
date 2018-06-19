'use strict';
require('dotenv').config();
const express = require('express');
const app = express();
const webpack = require('webpack');
const compiler = webpack(require('../webpack.config.js'));
const middleware = require('webpack-dev-middleware');
const mongoose = require('mongoose');
const instance = middleware(compiler);
const blogRouter = require('./routes/blog');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

app.use('client', express.static(`${__dirname}/client`));
app.use(instance);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/api', blogRouter);


//EMAIL COMPONENT
app.post('/contact', (req, res) => {
console.log('POST REQ: ', req.body)
    let transporter = nodemailer.createTransport({
      service: 'Gmail',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
      }
    });
    let mailOptions = {
      from: `${req.body.name}`, // sender address
      to: process.env.EMAIL,// list of receivers
      subject: `${req.body.subject}`, // Subject line
      text: `${req.body}`, // plain text body
      html: `${req.body}`// html body
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Message sent: %s', info.messageId);
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    });
});


instance.waitUntilValid(() => {
  console.log('package is valid');
});

const PORT = process.env.PORT || 3000;
const server = (module.exports = {});



server.isOn = false;
server.start = () => {
  return new Promise((resolve, reject) => {
    if (server.isOn) {
      return reject(new Error('Error, server is already on'))
    }

    server.http = app.listen(PORT, () => {
      console.log(`Listening to port ${PORT}`);
      server.isOn = true;
      mongoose.connect(process.env.MONGODB_URI);
      return resolve(server);
    })
  })
}

server.stop = () => {
  return new Promise((resolve, reject) => {
    if (!server.isOn) {
      return reject(new Error('Error, server already stopped'));
    }

    server.http.close(() => {
      server.isOn = false;
      mongoose.disconnect();
      return resolve(server);
    })
  })
}
