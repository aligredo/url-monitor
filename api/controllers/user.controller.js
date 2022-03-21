'use strict';

const req = require('express/lib/request');
const { send } = require('process');

var mongoose = require('mongoose'),
  jwt = require('jsonwebtoken'),
  bcrypt = require('bcrypt'),
  jwt = require('jsonwebtoken'),
  User = mongoose.model('User'),
  EMAIL_REGEX = require("../config/").EMAIL_REGEX,
  SECRET =  require("../config/").SECRET,
  emailSender = require("../utils/emailSender"),
  crypto = require('crypto');


exports.register = function(req, res, next) {

  var valid = req.body.email && typeof(req.body.email) === 'string' && EMAIL_REGEX.test(req.body.email) &&
            req.body.password && typeof(req.body.password) === 'string' && req.body.password.length > 7 && req.body.password.length <= 25;

    if (!valid) {
        return res.status(422).json({
            
            message: "email [String, Valid email], password [String, Length between 8 and 25 characters] are required fields.",
            
            });
        }
    
    User.findOne({
			email: req.body.email.trim().toLowerCase()
		}).exec(function (err, ex) {
			    if (err) {
				    return next(err);
			    }

			    if (ex) {
				    return res.status(422).json({
					    
					    message: "A user with this email already exists.",
					    
				    });
			    }

                var newUser = new User(req.body);
                newUser.password = bcrypt.hashSync(req.body.password, 10);
                newUser.verificationToken =  crypto.randomBytes(16).toString('hex');
                
                newUser.save(function(err, user) {
                  if (err) {
                      return next(err);
                  } else {
                      emailSender.sendEmail(user.email, 'Account Verification Token', 'Hello,\n\n' + 'Please verify your account by sending a PUT request as follows : \n API route: /api/verfiy-account/ \n with from-encode body: \n {token: "'+ newUser.verificationToken + '"}'+ '.\n' + 'Happy Monitoring!' + '\n')
                      console.log(user.verificationToken);
                              res.status(200).json({
                                  
                                  message: 'User account has been created succesfully. A verification email has been sent to ' + newUser.email + '.',
                                  
                              });
                  }
                });
            })
};


exports.verify = function(req, res, next) {

  var valid = req.body.token && typeof(req.body.token) === 'string';

    if (!valid) {
        return res.status(422).json({
            
            message: "token (String) is a required field.",
            
            });
        }
    
    User.findOne({
			verificationToken: req.body.token
		}).exec(function (err, user) {
			    if (err) {
				    return next(err);
			    }

			    if (!user) {
				    return res.status(404).json({
					    
					    message: "We are unable to find an account associated with this token.",
					    
				    });
			    }

                if(user){
                    if(user.isVerified){
                        return res.status(200).json({
                            
                            message: "This account is already verfied.",
                            
                        });
                    }

                    user.isVerified = true;
                    user.save(function(err, user) {
                        if (err) {
                            return next(err);
                        }
                        return res.status(200).json({
                            
                            message: "Account verifid successfully. Happy Monitoring!",
                            
                        });
                    })
                    
                }
            })
};

exports.getToken = function(req, res, next) {

    var valid = req.body.email && typeof(req.body.email) === 'string' && EMAIL_REGEX.test(req.body.email) &&
              req.body.password && typeof(req.body.password) === 'string' && req.body.password.length > 7 && req.body.password.length <= 25;
  
    if (!valid) {
        return res.status(422).json({
            
            message: "email (String), password (String) are required fields.",
            
        });
    }

    User.findOne({
        email: req.body.email
    }).exec(function (err, user) {
        if (err) throw err;
        if (!user || !user.comparePassword(req.body.password)) {
            return res.status(401).json({
                
                message: "Authentication failed. Invalid user or password.",
                
            });
        }
        if(!user.isVerified){
            return res.status(400).json({
                
                message: "Account is not verified.",
                
            });
        }
        return res.status(200).json({
            
            message: "Authenticated! Use the given token in Authorization header precedded with 'JWT' for subsequent requests.",
            data: {token: jwt.sign({ email: user.email, _id: user._id }, SECRET)}
        });
      });

};


exports.ping = function(req, res, next) {
    if(!req.user){
        return res.status(401).json({
            
            message: "Authentication failed. Invalid user or password.",
            
        });
    }
    console.log(req.user)
    return res.status(200).json({
        
        message: "Pong",
        
    });
    
}
    
