const express = require('express');
const router = express.Router();
const { register, login, refreshToken, logout, getMe } = require('./auth.controller');
const { authenticateToken } = require('../../middleware/auth.middleware');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

// Protected routes
router.get('/me', authenticateToken, getMe);

module.exports = router;
