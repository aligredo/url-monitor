'use strict';



var mongoose = require('mongoose'),
  UrlCheck = mongoose.model('UrlCheck'),
  URL_REGEX = require("../config/").URL_REGEX,
  isJSON = require('../utils/isJSON'),
  moment = require('moment');

exports.create = function(req, res, next) {
    var valid = req.body.name && typeof(req.body.name) === 'string'
                && req.body.url && typeof(req.body.url) === 'string' && URL_REGEX.test(req.body.url)
                && req.body.protocol && typeof(req.body.protocol) === 'string' && ['HTTP', 'HTTPS', 'TCP'].includes(req.body.protocol)
                &&  req.body.ignoreSSL && typeof(req.body.ignoreSSL) === 'string' && ( req.body.ignoreSSL === 'true' || req.body.ignoreSSL === 'false')

    if(!valid){
        return res.status(422).json({
            
            message: "name (String), url [String, valid url], protocol [String, 'HTTP'or 'HTTPS'or 'TCP'] and ignoreSSL (Boolean) are required fields."
            
        });
    }
    
    UrlCheck.findOne({owner: req.user._id, name: req.body.name}).exec(function(err, urlcheck){
        if(err)
            return next(err);
        if(urlcheck){
            return res.status(409).json({
            
                message: "This account has a urlcheck with the same name. Please choose a unique name."
                
            });
        }
        var urlcheck = req.body;
        if(req.body.path){
            if(!typeof(req.body.path) === 'string'){
                return res.status(422).json({
            
                    message: "optional field path should be of type (String)."
                    
                });
            }
            urlcheck.path = req.body.path;
        }

        if(req.body.webhook){
            if(!typeof(req.body.webhook) === 'string' && URL_REGEX.test(req.body.webhook)){
                return res.status(422).json({
            
                    message: "optional field webhhook should be of type (String) and is valid url format."
                    
                });
            }
            urlcheck.webhook = req.body.webhook;
        }

        if(req.body.timeout){
            if(!typeof(req.body.timeout) === 'number'){
                return res.status(422).json({
            
                    message: "optional field timeout should be of type (number) in seconds."
                    
                });
            }
            urlcheck.timeout = req.body.timeout;
        }

        if(req.body.interval){
            if(!typeof(req.body.interval) === 'number'){
                return res.status(422).json({
            
                    message: "optional field interval should be of type (number) in seconds."
                    
                });
            }
            urlcheck.interval = req.body.interval;
        }


        if(req.body.threshold){
            if(!typeof(req.body.threshold) === 'number'){
                return res.status(422).json({
            
                    message: "optional field threshold should be of type (number)."
                    
                });
            }
            urlcheck.threshold = req.body.threshold;
        }

        if(req.body.authentication){
            if(!isJSON(req.body.authentication)
            ||  !JSON.parse(req.body.authentication).username 
            ||  !JSON.parse(req.body.authentication).password
            ){
                return res.status(422).json({
            
                    message: "optional field authentication should be of type (String) in a JSON format and has a username and password field of type (String)."
                    
                });
            }
            urlcheck.authentication = {
                username: JSON.parse(req.body.authentication).username,
                password: JSON.parse(req.body.authentication).password
            };
        }

        if(req.body.httpHeaders){
            if(!isJSON(req.body.httpHeaders)){
                return res.status(422).json({
            
                    message: "optional field httpHeaders should be of type (String) in a JSON format."
                    
                });
            }
            urlcheck.httpHeaders = JSON.parse(req.body.httpHeaders);
        }

        if(req.body.assert){
            if(!isJSON(req.body.assert) 
            || !JSON.parse(req.body.assert).statusCode){
                return res.status(422).json({
            
                    message: "optional field assert should be of type (String) in a JSON format and has the field statusCode of type (Number)."
                    
                });
            }
            urlcheck.assert = {
                statusCode: JSON.parse(req.body.assert).statusCode
            };
        }

        if(req.body.tags){
            if(!Array.isArray(req.body.tags)){
                return res.status(422).json({
            
                    message: "optional field tags should be of type (Array)."
                    
                });
            }
            urlcheck.tags = req.body.tags;
        }

        urlcheck.owner = req.user._id;
        urlcheck.report = {
            status: "UP",
            availability: "",
            outages: 0,
            downtime: 0,
            uptime: 0,
            responseTime: 0,
            history:  moment().format('MMMM Do YYYY, h:mm:ss a') + '    ::::> Not Monitored Yet.'
        }
        urlcheck.ignoreSSL = (req.body.ignoreSSL === 'true');

        UrlCheck.create(urlcheck, function(err, createdUrlCheck){
            if(err)
                return next(err);
            var returnedData = JSON.parse(JSON.stringify(createdUrlCheck));
            delete returnedData.report;
            delete returnedData.owner;
            return res.status(200).json({
            
                message: "UrlCheck: " + returnedData.name + " was created successfully.",
                data: returnedData
                
            });
        })  
    })
};

