var nodemailer = require('nodemailer'),
    EMAIL_HOST = require("../config/").EMAIL_HOST,
    SENDER_EMAIL = require("../config/").SENDER_EMAIL,
    EMAIL_PORT = require("../config/").EMAIL_PORT,
    SENDGRID_USERNAME = require("../config/").SENDGRID_USERNAME,
    SENDGRID_PASSWORD = require("../config/").SENDGRID_PASSWORD;
exports.sendEmail = function(receiver, subject, body){
    var transporter = nodemailer.createTransport({ 
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: false,
    auth: {
        user: SENDGRID_USERNAME,
        pass: SENDGRID_PASSWORD,
        },
    tls: {
            rejectUnauthorized: false
        }
    });
    var mailOptions = { from: SENDER_EMAIL, to: receiver, subject: subject, text: body };
    transporter.sendMail(mailOptions, function (err) {
            if (err) { 
                return err;
            }
    })
};