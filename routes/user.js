const UserController = require("../controllers/User.Controller")

module.exports = function(app) {
    app.post('/admin/api/register', function(req, res){
        UserController.signup(req, res);
    })
}