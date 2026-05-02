'use strict';

const router = require('express').Router();
const { signup, login, me, updateProfile, updatePassword } = require('../controllers/authController');
const verifyToken = require('../middleware/auth');
const { signupSchema, loginSchema, validate } = require('../validators/schemas');

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.get('/me', verifyToken, me);
router.put('/profile', verifyToken, updateProfile);
router.put('/password', verifyToken, updatePassword);

module.exports = router;
