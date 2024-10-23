const UserController = require("../../controllers/admin/UserController")

module.exports = function(app) {
    app.post('/admin/api/register', function(req, res){
        UserController.addUser(req, res);
    })
    app.get('/account/verify', function(req, res) {
        UserController.verifyEmail(req, res);
    });
    app.post('/admin/api/login', function(req, res){
        UserController.login(req,res);
    })
    app.post('/admin/api/account/forgot-password', function(req, res){
        UserController.forgotPassword(req,res);
    })
    app.post('/account/reset-password', function(req, res){
        UserController.resetPassword(req,res);
    })
}