import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

const LiveAvatarUrlContext = createContext({ urls: [], loading: true, refresh: () => {} });

/** Parse JSON array or plain string → string[] of non-empty URLs */
const parseUrls = (raw) => {
  if (!raw || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
  } catch { /* plain string */ }
  return raw.trim() ? [raw.trim()] : [];
};

export const LiveAvatarUrlProvider = ({ children }) => {
  const [urls, setUrls]     = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/settings/liveavatar_url');
      setUrls(parseUrls(res.data.data?.value));
    } catch {
      setUrls([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <LiveAvatarUrlContext.Provider value={{ urls, loading, refresh }}>
      {children}
    </LiveAvatarUrlContext.Provider>
  );
};

export const useLiveAvatarUrls = () => useContext(LiveAvatarUrlContext);
