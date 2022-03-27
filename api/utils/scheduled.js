var cron = require('node-cron'),
    moment = require('moment'),
    urlcheckController = require('../controllers/urlcheck.controller');

    for (let minute = 1; minute <= 1; minute++) {
        cron.schedule(`*/${minute} * * * *`, () => {
            console.log('\x1b[34m%s\x1b[0m', moment().format('MMMM Do YYYY, h:mm:ss a') + ' started url monitoring batch job for ' + minute + '-minute interval urls.\n');
            urlcheckController.runCheckByInterval(minute);
          });  
    }
