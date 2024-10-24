const express = require('express');
const DBConnect = require('./config/db');
const cors = require('cors'); // Importing the cors package
const app = express();
require('dotenv').config()

DBConnect();

// Apply CORS middleware
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

require('./routes')(app);

// const UserController = require('./controllers/admin/UserController');
// UserController.createDefaultAdmin()

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server Started at ${PORT}`);
});
