const express = require('express');
const router = express.Router();
const {
  getAvatars,
  getPublicAvatars,
  getAllAvatars,
  syncAvatars,
  getLocalAvatars,
  getAvatarById,
} = require('./liveavatar.controller');
const { authenticateToken, authorizeRoles } = require('../../middleware/auth.middleware');

// Semua route perlu login
router.use(authenticateToken);

// GET  /api/liveavatar/avatars/all     — private + public merged (live dari API)
router.get('/avatars/all', getAllAvatars);

// GET  /api/liveavatar/avatars/public  — public only (live dari API)
router.get('/avatars/public', getPublicAvatars);

// GET  /api/liveavatar/avatars/local   — baca dari tabel DB lokal
router.get('/avatars/local', getLocalAvatars);

// POST /api/liveavatar/avatars/sync    — fetch API → simpan ke DB (admin only)
router.post('/avatars/sync', authorizeRoles('admin'), syncAvatars);

// GET  /api/liveavatar/avatars         — private only (live dari API)
router.get('/avatars', getAvatars);

// GET  /api/liveavatar/avatars/:avatarId
router.get('/avatars/:avatarId', getAvatarById);

module.exports = router;
