const express = require('express');
const res = require('express/lib/response');
const router = express.Router();
const { loginPage, register, login, otpVerification, resendOtpVerification, registerPage, otpVerificationPage, homePage, secretPage, editSecretPage, editSecret } = require('../controllers/userController.js')

router.get('/home', homePage)
router.get('/secret/:userId', secretPage)
router.get('/secret/:userId/edit', editSecretPage)
router.patch('/secret/:userId/edit', editSecret)

router.get('/login', loginPage)
router.post('/login', login)
router.get('/register', registerPage)
router.post('/register', register)
router.get('/otpVerification/:userId', otpVerificationPage)
router.post('/otpVerification/:userId', otpVerification)
router.post('/resendOtpVerification', resendOtpVerification)

module.exports = router;