exports.getById = function(req, res, next) {
    var valid = req.params._id && typeof req.params._id === 'string'
    if(!valid){
        return res.status(422).json({
            
            message: "id is a required param."
            
        });
    }
    UrlCheck.findOne({owner: req.user._id, _id: req.params._id}).exec(function(err, urlcheck){
        if(err)
            return next(err);
        if(!urlcheck){
            return res.status(404).json({
            
                message: "No UrlCheck with this id was found in your account."
                
            });
        }
        var returnedData = JSON.parse(JSON.stringify(urlcheck));
            delete returnedData.report;
            delete returnedData.owner;
            
        return res.status(200).json({
            
            message: "UrlCheck: "+ returnedData.name + " was retrieved successfully.",
            data: returnedData
            
        });

    });
};

exports.getByName = function(req, res, next) {
    var valid = req.params.name && typeof req.params.name === 'string'
    if(!valid){
        return res.status(422).json({
            
            message: "name is a required param."
            
        });
    }
    UrlCheck.findOne({owner: req.user._id, name: req.params.name}).exec(function(err, urlcheck){
        if(err)
            return next(err);
        if(!urlcheck){
            return res.status(404).json({
            
                message: "No UrlCheck with this name was found in your account."
                
            });
        }
        var returnedData = JSON.parse(JSON.stringify(urlcheck));
            delete returnedData.report;
            delete returnedData.owner;
            
        return res.status(200).json({
            
            message: "UrlCheck: "+ returnedData.name + " was retrieved successfully.",
            data: returnedData
            
        });

    });
};

exports.deleteById = function(req, res, next) {
    var valid = req.params._id && typeof req.params._id === 'string'
    if(!valid){
        return res.status(422).json({
            
            message: "id is a required param."
            
        });
    }
    UrlCheck.findOne({owner: req.user._id, _id: req.params._id}).exec(function(err, urlcheck){
        if(err)
            return next(err);
        if(!urlcheck){
            return res.status(404).json({
            
                message: "No UrlCheck with this id was found in your account."
                
            });
        }
        urlcheck.remove(function(err){
            if(err)
                return next(err);

            return res.status(200).json({
            
                    message: "UrlCheck: "+ urlcheck.name + " was deleted successfully."
        
            });
        });

    });
};

exports.deleteByName = function(req, res, next) {
    var valid = req.params.name && typeof req.params.name === 'string'
    if(!valid){
        return res.status(422).json({
            
            message: "name is a required param."
            
        });
    }
    UrlCheck.findOne({owner: req.user._id, name: req.params.name}).exec(function(err, urlcheck){
        if(err)
            return next(err);
        if(!urlcheck){
            return res.status(404).json({
            
                message: "No UrlCheck with this name was found in your account."
                
            });
        }
        urlcheck.remove(function(err){
            if(err)
                return next(err);

            return res.status(200).json({
            
                    message: "UrlCheck: "+ urlcheck.name + " was deleted successfully."
        
            });
        });
    });
};


