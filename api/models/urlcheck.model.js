'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ReportSchema = require('./report.model');

var AuthenticationSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    }
});

var AssertSchema = new Schema({
    statusCode: {
        type: Number,
        required: true
    }
});
var UrlCheckSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true
    },
    protocol: {
        type: String,
        required:true,
        enum: ['HTTP', 'HTTPS', 'TCP'],
        message: 'Must be one of the following options ["HTTP", "HTTPS", "TCP"]'
    },
    path: {
        type: String
    },
    webhook: {
        type: String
    },
    timeout: {
        type: Number,
        default: 5
    },
    interval: {
        type: Number,
        default: 600
    },
    threshold: {
        type: Number,
        default: 1
    },
    authentication: AuthenticationSchema,
    httpHeaders: {
        type: Map,
        of: String
    },
    assert: AssertSchema,
    tags: {
        type: [String]
    },
    ignoreSSL: {
        type: Boolean,
        required: true,
        default: false
    },
    owner: {
        type: String,
        required: true
    },
    report: {
        type: ReportSchema,
        required: true
    }

})

mongoose.model('UrlCheck', UrlCheckSchema);