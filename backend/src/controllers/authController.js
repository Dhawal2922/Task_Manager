'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const SALT_ROUNDS = 12;

/** POST /api/auth/signup */
const signup = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ name, email, password_hash, role });

    const token = signToken(user.id);
    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: { token, user: sanitize(user) },
    });
  } catch (err) {
    next(err);
  }
};

/** POST /api/auth/login */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Use the withPassword scope to get the hash
    const user = await User.scope('withPassword').findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = signToken(user.id);
    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: { token, user: sanitize(user) },
    });
  } catch (err) {
    next(err);
  }
};

/** GET /api/auth/me */
const me = async (req, res) => {
  return res.status(200).json({ success: true, data: { user: req.user } });
};

/** PUT /api/auth/profile */
const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByPk(req.user.id);
    
    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) return res.status(409).json({ success: false, message: 'Email already in use.' });
    }

    await user.update({ name, email });
    return res.status(200).json({ success: true, message: 'Profile updated.', data: { user: sanitize(user) } });
  } catch (err) {
    next(err);
  }
};

/** PUT /api/auth/password */
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.scope('withPassword').findByPk(req.user.id);

    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) return res.status(401).json({ success: false, message: 'Incorrect current password.' });

    const password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await user.update({ password_hash });

    return res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    next(err);
  }
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function sanitize(user) {
  const { password_hash, ...safe } = user.toJSON ? user.toJSON() : user;
  return safe;
}

module.exports = { signup, login, me, updateProfile, updatePassword };
