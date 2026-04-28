const https = require('https');
const http = require('http');
const { query } = require('../../config/database');

/* ─── Helpers ───────────────────────────────────────────────────────────── */

const getLiveAvatarApiKey = async () => {
  const { rows } = await query(
    `SELECT value FROM settings WHERE key = 'liveavatar_api_key' AND is_active = true LIMIT 1`
  );
  return rows[0]?.value || null;
};

const getLiveAvatarBaseUrl = async () => {
  const { rows } = await query(
    `SELECT value FROM settings WHERE key = 'liveavatar_api_url' AND is_active = true LIMIT 1`
  );
  return (rows[0]?.value || 'https://api.liveavatar.com').replace(/\/$/, '');
};

const buildApiBase = (storedUrl) => {
  const base = storedUrl.replace(/\/+$/, '');
  return base.endsWith('/v1') ? base : `${base}/v1`;
};

const fetchUrl = (url, headers = {}) => {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const lib = parsedUrl.protocol === 'https:' ? https : http;
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', ...headers },
    };
    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, data: { raw: data } }); }
      });
    });
    req.on('error', reject);
    req.setTimeout(12000, () => { req.destroy(); reject(new Error('Request timeout')); });
    req.end();
  });
};

const normalizeItems = (raw) => {
  // LiveAvatar API: { code, data: { count, results: [...] } }
  if (Array.isArray(raw?.data?.results)) return raw.data.results;
  if (Array.isArray(raw?.results)) return raw.results;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.avatars)) return raw.avatars;
  if (Array.isArray(raw?.items)) return raw.items;
  return [];
};

const extractTotal = (raw) => {
  // LiveAvatar API: { data: { count } }
  return raw?.data?.count ?? raw?.total ?? raw?.total_count ?? raw?.count ?? 0;
};

const extractPagination = (raw, items, pageSize) => {
  const total = extractTotal(raw) || items.length;
  const computed = Math.ceil(total / pageSize);
  const total_pages = (raw?.data?.total_pages ?? raw?.total_pages ?? raw?.pages ?? computed) || 1;
  return { total, total_pages };
};

/* ─── Sync helper: upsert avatars ke tabel lokal ─────────────────────── */
const upsertAvatarsToDb = async (items, isPublic) => {
  if (!items || items.length === 0) return 0;
  let count = 0;
  for (const avatar of items) {
    const avatarId  = String(avatar.id ?? avatar.avatar_id ?? '');
    if (!avatarId) continue;
    const name      = avatar.name ?? avatar.avatar_name ?? avatar.title ?? null;
    const gender    = avatar.gender ?? avatar.sex ?? null;
    const language  = avatar.language ?? avatar.lang ?? null;
    // LiveAvatar API uses 'type' for style (VIDEO, IMAGE, etc)
    const style     = avatar.style ?? avatar.type ?? null;
    // LiveAvatar API uses uppercase status (ACTIVE, PROCESSING, etc)
    const status    = avatar.status ?? avatar.state ?? null;
    // LiveAvatar API uses preview_url for thumbnail
    const thumbnail = avatar.preview_url ?? avatar.thumbnail ?? avatar.thumbnail_url ?? avatar.preview ?? avatar.image ?? null;
    const rawData   = JSON.stringify(avatar);


    await query(
      `INSERT INTO avatars
         (avatar_id, name, gender, language, style, status, thumbnail, is_public, raw_data, synced_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       ON CONFLICT (avatar_id) DO UPDATE SET
         name      = EXCLUDED.name,
         gender    = EXCLUDED.gender,
         language  = EXCLUDED.language,
         style     = EXCLUDED.style,
         status    = EXCLUDED.status,
         thumbnail = EXCLUDED.thumbnail,
         is_public = EXCLUDED.is_public,
         raw_data  = EXCLUDED.raw_data,
         synced_at = NOW()`,
      [avatarId, name, gender, language, style, status, thumbnail, isPublic, rawData]
    );
    count++;
  }
  return count;
};

/* ─── Controllers ────────────────────────────────────────────────────────── */

/**
 * GET /api/liveavatar/avatars
 * Proxy → /v1/avatars (private, API key required)
 */
