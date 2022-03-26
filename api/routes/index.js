'use strict';
module.exports = function(app) {
  var userController = require('../controllers/user.controller');
  var urlcheckController = require('../controllers/urlcheck.controller');
  var authify = require('../middlewares/authify');

  // User Routes
  app.route('/api/create-account/')
    .post(userController.register);
  app.route('/api/verify-account-by-token/:token')
    .get(userController.verify);
  app.route('/api/get-token/')
    .post(userController.getToken);
  app.route('/api/delete-account/')
    .delete(authify, userController.deleteUser);
    
 // UrlCheck Routes
  app.route('/api/create-urlcheck/')
    .post(authify, urlcheckController.create);
  app.route('/api/get-urlcheck-by-id/:_id')
    .get(authify, urlcheckController.getById);
  app.route('/api/delete-urlcheck-by-id/:_id')
    .delete(authify, urlcheckController.deleteById);
  app.route('/api/update-urlcheck-by-id/:_id')
    .put(authify, urlcheckController.UpdateById);
  app.route('/api/get-urlcheck-by-name/:name')
    .get(authify, urlcheckController.getByName);
  app.route('/api/delete-urlcheck-by-name/:name')
    .delete(authify, urlcheckController.deleteByName);
  app.route('/api/update-urlcheck-by-name/:name')
    .put(authify, urlcheckController.UpdateByName);
  
};
