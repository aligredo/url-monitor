var nodemailer = require('nodemailer'),
    EMAIL = require("../config/").EMAIL,
    PASSWORD = require("../config/").PASSWORD;
exports.sendEmail = function(receiver, subject, body){
    var transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: EMAIL, pass: PASSWORD } });
    var mailOptions = { from: 'no-reply@url-monitor-api.com', to: receiver, subject: subject, text: body };
    transporter.sendMail(mailOptions, function (err) {
            if (err) { 
                return next(err);
            }
    })
};