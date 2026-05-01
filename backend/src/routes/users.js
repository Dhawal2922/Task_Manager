'use strict';

const router = require('express').Router();
const verifyToken = require('../middleware/auth');
const requireRole = require('../middleware/rbac');
const { User } = require('../models');

/** GET /api/users — Admin only */
router.get('/', verifyToken, requireRole('Admin'), async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });
    return res.status(200).json({ success: true, data: { users } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
