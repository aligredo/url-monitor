'use strict';
module.exports = function(app) {
  var userController = require('../controllers/user.controller'),
      urlcheckController = require('../controllers/urlcheck.controller'),
      reportController = require('../controllers/report.controller'),
      authify = require('../middlewares/authify');

  // User Routes
  app.route('/api/user/create-account/')
    .post(userController.register);
  app.route('/api/user/verify-account-by-token/:token')
    .get(userController.verify);
  app.route('/api/user/get-token/')
    .get(userController.getToken);
  app.route('/api/user/delete-account/')
    .delete(authify, userController.deleteUser);
    
 // UrlCheck Routes
  app.route('/api/urlcheck/create-urlcheck/')
    .post(authify, urlcheckController.create);
  app.route('/api/urlcheck/get-urlcheck-by-id/:_id')
    .get(authify, urlcheckController.getById);
  app.route('/api/urlcheck/delete-urlcheck-by-id/:_id')
    .delete(authify, urlcheckController.deleteById);
  app.route('/api//urlcheckupdate-urlcheck-by-id/:_id')
    .put(authify, urlcheckController.UpdateById);
  app.route('/api/urlcheck/get-urlcheck-by-name/:name')
    .get(authify, urlcheckController.getByName);
  app.route('/api/urlcheck/delete-urlcheck-by-name/:name')
    .delete(authify, urlcheckController.deleteByName);
  app.route('/api/urlcheck/update-urlcheck-by-name/:name')
    .put(authify, urlcheckController.UpdateByName);
  app.route('/api/urlcheck/get-urlchecks/')
    .get(authify, urlcheckController.getAllUrlChecksByUser);

  // Report Routes
  app.route('/api/report/get-report-by-urlcheck-id/:_id')
    .get(authify, reportController.getByUrlCheckId);
  app.route('/api/report/get-report-by-urlcheck-name/:name')
    .get(authify, reportController.getByUrlCheckName);
  app.route('/api/report/get-reports-by-tag/:tag')
    .get(authify, reportController.getByTag);
};
