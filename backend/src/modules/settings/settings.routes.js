const express = require('express');
const router = express.Router();
const {
  getAllSettings,
  getSettingByKey,
  updateSetting,
  generateLiveAvatarApiKey,
  validateApiKey,
} = require('./settings.controller');
const { authenticateToken, authorizeRoles } = require('../../middleware/auth.middleware');

// Validasi API key — publik (dipakai oleh layanan eksternal)
router.post('/api-key/validate', validateApiKey);

// Semua route berikut butuh login
router.use(authenticateToken);

// GET semua settings (semua user login bisa lihat, tapi value secret di-mask untuk non-admin)
router.get('/', getAllSettings);

// GET satu setting by key
router.get('/:key', getSettingByKey);

// PUT update setting (admin only)
router.put('/:key', authorizeRoles('admin'), updateSetting);

// POST generate ulang API key (admin only)
router.post('/api-key/generate', authorizeRoles('admin'), generateLiveAvatarApiKey);

module.exports = router;
