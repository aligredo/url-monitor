'use strict';

const { Headers } = require('node-fetch');




var mongoose = require('mongoose'),
  UrlCheck = mongoose.model('UrlCheck'),
  User = mongoose.model('User'),
  URL_REGEX = require("../config/").URL_REGEX,
  emailSender = require("../utils/emailSender"),
  webhookpush = require("../utils/webhookpush"),
  isJSON = require('../utils/isJSON'),
  fetch = require('node-fetch'),
  http = require('http'),
  https = require('https'),
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
            
                    message: "optional field webhook should be of type (String) and is valid url format."
                    
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
            if(!typeof(req.body.interval) === 'number' && !(req.body.interval > 0 && req.body.interval < 61)){
                return res.status(422).json({
            
                    message: "optional field interval should be of type (number) in range [1-60] minutes."
                    
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
            history:  moment().format('MMMM Do YYYY, h:mm:ss a') + ' urlcheck added ::::> Not Monitored Yet.\n' 
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

exports.getAllUrlChecksByUser = function(req, res, next) {
    UrlCheck.findOne({owner: req.user._id}).exec(function(err, urlchecks){
        if(err)
            return next(err);
        if(!urlchecks){
            return res.status(404).json({
            
                message: "No UrlChecks was found in your account."
                
            });
        }
            
        return res.status(200).json({
            
            message: "Your Urlchecks were retrieved successfully.",
            data: urlchecks
            
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
            
                    message: "optional field webhook should be of type (String) and is valid url format."
                    
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
            if(!typeof(req.body.interval) === 'number' && !(req.body.interval > 0 && req.body.interval < 61)){
                return res.status(422).json({
            
                    message: "optional field interval should be of type (number) in range [1-60] minutes."
                    
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
                    message: "UrlCheck: "+ updatedUrlCheck.name + " was updated successfully."
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
            
                    message: "optional field webhook should be of type (String) and is valid url format."
                    
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
            if(!typeof(req.body.interval) === 'number' && !(req.body.interval > 0 && req.body.interval < 61)){
                return res.status(422).json({
            
                    message: "optional field interval should be of type (number) in range [1-60] minutes."
                    
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
                    message: "UrlCheck: "+ updatedUrlCheck.name + " was updated successfully."
                });        
                
            }
        );   
    });
};

exports.runCheckByInterval = function(interval){
    UrlCheck.find({interval: interval}).exec(function(err, urlchecks){
        urlchecks.forEach(urlcheck => {
            sendPollRequest(urlcheck).then(result =>  writeInReport(urlcheck, result));
        });
    })
}; 

var sendPollRequest = async function(urlcheck){
    
    const AbortController = globalThis.AbortController || await import('abort-controller');

    const httpAgent = new http.Agent({ keepAlive: true });
    const httpsAgent = new https.Agent({ keepAlive: true, rejectUnauthorized: !urlcheck.ignoreSSL});
    const agent = urlcheck.protocol == 'HTTP' ? httpAgent : httpsAgent;    
   

    var url = '';
    if(urlcheck.protocol == 'HTTP' || urlcheck.protocol == 'HTTPS'){
        url += (urlcheck.protocol.toLowerCase() + '://');
    }
    url += urlcheck.url;
    if(urlcheck.port){
        url += `:${urlcheck.port}`
    }
    if(urlcheck.path){
        url += `/${urlcheck.path}`
    }

    var headers = {};
    if(urlcheck.httpHeaders){
        headers = JSON.stringify(urlcheck.httpHeaders)
    }
    if(urlcheck.authentication){
        headers['Authorization'] = `Basic ${urlcheck.authentication.username}:${urlcheck.authentication.password}`
    }


    const controller = new AbortController();
    const timeout = setTimeout(() => {
        controller.abort();
    }, urlcheck.timeout * 1000);
    
    try {
        let startTime = performance.now();
        var statusCode = await fetch(url,
            {  
                signal: controller.signal,
                Headers: new Headers(headers),
                agent
            }).then(res => {return res.status});
        let endTime = performance.now();
        return {time: moment().format('MMMM Do YYYY, h:mm:ss a'), statusCode: statusCode, timeout: false, responseTime: Math.ceil(endTime - startTime)};
    
    } catch (error) {
        return {time: moment().format('MMMM Do YYYY, h:mm:ss a'), statusCode: statusCode, timeout: true};
    } finally {
        clearTimeout(timeout);
    }    
   
};

var writeInReport = function(urlcheck, result){
    UrlCheck.findOne({_id: urlcheck._id}).exec(function(err, urlchecktobeupdated){
        if(!result.timeout){
            if((urlchecktobeupdated.assert && urlchecktobeupdated.assert.statusCode == result.statusCode) || result.statusCode == 200){
                urlchecktobeupdated.report.status = 'UP';
                urlchecktobeupdated.report.uptime += 60;
                urlchecktobeupdated.report.history += `=> Successfull poll on ${result.time}.`;
                urlchecktobeupdated.report.history += '\n'
                urlchecktobeupdated.report.responseTime = Math.ceil(((urlchecktobeupdated.report.responseTime * (urlchecktobeupdated.report.history.split('=>').length)) + result.responseTime) / (urlchecktobeupdated.report.history.split('=>').length + 1)); 
            }
            else{
                urlchecktobeupdated.report.status = 'DOWN';
                urlchecktobeupdated.report.downtime += 60;
                urlchecktobeupdated.report.outages += 1;
                urlchecktobeupdated.report.history += `!> Unsuccessful poll on ${result.time} response status code: ${result.statusCode}.`;
                urlchecktobeupdated.report.history += '\n'

            }
        }
        else{
            urlchecktobeupdated.report.status = 'DOWN';
            urlchecktobeupdated.report.downtime += 60;
            urlchecktobeupdated.report.outages += 1;
            urlchecktobeupdated.report.history += `!> Unsuccessful poll on ${result.time} request timed out.`;
            urlchecktobeupdated.report.history += '\n'
        }

        urlchecktobeupdated.report.availability =  ((urlchecktobeupdated.report.uptime) / (urlchecktobeupdated.report.downtime +  urlchecktobeupdated.report.uptime) * 100 + '%');        
        UrlCheck.findOneAndUpdate({_id: urlcheck._id},
			urlchecktobeupdated, function (err, updatedUrlCheck) {});   
       
        if((urlcheck.report.status != urlchecktobeupdated.report.status && urlchecktobeupdated.report.outages % urlcheck.threshold == 0) || 
        (urlcheck.report.status == 'DOWN' && urlchecktobeupdated.report.status == 'UP')){
            User.findOne({_id: urlcheck.owner}).exec(function(err, user){
                emailSender.sendEmail(user.email, `UrlCheck: ${urlcheck.name} is ${urlchecktobeupdated.report.status}`,
                `Hello!\n your urlcheck: ${urlcheck.name} is currently ${urlchecktobeupdated.report.status}.\n Bye!`);
            });
            if(urlcheck.webhook){
                webhookpush.pushNotification(urlcheck.webhook, `UrlCheck: ${urlcheck.name} is ${urlchecktobeupdated.report.status}`)
            }
        }
    });
};
