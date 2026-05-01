'use strict';

const router = require('express').Router();
const verifyToken = require('../middleware/auth');
const { getDashboardStats } = require('../controllers/dashboardController');

router.get('/stats', verifyToken, getDashboardStats);

module.exports = router;