const getAvatars = async (req, res) => {
  try {
    const apiKey = await getLiveAvatarApiKey();
    if (!apiKey) {
      return res.status(503).json({
        success: false,
        message: 'LiveAvatar API Key tidak dikonfigurasi. Silakan atur di Pengaturan.',
      });
    }
    const storedUrl = await getLiveAvatarBaseUrl();
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.page_size) || 20;
    const url = `${buildApiBase(storedUrl)}/avatars?page=${page}&page_size=${pageSize}`;
    console.log(`[LiveAvatar] GET ${url}`);
    const result = await fetchUrl(url, { 'X-API-KEY': apiKey });
    if (result.status >= 400) {
      return res.status(result.status).json({ success: false, message: result.data?.message || 'Gagal mengambil data', upstream: result.data });
    }
    const items = normalizeItems(result.data).map((a) => ({ ...a, is_public: false }));
    const pagination = extractPagination(result.data, items, pageSize);
    return res.status(200).json({ success: true, data: { avatars: items, ...pagination }, meta: { page, page_size: pageSize } });
  } catch (error) {
    console.error('[LiveAvatar] getAvatars error:', error.message);
    return res.status(503).json({ success: false, message: `Error: ${error.message}` });
  }
};

/**
 * GET /api/liveavatar/avatars/public
 * Proxy → /v1/avatars/public (no API key)
 */
const getPublicAvatars = async (req, res) => {
  try {
    const storedUrl = await getLiveAvatarBaseUrl();
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.page_size) || 20;
    const url = `${buildApiBase(storedUrl)}/avatars/public?page=${page}&page_size=${pageSize}`;
    console.log(`[LiveAvatar] GET ${url}`);
    const result = await fetchUrl(url);
    if (result.status >= 400) {
      return res.status(result.status).json({ success: false, message: result.data?.message || 'Gagal mengambil public avatars', upstream: result.data });
    }
    const items = normalizeItems(result.data).map((a) => ({ ...a, is_public: true }));
    const pagination = extractPagination(result.data, items, pageSize);
    return res.status(200).json({ success: true, data: { avatars: items, ...pagination }, meta: { page, page_size: pageSize } });
  } catch (error) {
    console.error('[LiveAvatar] getPublicAvatars error:', error.message);
    return res.status(503).json({ success: false, message: `Error: ${error.message}` });
  }
};

/**
 * GET /api/liveavatar/avatars/all
 * Merge private + public, returns with is_public field
 */
const getAllAvatars = async (req, res) => {
  try {
    const apiKey = await getLiveAvatarApiKey();
    const storedUrl = await getLiveAvatarBaseUrl();
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.page_size) || 20;
    const apiBase = buildApiBase(storedUrl);

    const [privateResult, publicResult] = await Promise.allSettled([
      apiKey
        ? fetchUrl(`${apiBase}/avatars?page=${page}&page_size=${pageSize}`, { 'X-API-KEY': apiKey })
        : Promise.resolve({ status: 200, data: [] }),
      fetchUrl(`${apiBase}/avatars/public?page=${page}&page_size=${pageSize}`),
    ]);

    const privateItems = (privateResult.status === 'fulfilled' && privateResult.value.status < 400)
      ? normalizeItems(privateResult.value.data).map((a) => ({ ...a, is_public: false }))
      : [];

    const publicItems = (publicResult.status === 'fulfilled' && publicResult.value.status < 400)
      ? normalizeItems(publicResult.value.data).map((a) => ({ ...a, is_public: true }))
      : [];

    // Deduplicate by id
    const seen = new Set();
    const merged = [];
    for (const item of [...privateItems, ...publicItems]) {
      const id = item.id ?? item.avatar_id ?? JSON.stringify(item);
      if (!seen.has(id)) { seen.add(id); merged.push(item); }
    }

    const privPag = privateResult.status === 'fulfilled'
      ? extractPagination(privateResult.value.data, privateItems, pageSize)
      : { total: 0, total_pages: 1 };
    const pubPag = publicResult.status === 'fulfilled'
      ? extractPagination(publicResult.value.data, publicItems, pageSize)
      : { total: 0, total_pages: 1 };

    return res.status(200).json({
      success: true,
      data: {
        avatars: merged,
        total: privPag.total + pubPag.total,
        total_pages: Math.max(privPag.total_pages, pubPag.total_pages),
        private_count: privateItems.length,
        public_count: publicItems.length,
      },
      meta: { page, page_size: pageSize },
    });
  } catch (error) {
    console.error('[LiveAvatar] getAllAvatars error:', error.message);
    return res.status(503).json({ success: false, message: `Error: ${error.message}` });
  }
};

