'use strict';

const router = require('express').Router();
const { signup, login, me } = require('../controllers/authController');
const verifyToken = require('../middleware/auth');
const { signupSchema, loginSchema, validate } = require('../validators/schemas');

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.get('/me', verifyToken, me);

module.exports = router;
