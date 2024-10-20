const express = require('express');
const DBConnect = require('./config/db');
const app = express();
require('dotenv').config()

DBConnect();

app.use(express.json())

require('./routes')(app)

// const UserController = require('./controllers/admin/UserController');
// UserController.createDefaultAdmin()

const PORT = process.env.PORT || 3001
app.listen(PORT, ()=>{
    console.log(`Server Started at ${PORT}`);
})