/**
 * POST /api/liveavatar/avatars/sync
 * Fetch private + public avatars dari LiveAvatar API, simpan ke tabel avatars lokal
 */
const syncAvatars = async (req, res) => {
  try {
    const apiKey = await getLiveAvatarApiKey();
    const storedUrl = await getLiveAvatarBaseUrl();
    const apiBase = buildApiBase(storedUrl);

    // Fetch page 1 private (jika ada API key)
    let privateSynced = 0;
    if (apiKey) {
      const privResult = await fetchUrl(`${apiBase}/avatars?page=1&page_size=100`, { 'X-API-KEY': apiKey });
      if (privResult.status < 400) {
        const items = normalizeItems(privResult.data);
        privateSynced = await upsertAvatarsToDb(items, false);
      }
    }

    // Fetch page 1 public
    const pubResult = await fetchUrl(`${apiBase}/avatars/public?page=1&page_size=100`);
    let publicSynced = 0;
    if (pubResult.status < 400) {
      const items = normalizeItems(pubResult.data);
      publicSynced = await upsertAvatarsToDb(items, true);
    }

    const total = privateSynced + publicSynced;
    console.log(`[LiveAvatar] Sync: ${privateSynced} private + ${publicSynced} public = ${total} avatars`);

    return res.status(200).json({
      success: true,
      message: `Berhasil sync ${total} avatar ke database (${privateSynced} privat, ${publicSynced} publik)`,
      data: { synced: total, private_synced: privateSynced, public_synced: publicSynced },
    });
  } catch (error) {
    console.error('[LiveAvatar] syncAvatars error:', error.message);
    return res.status(500).json({ success: false, message: `Gagal sync: ${error.message}` });
  }
};

/**
 * GET /api/liveavatar/avatars/local
 * Baca dari tabel avatars lokal di DB
 */
const getLocalAvatars = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.page_size) || 20;
    const isPublicFilter = req.query.is_public;
    const offset = (page - 1) * pageSize;

    let whereClause = '';
    const params = [pageSize, offset];

    if (isPublicFilter === 'true') {
      whereClause = 'WHERE is_public = true';
    } else if (isPublicFilter === 'false') {
      whereClause = 'WHERE is_public = false';
    }

    const [rowsResult, countResult] = await Promise.all([
      query(`SELECT * FROM avatars ${whereClause} ORDER BY synced_at DESC LIMIT $1 OFFSET $2`, params),
      query(`SELECT COUNT(*) FROM avatars ${whereClause}`),
    ]);

    const total = parseInt(countResult.rows[0].count);
    return res.status(200).json({
      success: true,
      data: {
        avatars: rowsResult.rows,
        total,
        total_pages: Math.ceil(total / pageSize) || 1,
      },
      meta: { page, page_size: pageSize },
    });
  } catch (error) {
    console.error('[LiveAvatar] getLocalAvatars error:', error.message);
    return res.status(500).json({ success: false, message: `Error: ${error.message}` });
  }
};

/**
 * GET /api/liveavatar/avatars/:avatarId
 */
const getAvatarById = async (req, res) => {
  try {
    const apiKey = await getLiveAvatarApiKey();
    if (!apiKey) return res.status(503).json({ success: false, message: 'API Key tidak dikonfigurasi.' });
    const storedUrl = await getLiveAvatarBaseUrl();
    const { avatarId } = req.params;
    const url = `${buildApiBase(storedUrl)}/avatars/${avatarId}`;
    const result = await fetchUrl(url, { 'X-API-KEY': apiKey });
    if (result.status >= 400) {
      return res.status(result.status).json({ success: false, message: result.data?.message || 'Avatar tidak ditemukan' });
    }
    return res.status(200).json({ success: true, data: result.data });
  } catch (error) {
    console.error('[LiveAvatar] getAvatarById error:', error.message);
    return res.status(503).json({ success: false, message: `Error: ${error.message}` });
  }
};

module.exports = { getAvatars, getPublicAvatars, getAllAvatars, syncAvatars, getLocalAvatars, getAvatarById };
