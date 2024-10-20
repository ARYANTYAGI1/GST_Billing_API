const mongoose = require('mongoose');

const DBConnect = async(req, res)=>{
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('DB Connected...')
    } catch (error) {
        console.log('Error in Connecting DB', error)
    }
}

module.exports = DBConnect;