import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import '../styles/settings.css';

const TABS = [
  { id: 'liveavatar', label: 'LiveAvatar', icon: (<svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>) },
  { id: 'api', label: 'API & Integrasi', icon: (<svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>) },
  { id: 'avatar', label: 'Konfigurasi Avatar', icon: (<svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>) },
  { id: 'general', label: 'Umum', icon: (<svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" /></svg>) },
];
const categoryTabMap = { api: 'api', avatar: 'avatar', general: 'general' };

const LiveAvatarStatus = ({ settings, isAdmin }) => {
  const [connStatus, setConnStatus] = useState('idle');
  const [testing, setTesting] = useState(false);
  const apiUrl = settings.find(s => s.key === 'liveavatar_api_url')?.value || '—';
  const model = settings.find(s => s.key === 'liveavatar_model')?.value || '—';
  const maxSessions = settings.find(s => s.key === 'liveavatar_max_sessions')?.value || '—';
  const apiKeyActive = settings.find(s => s.key === 'liveavatar_api_key')?.is_active;
  const testConnection = async () => {
    setTesting(true); setConnStatus('checking');
    try { await api.get('/health'); setConnStatus('connected'); }
    catch { setConnStatus('disconnected'); }
    finally { setTesting(false); }
  };
  const connLabel = { idle: 'Belum dicek', checking: 'Memeriksa...', connected: 'Terhubung', disconnected: 'Tidak Terhubung' }[connStatus];
  return (
    <div className="lva-status-card">
      <div className="lva-status-header">
        <div className="lva-status-title">
          <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
          <h3>Status LiveAvatar</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          {connStatus !== 'idle' && <div className={`conn-indicator ${connStatus}`}><div className="dot" />{connLabel}</div>}
          <button className="btn-test-conn" onClick={testConnection} disabled={testing}>
            <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
            {testing ? 'Memeriksa...' : 'Test Koneksi'}
          </button>
        </div>
      </div>
      <div className="lva-status-grid">
        <div className="lva-stat-item"><p className="lva-stat-label">API Endpoint</p><p className="lva-stat-value" style={{ fontSize: '0.78rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>{apiUrl}</p></div>
        <div className="lva-stat-item"><p className="lva-stat-label">Model Aktif</p><p className="lva-stat-value">{model}</p></div>
        <div className="lva-stat-item"><p className="lva-stat-label">Maks. Sesi</p><p className="lva-stat-value green">{maxSessions}</p></div>
        <div className="lva-stat-item"><p className="lva-stat-label">Status API Key</p><p className={`lva-stat-value ${apiKeyActive ? 'green' : 'red'}`}>{apiKeyActive ? '● Aktif' : '● Nonaktif'}</p></div>
      </div>
    </div>
  );
};

const AvatarList = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [avatars, setAvatars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [syncMsg, setSyncMsg] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [counts, setCounts] = useState({ private: 0, public: 0 });
  const [hasFetched, setHasFetched] = useState(false);
  const [filterPublic, setFilterPublic] = useState('all');
  const [viewMode, setViewMode] = useState('db');

  const fetchLive = useCallback(async (p = 1) => {
    setLoading(true); setError(null);
    try {
      const res = await api.get(`/liveavatar/avatars/all?page=${p}&page_size=${pageSize}`);
      const raw = res.data.data;
      const items = Array.isArray(raw?.avatars) ? raw.avatars : [];
      setAvatars(items);
      setTotalItems(raw?.total ?? items.length);
      setTotalPages(Math.ceil((raw?.total ?? items.length) / pageSize) || 1);
      setCounts({ private: raw?.private_count ?? 0, public: raw?.public_count ?? 0 });
      setPage(p);
    } catch (err) { setError(err.response?.data?.message || err.message); }
    finally { setLoading(false); setHasFetched(true); }
  }, [pageSize]);

  const fetchLocal = useCallback(async (p = 1, pf = 'all') => {
    setLoading(true); setError(null);
    try {
      const q = pf === 'public' ? '&is_public=true' : pf === 'private' ? '&is_public=false' : '';
      const res = await api.get(`/liveavatar/avatars/local?page=${p}&page_size=${pageSize}${q}`);
      const raw = res.data.data;
      const items = Array.isArray(raw?.avatars) ? raw.avatars : [];
      setAvatars(items);
      setTotalItems(raw?.total ?? items.length);
      setTotalPages(Math.ceil((raw?.total ?? items.length) / pageSize) || 1);
      setCounts({ public: items.filter(a => a.is_public).length, private: items.filter(a => !a.is_public).length });
      setPage(p);
    } catch (err) { setError(err.response?.data?.message || err.message); }
    finally { setLoading(false); setHasFetched(true); }
  }, [pageSize]);

  useEffect(() => { fetchLocal(1); }, [fetchLocal]);

  const handleSync = async () => {
    setSyncing(true); setSyncMsg(null); setError(null);
    try {
      const res = await api.post('/liveavatar/avatars/sync');
      setSyncMsg(res.data.message || 'Sync berhasil');
      setViewMode('db');
      await fetchLocal(1, filterPublic);
      setTimeout(() => setSyncMsg(null), 5000);
    } catch (err) { setError(err.response?.data?.message || 'Gagal sync'); }
    finally { setSyncing(false); }
  };

  const handleFilter = (val) => { setFilterPublic(val); if (viewMode === 'db') fetchLocal(1, val); };
  const handleMode = (m) => {
    setViewMode(m); setAvatars([]); setError(null); setHasFetched(false);
    if (m === 'live') fetchLive(1); else fetchLocal(1, filterPublic);
  };
  const refresh = (p = page) => { if (viewMode === 'live') fetchLive(p); else fetchLocal(p, filterPublic); };
  const filtered = viewMode === 'live' ? avatars.filter(a => filterPublic === 'public' ? a.is_public : filterPublic === 'private' ? !a.is_public : true) : avatars;
  const colSpan = viewMode === 'db' ? 9 : 8;

  const renderRow = (avatar, idx) => {
    const id = avatar.avatar_id ?? avatar.id ?? idx;
    const name = avatar.name ?? `Avatar ${idx + 1}`;
    const statusVal = avatar.status ?? '';
    const sc = statusVal.toUpperCase() === 'ACTIVE' ? '#22c55e'
      : statusVal.toUpperCase() === 'PROCESSING' ? '#f59e0b'
        : statusVal ? '#ef4444' : null;

    return (
      <tr key={id}>
        <td style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>{(page - 1) * pageSize + idx + 1}</td>
        <td><div className="avatar-thumb-cell">{avatar.thumbnail ? <img src={avatar.thumbnail} alt={name} loading="lazy" /> : <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>}</div></td>
        <td><p className="avatar-table-name">{name}</p><p className="avatar-table-id">{String(id).slice(0, 24)}{String(id).length > 24 ? '…' : ''}</p></td>
        <td>{avatar.gender ? <span className="avatar-tag">{avatar.gender === 'male' || avatar.gender === 'M' ? '♂ Pria' : '♀ Wanita'}</span> : <span className="av-dash">—</span>}</td>
        <td>{avatar.language ? <span className="avatar-tag">{avatar.language}</span> : <span className="av-dash">—</span>}</td>
        <td>{avatar.style ? <span className="avatar-tag">{avatar.style}</span> : <span className="av-dash">—</span>}</td>
        <td>{sc ? <span className="avatar-status-badge" style={{ background: `${sc}20`, color: sc, border: `1px solid ${sc}40` }}>● {avatar.status}</span> : <span className="av-dash">—</span>}</td>
        <td>{avatar.is_public ? <span className="avatar-public-badge yes">✓ Ya</span> : <span className="avatar-public-badge no">✗ Tidak</span>}</td>
        {viewMode === 'db' && <td style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>{avatar.synced_at ? new Date(avatar.synced_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}</td>}
      </tr>
    );
  };

  return (
    <div className="avatar-list-section">
      <div className="section-header" style={{ marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h3>🤖 Daftar Avatar</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto', flexWrap: 'wrap' }}>
          <div className="avatar-filter-tabs">
            <button className={`avatar-filter-btn${viewMode === 'db' ? ' active' : ''}`} onClick={() => handleMode('db')}>🗄 Database{viewMode === 'db' && totalItems > 0 && <span className="filter-count">{totalItems}</span>}</button>
            <button className={`avatar-filter-btn${viewMode === 'live' ? ' active' : ''}`} onClick={() => handleMode('live')}>🌐 Live API</button>
          </div>
          <div className="avatar-filter-tabs">
            {[['all', 'Semua'], ['public', 'Publik'], ['private', 'Privat']].map(([val, label]) => (
              <button key={val} className={`avatar-filter-btn${filterPublic === val ? ' active' : ''}`} onClick={() => handleFilter(val)}>
                {label}
                {val === 'all' && totalItems > 0 && <span className="filter-count">{totalItems}</span>}
                {val === 'public' && counts.public > 0 && <span className="filter-count">{counts.public}</span>}
                {val === 'private' && counts.private > 0 && <span className="filter-count">{counts.private}</span>}
              </button>
            ))}
          </div>
          {isAdmin && <button className="btn-sync-db" onClick={handleSync} disabled={syncing} id="sync-avatars-btn"><svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>{syncing ? 'Sync...' : 'Sync ke DB'}</button>}
          <button className="btn-test-conn" onClick={() => refresh(page)} disabled={loading} id="refresh-avatars-btn"><svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>{loading ? 'Memuat...' : 'Refresh'}</button>
        </div>
      </div>
      {syncMsg && <div className="avatar-sync-banner"><svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>{syncMsg}</div>}
      {error && <div className="avatar-error"><svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg><div><p style={{ fontWeight: 600 }}>Error</p><p style={{ fontSize: '0.8rem', opacity: 0.8 }}>{error}</p></div><button className="btn-test-conn" onClick={() => refresh(page)} style={{ marginLeft: 'auto' }}>Coba Lagi</button></div>}
      <div className="avatar-table-wrap">
        <table className="avatar-table">
          <thead><tr>
            <th style={{ width: 40 }}>#</th><th style={{ width: 52 }}>Foto</th><th>Nama / ID</th>
            <th>Gender</th><th>Bahasa</th><th>Style</th><th>Status</th>
            <th style={{ width: 88 }}>Publik</th>
            {viewMode === 'db' && <th style={{ width: 110 }}>Synced At</th>}
          </tr></thead>
          <tbody>
            {loading ? Array.from({ length: 5 }).map((_, i) => <tr key={i} className="skeleton-row">{Array.from({ length: colSpan }).map((__, j) => <td key={j}><div className="skeleton-line" style={{ width: j === 2 ? '70%' : '45%' }} /></td>)}</tr>)
              : filtered.length === 0
                ? <tr><td colSpan={colSpan} style={{ textAlign: 'center', padding: '2.5rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem' }}>
                  {hasFetched ? (viewMode === 'db' ? <><span>Belum ada avatar di database. Klik </span><strong style={{ color: '#a78bfa' }}>Sync ke DB</strong><span> untuk import dari LiveAvatar API.</span></> : 'Tidak ada avatar dari API.') : 'Memuat...'}
                </td></tr>
                : filtered.map((a, i) => renderRow(a, i))}
          </tbody>
        </table>
      </div>
      {!loading && totalPages > 1 && (
        <div className="avatar-pagination">
          <button className="pag-btn" onClick={() => { const p = page - 1; setPage(p); refresh(p); }} disabled={page <= 1}><svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg></button>
          <span className="pag-info">Hal {page}/{totalPages} <span style={{ opacity: 0.4 }}>({totalItems})</span></span>
          <button className="pag-btn" onClick={() => { const p = page + 1; setPage(p); refresh(p); }} disabled={page >= totalPages}><svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg></button>
        </div>
      )}
    </div>
  );
};

const SettingCard = ({ setting, isAdmin, revealedKeys, toggleReveal, copyToClipboard, editValues, setEditValues, saving, handleSave, newApiKey }) => {
  const isApiKey = setting.key === 'liveavatar_api_key';
  const revealed = revealedKeys.has(setting.key) || (isApiKey && newApiKey);
  const currentValue = (() => {
    if (isApiKey && newApiKey) return newApiKey;
    if (!setting.is_secret) return setting.value ?? '';
    if (revealed) return setting.value || '(nilai tersembunyi)';
    return null;
  })();
  const editVal = isApiKey && newApiKey ? newApiKey : (editValues[setting.key] ?? '');
  return (
    <div className={`setting-card ${isApiKey ? 'highlight' : ''}`} style={isApiKey ? { color: '#ffffff', WebkitTextFillColor: '#ffffff' } : undefined}>
      <div className="setting-meta">
        <div className="setting-label-row">
          <span className="setting-label" style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}>{setting.label}</span>
          {setting.is_secret && <span className="badge secret" style={{ background: 'rgba(124,58,237,0.4)', color: '#e9d5ff', WebkitTextFillColor: '#e9d5ff', border: '1px solid rgba(167,139,250,0.5)' }}>🔒 Secret</span>}
          <span className={`badge status ${setting.is_active ? 'active' : 'inactive'}`} style={setting.is_active ? { background: 'rgba(34,197,94,0.25)', color: '#bbf7d0', WebkitTextFillColor: '#bbf7d0', border: '1px solid rgba(34,197,94,0.4)' } : { background: 'rgba(239,68,68,0.25)', color: '#fecaca', WebkitTextFillColor: '#fecaca', border: '1px solid rgba(239,68,68,0.4)' }}>
            {setting.is_active ? 'Aktif' : 'Nonaktif'}
          </span>
        </div>
        <p className="setting-key"><code style={{ color: 'rgba(200,200,220,0.9)', WebkitTextFillColor: 'rgba(200,200,220,0.9)', background: 'rgba(255,255,255,0.1)' }}>{setting.key}</code></p>
        {setting.description && <p className="setting-description" style={{ color: 'rgba(200,200,220,0.75)', WebkitTextFillColor: 'rgba(200,200,220,0.75)' }}>{setting.description}</p>}
      </div>
      <div className="setting-value-row">
        {setting.is_secret ? (
          <div className="secret-field">
            <div className="secret-value">{revealed ? <span className="revealed">{currentValue}</span> : <span className="masked">{'•'.repeat(32)}</span>}</div>
            <div className="secret-actions">
              <button className="icon-btn" onClick={() => toggleReveal(setting.key)} title={revealed ? 'Sembunyikan' : 'Tampilkan'} disabled={!isAdmin && !newApiKey}>
                {revealed ? <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" /><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" /></svg> : <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>}
              </button>
              {isAdmin && <button className="icon-btn copy" onClick={() => copyToClipboard(currentValue || '', setting.label)} title="Salin" disabled={!revealed}><svg viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" /></svg></button>}
            </div>
          </div>
        ) : (
          <div className="editable-field">
            <input id={`setting-input-${setting.key}`} type="text" value={editVal} onChange={e => setEditValues(v => ({ ...v, [setting.key]: e.target.value }))} disabled={!isAdmin} className={!isAdmin ? 'readonly' : ''} placeholder={isAdmin ? 'Masukkan nilai...' : '—'} />
            {isAdmin && <button className={`btn-save ${saving === setting.key ? 'loading' : ''}`} onClick={() => handleSave(setting.key)} disabled={saving === setting.key || editVal === (setting.value ?? '')}>{saving === setting.key ? <span className="btn-spinner sm" /> : 'Simpan'}</button>}
            <button className="icon-btn copy" onClick={() => copyToClipboard(editVal, setting.label)} title="Salin"><svg viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" /></svg></button>
          </div>
        )}
      </div>
      {setting.updated_at && <p className="setting-updated">Diperbarui: {new Date(setting.updated_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>}
    </div>
  );
};

/** Parse stored value: JSON array string OR plain string → string[] */
const parseUrls = (raw) => {
  if (!raw || !raw.trim()) return [''];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.length > 0 ? parsed : [''];
  } catch { /* plain string fallback */ }
  return [raw.trim()];
};

const isValidUrl = (u) => { try { new URL(u); return true; } catch { return false; } };

const LiveAvatarUrlManager = ({ setting, isAdmin, saving, handleSaveRaw, showToast }) => {
  const [urls, setUrls] = useState(() => parseUrls(setting?.value));
  const [dirty, setDirty] = useState(false);

  // Sync when setting reloads from server
  useEffect(() => {
    setUrls(parseUrls(setting?.value));
    setDirty(false);
  }, [setting?.value]);

  const update = (idx, val) => { const n = [...urls]; n[idx] = val; setUrls(n); setDirty(true); };
  const add    = ()        => { setUrls([...urls, '']); setDirty(true); };
  const remove = (idx)     => { const n = urls.filter((_, i) => i !== idx); setUrls(n.length ? n : ['']); setDirty(true); };

  const handleSave = () => {
    const clean = urls.map(u => u.trim()).filter(Boolean);
    const invalid = clean.filter(u => !isValidUrl(u));
    if (invalid.length) { showToast(`URL tidak valid: ${invalid[0]}`, 'error'); return; }
    handleSaveRaw('liveavatar_url', JSON.stringify(clean));
    setDirty(false);
  };

  const isSaving = saving === 'liveavatar_url';

  return (
    <div className="setting-card url-manager-card">
      <div className="setting-meta">
        <div className="setting-label-row">
          <span className="setting-label" style={{ color: '#ffffff' }}>LiveAvatar URL</span>
          <span className="badge" style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)', fontSize: '0.67rem' }}>
            🔗 {urls.filter(u => u.trim()).length} URL
          </span>
          {setting?.is_active
            ? <span className="badge status active" style={{ background: 'rgba(34,197,94,0.25)', color: '#bbf7d0', border: '1px solid rgba(34,197,94,0.4)' }}>Aktif</span>
            : <span className="badge status inactive" style={{ background: 'rgba(239,68,68,0.25)', color: '#fecaca', border: '1px solid rgba(239,68,68,0.4)' }}>Nonaktif</span>
          }
        </div>
        <p className="setting-key"><code style={{ color: 'rgba(200,200,220,0.9)', background: 'rgba(255,255,255,0.1)' }}>liveavatar_url</code></p>
        <p className="setting-description" style={{ color: 'rgba(200,200,220,0.75)' }}>URL publik layanan LiveAvatar. Tambahkan beberapa URL jika diperlukan.</p>
      </div>

      <div className="url-list">
        {urls.map((u, idx) => {
          const valid = !u.trim() || isValidUrl(u);
          return (
            <div key={idx} className={`url-row ${!valid ? 'invalid' : ''}`}>
              <span className="url-index">{idx + 1}</span>
              <input
                id={`liveavatar-url-input-${idx}`}
                type="url"
                value={u}
                onChange={e => update(idx, e.target.value)}
                disabled={!isAdmin}
                placeholder={isAdmin ? 'https://avatar.example.com' : '—'}
                className={`url-input ${!isAdmin ? 'readonly' : ''} ${!valid ? 'url-input-err' : ''}`}
              />
              {u.trim() && isValidUrl(u) && (
                <a href={u} target="_blank" rel="noopener noreferrer" className="url-open-btn" title="Buka URL">
                  <svg viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/></svg>
                </a>
              )}
              {isAdmin && urls.length > 1 && (
                <button className="url-remove-btn" onClick={() => remove(idx)} title="Hapus URL">
                  <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {isAdmin && (
        <div className="url-actions">
          <button className="btn-url-add" onClick={add} id="add-liveavatar-url-btn">
            <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/></svg>
            Tambah URL
          </button>
          <button
            className={`btn-save ${isSaving ? 'loading' : ''}`}
            onClick={handleSave}
            disabled={isSaving || !dirty}
            id="save-liveavatar-urls-btn"
          >
            {isSaving ? <span className="btn-spinner sm" /> : 'Simpan Semua'}
          </button>
        </div>
      )}

      {setting?.updated_at && (
        <p className="setting-updated">Diperbarui: {new Date(setting.updated_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
      )}
    </div>
  );
};

const Settings = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [revealedKeys, setRevealedKeys] = useState(new Set());
  const [editValues, setEditValues] = useState({});
  const [toast, setToast] = useState(null);
  const [newApiKey, setNewApiKey] = useState(null);
  const [activeTab, setActiveTab] = useState('liveavatar');

  const showToast = (message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 3500); };

  const fetchSettings = useCallback(async () => {
    try {
      const res = await api.get('/settings');
      const data = res.data.data;
      setSettings(data);
      const vals = {};
      data.forEach(s => { vals[s.key] = s.value ?? ''; });
      setEditValues(vals);
    } catch { showToast('Gagal memuat pengaturan', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const toggleReveal = (key) => setRevealedKeys(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  const copyToClipboard = async (value, label) => { try { await navigator.clipboard.writeText(value); showToast(`${label} disalin`); } catch { showToast('Gagal menyalin', 'error'); } };
  const handleSave = async (key) => { setSaving(key); try { await api.put(`/settings/${key}`, { value: editValues[key] }); showToast('Pengaturan disimpan'); await fetchSettings(); } catch (err) { showToast(err.response?.data?.message || 'Gagal menyimpan', 'error'); } finally { setSaving(null); } };
  /** Save with explicit value — used by LiveAvatarUrlManager */
  const handleSaveRaw = async (key, value) => {
    setSaving(key);
    try { await api.put(`/settings/${key}`, { value }); showToast('Pengaturan disimpan'); await fetchSettings(); }
    catch (err) { showToast(err.response?.data?.message || 'Gagal menyimpan', 'error'); }
    finally { setSaving(null); }
  };
  const handleGenerateApiKey = async () => {
    if (!window.confirm('Generate ulang API Key? API Key lama tidak berlaku.')) return;
    setGenerating(true); setNewApiKey(null);
    try { const res = await api.post('/settings/api-key/generate'); setNewApiKey(res.data.data.value); showToast('API Key baru berhasil di-generate!'); await fetchSettings(); }
    catch (err) { showToast(err.response?.data?.message || 'Gagal generate API Key', 'error'); }
    finally { setGenerating(false); }
  };

  const grouped = settings.reduce((acc, s) => { const cat = s.category || 'general'; if (!acc[cat]) acc[cat] = []; acc[cat].push(s); return acc; }, {});
  const visibleGroups = activeTab === 'liveavatar' ? grouped : Object.fromEntries(Object.entries(grouped).filter(([cat]) => categoryTabMap[cat] === activeTab || cat === activeTab));
  const cardProps = { isAdmin, revealedKeys, toggleReveal, copyToClipboard, editValues, setEditValues, saving, handleSave, newApiKey };

  if (loading) return (<div className="settings-loading"><div className="spinner" /><p>Memuat pengaturan...</p></div>);

  const genBtn = (id) => (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.875rem' }}>
      <button id={id} className="btn-generate" onClick={handleGenerateApiKey} disabled={generating}>
        {generating ? <><span className="btn-spinner sm" /> Generating...</> : <><svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg> Generate Ulang API Key</>}
      </button>
    </div>
  );

  return (
    <div className="settings-page">
      {toast && <div className={`settings-toast ${toast.type}`}>{toast.type === 'success' ? <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> : <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>}<span>{toast.message}</span></div>}
      <div className="settings-header">
        <div><h2>⚙️ Pengaturan</h2><p>Kelola konfigurasi sistem LiveAvatar</p></div>
        {!isAdmin && <div className="settings-notice"><svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>Mode tampilan saja — hanya admin yang bisa mengubah pengaturan</div>}
      </div>
      {newApiKey && (
        <div className="new-apikey-banner">
          <div className="banner-icon">🔑</div>
          <div className="banner-body">
            <p className="banner-title">API Key Baru Berhasil Dibuat!</p>
            <p className="banner-subtitle">Salin sekarang — nilai ini tidak akan ditampilkan lagi.</p>
            <div className="apikey-display"><code>{newApiKey}</code><button className="icon-btn copy" onClick={() => copyToClipboard(newApiKey, 'API Key baru')} title="Salin API Key"><svg viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" /></svg></button></div>
          </div>
          <button className="banner-close" onClick={() => setNewApiKey(null)}>✕</button>
        </div>
      )}
      <div className="settings-tabs">
        {TABS.map(tab => <button key={tab.id} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>{tab.icon}{tab.label}</button>)}
      </div>
      {activeTab === 'liveavatar' && (
        <div className="settings-groups">
          <LiveAvatarStatus settings={settings} isAdmin={isAdmin} />
          {(grouped.api || []).filter(s => s.key === 'liveavatar_api_key').map(setting => (
            <div key={setting.key} className="settings-section">
              <div className="section-header"><h3>🔑 LiveAvatar API Key</h3></div>
              <div className="settings-cards"><SettingCard key={setting.key} setting={setting} {...cardProps} /></div>
              {isAdmin && genBtn('generate-api-key-btn')}
            </div>
          ))}
        </div>
      )}
      {activeTab !== 'liveavatar' && (
        <div className="settings-groups">
          {Object.keys(visibleGroups).length === 0
            ? <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem' }}>Tidak ada pengaturan dalam kategori ini.</p>
            : Object.entries(visibleGroups).map(([category, items]) => (
              <section key={category} className="settings-section">
                <div className="section-header">
                  <h3>{category === 'api' ? '🔑 API & Integrasi' : category === 'avatar' ? '⚙️ Konfigurasi Avatar' : '🌐 Umum'}</h3>
                  <span className="section-count">{items.length} item</span>
                </div>
                <div className="settings-cards">
                  {items.map(setting =>
                    setting.key === 'liveavatar_url'
                      ? <LiveAvatarUrlManager key={setting.key} setting={setting} isAdmin={isAdmin} saving={saving} handleSaveRaw={handleSaveRaw} showToast={showToast} />
                      : <SettingCard key={setting.key} setting={setting} {...cardProps} />
                  )}
                </div>
                {category === 'api' && isAdmin && genBtn('generate-api-key-btn-tab')}
                {category === 'avatar' && <div style={{ marginTop: '1.75rem' }}><AvatarList /></div>}
              </section>
            ))
          }
        </div>
      )}
    </div>
  );
};

export default Settings;
