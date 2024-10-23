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
    login: async function(req, res) {
        try {
            const { email, password} = req.body;
            const user = await User.findOne({email: email, userType: { $in: [1, 2, 3] }});
            if(!user) return res.status(401).send({ success: false, message: 'Invalid Email Or Password', data: null });
            if(!user.isActive) return res.status(400).send({ success: false, message: 'Account Blocked Please contact to Admin', data: null})
            if(!user.isEmailVerified) return res.status(400).send({ success: false, message: 'E-mail is not verified yet', data: null})
            const isPasswordValid = await CommonHelper.comparePassword(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).send({ success: false, message: 'Invalid Email Or Password', data: null });
            }
            token = AuthHelper.generateToken(user);
            res.status(200).send({ success: true, message: 'Login Success', data: { user: user._id, token: token }})
        } catch (error) {
            res.status(500).send({ success: false, message: 'Something Went Wrong', data: error});
        }
    },
    forgotPassword: async (req, res) => {
        try {
            req.body.email = req.body.email.trim();
            const user = await User.findOne({ email: req.body.email });
            if (!user) {
                return res.status(404).send({ success: false, message: 'Email not registered with us', data: null });
            }
            const token = AuthHelper.generateToken(user);
            user.resetPasswordToken = token;
            await user.save();
            const resetLink = `${process.env.API_URL}/account/reset-password?email=${user.email}&token=${token}`;
            const context = {
                name: user.firstName,
                link: resetLink,
            };
            await MailHelper.sendEmail(user.email, user.fullName, 'Password Reset Request', 'forgotPassword', context);
            return res.status(200).send({ success: true, message: 'Password reset link sent to email', data: null });
        } catch (err) {
            console.error('Forgot Password Error:', err);
            return res.status(500).send({ success: false, message: 'Something went wrong', data: err });
        }
    },
    resetPassword: async (req, res) => {
        try {
            const { email, token, newPassword } = req.body;
            const user = await User.findOne({ email, resetPasswordToken: token });
            if (!user) {
                return res.status(400).send({ success: false, message: 'Invalid or expired token', data: null });
            }
            const hashedPassword = await CommonHelper.bcryptPassword(newPassword);
            user.password = hashedPassword;
            user.resetPasswordToken = '';
            await user.save();
            return res.status(200).send({ success: true, message: 'Password reset successful', data: null });
        } catch (err) {
            return res.status(500).send({ success: false, message: 'Something went wrong', data: err });
        }
    }
};
