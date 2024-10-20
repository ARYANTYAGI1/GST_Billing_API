const UserController = require("../../controllers/admin/UserController")

module.exports = function(app) {
    app.post('/admin/api/register', function(req, res){
        UserController.signup(req, res);
    })
}