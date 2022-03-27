var fetch = require('node-fetch');

exports.pushNotification = function(webhook, message){
    fetch(webhook, { method: 'POST', body: `message=${message}`});
}