exports.UpdateById = function(req, res, next) {
    var valid = req.params._id && typeof req.params._id === 'string'
    if(!valid){
        return res.status(422).json({
            
            message: "id is a required param."
            
        });
    }

    UrlCheck.findOne({owner: req.user._id, _id: req.params._id}).exec(function(err, urlcheck){
        if(err)
            return next(err);
        if(!urlcheck){
            return res.status(404).json({
            
                message: "No UrlCheck with this id was found in your account."
                
            });
        }
        var updateFields = {};
        if(req.body.name){
            if(!typeof(req.body.name) === 'string'){
                return res.status(422).json({
            
                    message: "name should be of type (String)."
                    
                });
            }
            UrlCheck.findOne({owner: req.user._id, name: req.body.name}).exec(function(err, urlcheck){
                if(err)
                    return next(err);
                if(urlcheck){
                    return res.status(409).json({
                    
                        message: "This account has a urlcheck with the same name. Please choose a unique name."
                        
                    });
                }
            });
            updateFields.name = req.body.name;
        }  
        
        if(req.body.protocol){
            if(!typeof(req.body.protocol) === 'string' || !['HTTP', 'HTTPS', 'TCP'].includes(req.body.protocol)){
                return res.status(422).json({
            
                    message: "protocol should be of type (String) 'HTTP'or 'HTTPS'or 'TCP'"
                    
                });
            }
            updateFields.protocol = req.body.protocol;
        } 

        if(req.body.url){
            if(!typeof(req.body.url) === 'string' || !URL_REGEX.test(req.body.url)){
                return res.status(422).json({
            
                    message: "url should be of type (String) and represents valid url."
                    
                });
            }
            updateFields.url = req.body.url;
        } 

        if(req.body.ignoreSSL){
            if(!typeof(req.body.ignoreSSL) === 'string' || !(req.body.ignoreSSL === 'true' || req.body.ignoreSSL === 'false')){
                return res.status(422).json({
            
                    message: "ignoreSSL should be of type (boolean) i.e (true or false)."
                    
                });
            }
            updateFields.ignoreSSL = req.body.ignoreSSL;
        }

        if(req.body.path){
            if(!typeof(req.body.path) === 'string'){
                return res.status(422).json({
            
                    message: "optional field path should be of type (String)."
                    
                });
            }
            updateFields.path = req.body.path;
        }

        if(req.body.webhook){
            if(!typeof(req.body.webhook) === 'string' && URL_REGEX.test(req.body.webhook)){
                return res.status(422).json({
            
                    message: "optional field webhhook should be of type (String) and is valid url format."
                    
                });
            }
            updateFields.webhook = req.body.webhook;
        }

        if(req.body.timeout){
            if(!typeof(req.body.timeout) === 'number'){
                return res.status(422).json({
            
                    message: "optional field timeout should be of type (number) in seconds."
                    
                });
            }
            updateFields.timeout = req.body.timeout;
        }

        if(req.body.interval){
            if(!typeof(req.body.interval) === 'number'){
                return res.status(422).json({
            
                    message: "optional field interval should be of type (number) in seconds."
                    
                });
            }
            updateFields.interval = req.body.interval;
        }


        if(req.body.threshold){
            if(!typeof(req.body.threshold) === 'number'){
                return res.status(422).json({
            
                    message: "optional field threshold should be of type (number)."
                    
                });
            }
            updateFields.threshold = req.body.threshold;
        }

        if(req.body.authentication){
            if(!isJSON(req.body.authentication)
            ||  !JSON.parse(req.body.authentication).username 
            ||  !JSON.parse(req.body.authentication).password
            ){
                return res.status(422).json({
            
                    message: "optional field authentication should be of type (String) in a JSON format and has a username and password field of type (String)."
                    
                });
            }
            updateFields.authentication = {
                username: JSON.parse(req.body.authentication).username,
                password: JSON.parse(req.body.authentication).password
            };
        }

        if(req.body.httpHeaders){
            if(!isJSON(req.body.httpHeaders)){
                return res.status(422).json({
            
                    message: "optional field httpHeaders should be of type (String) in a JSON format."
                    
                });
            }
            updateFields.httpHeaders = JSON.parse(req.body.httpHeaders);
        }

        if(req.body.assert){
            if(!isJSON(req.body.assert) 
            || !JSON.parse(req.body.assert).statusCode){
                return res.status(422).json({
            
                    message: "optional field assert should be of type (String) in a JSON format and has the field statusCode of type (Number)."
                    
                });
            }
            updateFields.assert = {
                statusCode: JSON.parse(req.body.assert).statusCode
            };
        }

        if(req.body.tags){
            if(!Array.isArray(req.body.tags)){
                return res.status(422).json({
            
                    message: "optional field tags should be of type (Array)."
                    
                });
            }
            updateFields.tags = req.body.tags;
        }

        UrlCheck.findOneAndUpdate({_id: urlcheck._id},
			updateFields, function (err, updatedUrlCheck) {
                if(err)
                    return next(err);

                return res.status(200).json({
                    message: "UrlCheck: "+ updatedUrlCheck.name + " was updated successfully.",
                    data: updatedUrlCheck
                });        
                
            }
        );   
    });
};


