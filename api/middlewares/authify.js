var jwt = require('jsonwebtoken'),
SECRET  = require("../config").SECRET,
mongoose = require('mongoose'),
User = mongoose.model('User');

module.exports = function(req, res, next) {
	if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
	  jwt.verify(req.headers.authorization.split(' ')[1], SECRET, function(err, decode) {
		if (err) req.user = undefined;
		req.user = decode;
		User.findOne({
			_id: req.user._id.trim().toLowerCase()
		}).exec(function (err, user) {
			if(!user){
				return res.status(404).json({
					    
					message: "User not found.",
					
				});
			}
			else{
				if(!user.isVerified){
					return res.status(401).json({
					    
						message: "Account is not verified. Please verify your account to be able to use the API.",
						
					});
				}
				else{
					next();
				}
			}
		});
		
	  });
	} else {
	  req.user = undefined;
	  next();
	}
};