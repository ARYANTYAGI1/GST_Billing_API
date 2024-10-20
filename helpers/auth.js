const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'ARYAN#123';

const generateToken = (user) => {
    const payload = {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        userType: user.userType,
    };
    const options = {
        expiresIn: '1h',
    };
    const token = jwt.sign(payload, JWT_SECRET, options);
    return token;
};

module.exports = {
    generateToken
}