exports.UpdateByName = function(req, res, next) {
    var valid = req.params.name && typeof req.params.name === 'string'
    if(!valid){
        return res.status(422).json({
            
            message: "name is a required param."
            
        });
    }

    UrlCheck.findOne({owner: req.user._id, name: req.params.name}).exec(function(err, urlcheck){
        if(err)
            return next(err);
        if(!urlcheck){
            return res.status(404).json({
            
                message: "No UrlCheck with this name was found in your account."
                
            });
        }
        var updateFields = {};
        if(req.body.name){
            if(!typeof(req.body.name) === 'string'){
                return res.status(422).json({
            
                    message: "name should be of type (String)."
                    
                });
            }
            UrlCheck.findOne({owner: req.user._id, name: req.body.name}).exec(function(err, urlcheck){
                if(err)
                    return next(err);
                if(urlcheck){
                    return res.status(409).json({
                    
                        message: "This account has a urlcheck with the same name. Please choose a unique name."
                        
                    });
                }
            });
            updateFields.name = req.body.name;
        }  
        
        if(req.body.protocol){
            if(!typeof(req.body.protocol) === 'string' || !['HTTP', 'HTTPS', 'TCP'].includes(req.body.protocol)){
                return res.status(422).json({
            
                    message: "protocol should be of type (String) 'HTTP'or 'HTTPS'or 'TCP'"
                    
                });
            }
            updateFields.protocol = req.body.protocol;
        } 

        if(req.body.url){
            if(!typeof(req.body.url) === 'string' || !URL_REGEX.test(req.body.url)){
                return res.status(422).json({
            
                    message: "url should be of type (String) and represents valid url."
                    
                });
            }
            updateFields.url = req.body.url;
        } 

        if(req.body.ignoreSSL){
            if(!typeof(req.body.ignoreSSL) === 'string' || !(req.body.ignoreSSL === 'true' || req.body.ignoreSSL === 'false')){
                return res.status(422).json({
            
                    message: "ignoreSSL should be of type (boolean) i.e (true or false)."
                    
                });
            }
            updateFields.ignoreSSL = req.body.ignoreSSL;
        }

        if(req.body.path){
            if(!typeof(req.body.path) === 'string'){
                return res.status(422).json({
            
                    message: "optional field path should be of type (String)."
                    
                });
            }
            updateFields.path = req.body.path;
        }

        if(req.body.webhook){
            if(!typeof(req.body.webhook) === 'string' && URL_REGEX.test(req.body.webhook)){
                return res.status(422).json({
            
                    message: "optional field webhhook should be of type (String) and is valid url format."
                    
                });
            }
            updateFields.webhook = req.body.webhook;
        }

        if(req.body.timeout){
            if(!typeof(req.body.timeout) === 'number'){
                return res.status(422).json({
            
                    message: "optional field timeout should be of type (number) in seconds."
                    
                });
            }
            updateFields.timeout = req.body.timeout;
        }

        if(req.body.interval){
            if(!typeof(req.body.interval) === 'number'){
                return res.status(422).json({
            
                    message: "optional field interval should be of type (number) in seconds."
                    
                });
            }
            updateFields.interval = req.body.interval;
        }


        if(req.body.threshold){
            if(!typeof(req.body.threshold) === 'number'){
                return res.status(422).json({
            
                    message: "optional field threshold should be of type (number)."
                    
                });
            }
            updateFields.threshold = req.body.threshold;
        }

        if(req.body.authentication){
            if(!isJSON(req.body.authentication)
            ||  !JSON.parse(req.body.authentication).username 
            ||  !JSON.parse(req.body.authentication).password
            ){
                return res.status(422).json({
            
                    message: "optional field authentication should be of type (String) in a JSON format and has a username and password field of type (String)."
                    
                });
            }
            updateFields.authentication = {
                username: JSON.parse(req.body.authentication).username,
                password: JSON.parse(req.body.authentication).password
            };
        }

        if(req.body.httpHeaders){
            if(!isJSON(req.body.httpHeaders)){
                return res.status(422).json({
            
                    message: "optional field httpHeaders should be of type (String) in a JSON format."
                    
                });
            }
            updateFields.httpHeaders = JSON.parse(req.body.httpHeaders);
        }

        if(req.body.assert){
            if(!isJSON(req.body.assert) 
            || !JSON.parse(req.body.assert).statusCode){
                return res.status(422).json({
            
                    message: "optional field assert should be of type (String) in a JSON format and has the field statusCode of type (Number)."
                    
                });
            }
            updateFields.assert = {
                statusCode: JSON.parse(req.body.assert).statusCode
            };
        }

        if(req.body.tags){
            if(!Array.isArray(req.body.tags)){
                return res.status(422).json({
            
                    message: "optional field tags should be of type (Array)."
                    
                });
            }
            updateFields.tags = req.body.tags;
        }

        UrlCheck.findOneAndUpdate({_id: urlcheck._id},
			updateFields, function (err, updatedUrlCheck) {
                if(err)
                    return next(err);

                return res.status(200).json({
                    message: "UrlCheck: "+ updatedUrlCheck.name + " was updated successfully.",
                    data: updatedUrlCheck
                });        
                
            }
        );   
    });
};
