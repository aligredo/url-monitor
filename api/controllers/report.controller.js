var mongoose = require('mongoose'),
  UrlCheck = mongoose.model('UrlCheck');

exports.getByUrlCheckId = function(req, res, next) {
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
           
        return res.status(200).json({
            
            message: "UrlCheck: "+ returnedData.name + " report was retrieved successfully.",
            data: returnedData.report
            
        });

    });
};

exports.getByUrlCheckName = function(req, res, next) {
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
           
        return res.status(200).json({
            
            message: "UrlCheck: "+ returnedData.name + " report was retrieved successfully.",
            data: returnedData.report
            
        });

    });
};


exports.getByTag = function(req, res, next) {
    var valid = req.params.tag && typeof req.params.tag === 'string'
    if(!valid){
        return res.status(422).json({
            
            message: "tag is a required param."
            
        });
    }
    UrlCheck.find({owner: req.user._id, tags: req.params.tag }).exec(function(err, urlchecks){
        if(err)
            return next(err);
        if(!urlchecks){
            return res.status(404).json({
            
                message: "No UrlChecks with this tag was found in your account."
                
            });
        }
        var returnedData = {};
        for (let index = 0; index < urlchecks.length; index++) {
            returnedData += urlchecks[i].name + ": "
            returnedData = returnedData.concat(JSON.parse(JSON.stringify(urlchecks[i])));
            returnedData += '\n';
            returnedData += '-------------------------------------------------------';
            returnedData += '\n';

        }
        var returnedData = JSON.parse(JSON.stringify(urlchecks));
        return res.status(200).json({
            
            message: "UrlChecks' tagged with: "+ req.body.tag + " reports was retrieved successfully.",
            data: returnedData
            
        });

    });
};