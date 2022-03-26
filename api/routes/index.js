'use strict';
module.exports = function(app) {
  var userController = require('../controllers/user.controller'),
      urlcheckController = require('../controllers/urlcheck.controller'),
      reportController = require('../controllers/report.controller'),
      authify = require('../middlewares/authify');

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

  // Report Routes
  app.route('/api/get-report-by-urlcheck-id/:_id')
    .get(authify, reportController.getByUrlCheckId);
  app.route('/api/get-report-by-urlcheck-name/:name')
    .get(authify, reportController.getByUrlCheckName);
  app.route('/api/get-reports-by-tag/:tag')
    .get(authify, reportController.getByTag);
};
