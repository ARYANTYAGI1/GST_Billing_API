const User = require('../../models/User');
const CommonHelper = require('../../helpers/common');
const MailHelper = require('../../helpers/mail');
const AuthHelper = require('../../helpers/auth');

module.exports = {
    createDefaultAdmin: async function (req, res) {
        const nuser = {
            fullName: process.env.ADMIN_FULLNAME,
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
            isEmailVerified: process.env.ADMIN_EMAIL_VERIFIED === 'true',
            userType: parseInt(process.env.ADMIN_USER_TYPE),
            address: {
                fullAddress: process.env.ADMIN_ADDRESS_FULL,
                location: {
                    type: 'Point',
                    coordinates: [
                        parseFloat(process.env.ADMIN_ADDRESS_COORDINATES_LONG),
                        parseFloat(process.env.ADMIN_ADDRESS_COORDINATES_LAT)
                    ]
                }
            }
        };     
        try {
            let usr = await User.findOne({ email: nuser.email });
            if (!usr) {
                let user = new User(nuser);
                user.password = await CommonHelper.bcryptPassword(nuser.password);
                await user.save();
                console.log("Super Admin created successfully");
            } else {
                usr.fullName = nuser.fullName;
                usr.isEmailVerified = nuser.isEmailVerified;
                usr.address = nuser.address;
                await usr.save();
                console.log("Super Admin updated successfully");
            }
        } catch (err) {
            console.error('Error creating or updating Super Admin:', err);
        }
    },
    addUser: async function (req, res) {
        let { email, password, fullName, address, userType } = req.body;
        let emailExists, user, token, link;
        email = email.trim();
        try {
            if (![1, 2, 3, 4].includes(userType)) {
                return res.status(400).send({ success: false, message: "Invalid user type.", data: null });
            }
            emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).send({ success: false, message: "Email Already Exists", data: null });
            }
            password = await CommonHelper.bcryptPassword(password);
            req.body.password = password;
            user = new User(req.body);
            token = AuthHelper.generateToken(user);
            user.emailVerifyToken = token;
            link = `${process.env.API_URL}/account/verify?id=${user._id}&email=${user.email}&token=${token}`
            await user.save();
            const context = {
                name: fullName,
                link: link,
            };
            await MailHelper.sendEmail(email, fullName, 'Email Verification', 'emailVerification', context);
            res.status(200).send({ success: true, message: 'User created and verification email sent successfully', data: { _id: user._id }});
        } catch (err) {
            console.error(err);
            return res.status(500).send({ success: false, message: 'Something went wrong', data: err });
        }
    },
    verifyEmail: async function (req, res) {  
        try {
            const { id, email, token } = req.query;
            const user = await User.findOne({
                $and: [
                    { _id: id },
                    { email: email },
                    { emailVerifyToken: token }
                ]
            });
            if (!user) {
                return res.status(404).send({
                    success: false,
                    message: 'Link Expired O rInvalid',
                    data: null
                });
            }
            user.emailVerifyToken = '';
            user.isEmailVerified = true;
            await user.save();
            return res.status(200).send({
                success: true,
                message: 'Your Account Verified Not Login',
                data: null
            });
        } catch (err) {
            return res.status(500).send({
                success: false,
                message: 'Something Went Wrong',
                data: err
            });
        }
    }, 
};
