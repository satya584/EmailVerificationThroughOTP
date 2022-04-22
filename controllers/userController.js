const User = require('../models/userModel.js')
const bcrypt = require('bcrypt')
const AppError = require('../utilities/apperror.js')
const UserOtpVerification = require('../models/userOtpVerification.js')

const mailgun = require("mailgun-js");
const DOMAIN = process.env.DOMAIN_NAME;
const mg = mailgun({ apiKey: process.env.MAILGUN_APIKEY, domain: DOMAIN });

const sendOtpVerificationEmail = async ({ _id, email, username }, res) => {
    try {
        const otp = `${Math.floor((Math.random() * 900000) + 100000)}`;
        const data = {
            from: 'noreply@gmail.com',
            to: email,
            subject: 'You’re almost done!',
            text: ` Hi ${username},
        
            We just need to verify your email address before you can access our [customer portal].
            
            Verify your email address with the following OTP   [${otp}]
            
            Thanks! – The Apps Deployer team`
        };
        const salt = bcrypt.genSaltSync(10)
        const hashOtp = await bcrypt.hashSync(otp, salt)

        const newUserOtpVerification = await new UserOtpVerification({
            userId: _id,
            otp: hashOtp,
            createAt: Date.now(),
            expireAt: Date.now() + 300000
        })
        await newUserOtpVerification.save()
        await mg.messages().send(data, function (error, body) {
            console.log(body);
        })
        res.redirect(`/otpVerification/${newUserOtpVerification.userId}`);

    } catch (err) {
        console.log(err)
    }
}
const sucessfullyRegisterdEmail = async ({ _id, email, username }, res) => {
    try {
        const data = {
            from: 'noreply@gmail.com',
            to: email,
            subject: 'Congratulation!!!, You have Sucessfully Registered your account',
            text: ` Hi ${username},
        
            You have sucessfully registered your account through ${email}. Now you can access our cusomer portal.
            
            Thanks! – The Apps Deployer team`
        };
        await mg.messages().send(data, function (error, body) {
            console.log(body);
        })
    } catch (err) {
        console.log(err)
    }
}

module.exports = {
    homePage: (req, res) => {
        res.render('home.ejs')
    },
    secretPage: async (req, res, next) => {
        try {
            const { userId } = req.params;
            const findOneUser = await User.findById(userId);
            res.render('secret', { findOneUser })
        } catch (err) {
            next(err)
        }
    },
    editSecretPage: async (req, res, next) => {
        try {
            const { userId } = req.params
            const findOneUser = await User.findById(userId);
            res.render('editSecret.ejs', { findOneUser })

        } catch (err) {
            next(err)
        }
    },
    editSecret: async (req, res, next) => {
        try {
            const { userId } = req.params
            const { username, img } = req.body
            const findOneUser = await User.findById(userId);
            findOneUser.username = username
            findOneUser.img = img
            await findOneUser.save()
            res.redirect(`/secret/${userId}`)

        } catch (err) {
            next(err)
        }
    },
    loginPage: (req, res) => {
        try {
            res.render('login.ejs')
        } catch (err) {
            console.log(err);
        }
    },
    register: async (req, res, next) => {
        try {
            const { username, password, email } = req.body
            const findOneUser = await User.findOne({ username });
            if (findOneUser) {
                throw new AppError('please try again username is taken', 404);
            }

            const salt = bcrypt.genSaltSync(12)
            const hash = await bcrypt.hashSync(password, salt)
            const newUser = new User({
                username: username, password: hash, email: email
            })
            await newUser.save().then((newUser) => {
                sendOtpVerificationEmail(newUser, res);
            })

        } catch (err) {
            next(err)
        }
    },
    registerPage: (req, res) => {
        res.render('register.ejs');
    },
    login: async (req, res, next) => {
        try {
            const { username, password } = req.body;
            const findOneUser = await User.findOne({ username })
            if (!findOneUser) {
                throw new AppError('Please try again, User not found', 404);
            }

            const result = await bcrypt.compareSync(password, findOneUser.password);

            if (!result) {
                throw new AppError('Either Username or Password is Wrong , Plase try again !!')
            }
            res.redirect(`/secret/${findOneUser._id}`)

        } catch (err) {
            next(err)
        }
    },
    otpVerificationPage: async (req, res) => {
        const { userId } = req.params
        res.render('otpVerificationPage.ejs', { userId })
    },
    otpVerification: async (req, res, next) => {
        try {
            const { userId } = req.params
            const { otp } = req.body;
            if (!userId || !otp) {
                throw new AppError('Empty OTP details are not allowed', 404)
            }
            const userOtpVerificationRecord = await UserOtpVerification.find({ userId })
            if (!userOtpVerificationRecord) {
                throw new AppError('Account Record does not exist . Please Register or Login')
            }
            if (userOtpVerificationRecord[0].expireAt < Date.now()) {
                await UserOtpVerification.deleteMany({ userId })
                throw new AppError('Verification code has expired, Please request Again')
            }
            const validOtp = bcrypt.compareSync(otp, userOtpVerificationRecord[0].otp);
            if (!validOtp) {
                throw new AppError('Invalid Code Passed, Please recheck the inbox')
            }
            await User.updateOne({ _id: userId }, { verified: true })
            await UserOtpVerification.deleteMany({ userId })
            const findOneUser = await User.findById(userId)
            sucessfullyRegisterdEmail({ _id: userId, username: findOneUser.username, email: findOneUser.email }, res);
            res.redirect(`/secret/${userId}`)

        } catch (err) {
            next(err);
        }
    },
    resendOtpVerification: async (req, res, next) => {
        try {
            const { userId, email } = req.body;
            if (!userId || !email) {
                throw new AppError('Empty User details are not allowed', 404)
            }
            const findOneUser = await User.findById(userId)
            await UserOtpVerification.deleteMany({ userId });
            sendOtpVerificationEmail({ _id: userId, email, username: findOneUser.username }, res)

        } catch (err) {
            next(err)
        }
    },

}