'use strict';
module.exports = function(app) {
  var userController = require('../controllers/user.controller');

  // App Routes
  app.route('/api/create-account/')
    .post(userController.register);
  app.route('/api/verify-account-by-token/:token')
    .get(userController.verify);
  app.route('/api/get-token/')
    .post(userController.getToken);
  app.route('/api/ping/')
    .get(userController.ping);
};
