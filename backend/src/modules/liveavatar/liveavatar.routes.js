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

// ── Public routes (tidak perlu login) ────────────────────────────────────────

// GET  /api/liveavatar/avatars/all     — private + public merged (live dari API)
router.get('/avatars/all', getAllAvatars);

// GET  /api/liveavatar/avatars/public  — public only (live dari API)
router.get('/avatars/public', getPublicAvatars);

// GET  /api/liveavatar/avatars/local   — baca dari tabel DB lokal
router.get('/avatars/local', getLocalAvatars);

// GET  /api/liveavatar/avatars         — private only (live dari API)
router.get('/avatars', getAvatars);

// GET  /api/liveavatar/avatars/:avatarId
router.get('/avatars/:avatarId', getAvatarById);

// ── Protected routes (perlu login admin) ─────────────────────────────────────

// POST /api/liveavatar/avatars/sync    — fetch API → simpan ke DB (admin only)
router.post('/avatars/sync', authenticateToken, authorizeRoles('admin'), syncAvatars);

module.exports = router;
