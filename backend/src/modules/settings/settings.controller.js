const crypto = require('crypto');
const { query } = require('../../config/database');

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Mask semua karakter kecuali 6 karakter terakhir */
const maskValue = (value) => {
  if (!value || value.length <= 6) return '\u2022'.repeat(12);
  return '\u2022'.repeat(value.length - 6) + value.slice(-6);
};

/** Generate API key format: lva_<32 hex chars> */
const generateApiKey = () => {
  return 'lva_' + crypto.randomBytes(24).toString('hex');
};

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * GET /api/settings
 * Ambil semua pengaturan. Value yang is_secret akan di-mask kecuali admin.
 */
const getAllSettings = async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT id, key, label, description, is_secret,
              CASE WHEN is_secret = true AND $1 != 'admin' THEN NULL ELSE value END AS value,
              category, is_active, updated_at
       FROM settings
       ORDER BY category, key`,
      [req.user.role]
    );

    // Sembunyikan value secret dari non-admin (tampilkan masked)
    const formatted = rows.map((row) => ({
      ...row,
      masked_value: row.is_secret ? maskValue(row.value) : null,
      // Hapus value mentah untuk non-admin
      value: req.user.role === 'admin' ? row.value : undefined,
    }));

    return res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error('getAllSettings error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * GET /api/settings/:key
 * Ambil satu pengaturan berdasarkan key.
 */
const getSettingByKey = async (req, res) => {
  try {
    const { key } = req.params;
    const { rows } = await query(
      'SELECT id, key, label, description, is_secret, value, category, is_active, updated_at FROM settings WHERE key = $1',
      [key]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: `Setting '${key}' tidak ditemukan` });
    }

    const setting = rows[0];

    // Mask value secret untuk non-admin
    if (setting.is_secret && req.user.role !== 'admin') {
      setting.value = maskValue(setting.value);
    }

    return res.status(200).json({ success: true, data: setting });
  } catch (error) {
    console.error('getSettingByKey error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * PUT /api/settings/:key
 * Update value pengaturan. Admin only.
 */
const updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value, label, description, is_active } = req.body;

    const { rows } = await query(
      `UPDATE settings
       SET value = COALESCE($1, value),
           label = COALESCE($2, label),
           description = COALESCE($3, description),
           is_active = COALESCE($4, is_active),
           updated_at = NOW(),
           updated_by = $5
       WHERE key = $6
       RETURNING id, key, label, description, is_secret, value, category, is_active, updated_at`,
      [value ?? null, label ?? null, description ?? null, is_active ?? null, req.user.id, key]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: `Setting '${key}' tidak ditemukan` });
    }

    return res.status(200).json({
      success: true,
      message: 'Pengaturan berhasil diperbarui',
      data: rows[0],
    });
  } catch (error) {
    console.error('updateSetting error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * POST /api/settings/api-key/generate
 * Generate ulang API key LiveAvatar. Admin only.
 */
const generateLiveAvatarApiKey = async (req, res) => {
  try {
    const newApiKey = generateApiKey();

    const { rows } = await query(
      `UPDATE settings
       SET value = $1, updated_at = NOW(), updated_by = $2
       WHERE key = 'liveavatar_api_key'
       RETURNING id, key, label, is_secret, updated_at`,
      [newApiKey, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Setting API Key tidak ditemukan' });
    }

    return res.status(200).json({
      success: true,
      message: 'API Key berhasil di-generate ulang',
      data: {
        ...rows[0],
        value: newApiKey, // Tampilkan sekali saja
        masked_value: maskValue(newApiKey),
      },
    });
  } catch (error) {
    console.error('generateLiveAvatarApiKey error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * POST /api/settings/api-key/validate
 * Validasi API key dari request eksternal.
 */
const validateApiKey = async (req, res) => {
  try {
    const { api_key } = req.body;

    if (!api_key) {
      return res.status(400).json({ success: false, message: 'api_key diperlukan' });
    }

    const { rows } = await query(
      `SELECT key, is_active FROM settings
       WHERE key = 'liveavatar_api_key' AND value = $1`,
      [api_key]
    );

    if (rows.length === 0 || !rows[0].is_active) {
      return res.status(401).json({ success: false, message: 'API Key tidak valid atau tidak aktif' });
    }

    return res.status(200).json({ success: true, message: 'API Key valid' });
  } catch (error) {
    console.error('validateApiKey error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  getAllSettings,
  getSettingByKey,
  updateSetting,
  generateLiveAvatarApiKey,
  validateApiKey,
};
