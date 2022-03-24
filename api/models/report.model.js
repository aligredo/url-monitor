'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ReportSchema = new Schema({
    status: {
        type: String,
        enum: ['UP', 'DOWN'],
        required: true,
    },
    availability: {
        type: String,
        required: true
    },
    outages: {
        type: Number,
        required: true
    },
    downtime: {
        type: Number,
        required: true
    },
    uptime: {
        type: Number,
        required: true
    },
    responseTime: {
        type: Number,
        required: true
    },
    history:{
        type: String,
        required: true
    }
})

mongoose.model('ReportSchema', ReportSchema);