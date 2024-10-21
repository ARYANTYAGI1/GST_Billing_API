const UserController = require("../../controllers/admin/UserController")

module.exports = function(app) {
    app.post('/admin/api/register', function(req, res){
        UserController.addUser(req, res);
    })
    app.post('/account/verify/:id/:email/:token', function(req, res){
        UserController.verifyEmail(req, res);
    })
}