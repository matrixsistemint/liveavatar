import { useParams, Navigate } from 'react-router-dom';
import { useLiveAvatarUrls } from '../context/LiveAvatarUrlContext';
import '../styles/liveaction.css';

const LiveAction = () => {
  const { index } = useParams();
  const { urls, loading } = useLiveAvatarUrls();
  const idx = parseInt(index, 10);

  if (loading) {
    return (
      <div className="liveaction-loading">
        <div className="la-spinner" />
        <p>Memuat Live Action...</p>
      </div>
    );
  }

  if (isNaN(idx) || idx < 0 || idx >= urls.length) {
    return <Navigate to="/dashboard" replace />;
  }

  const url = urls[idx];

  return (
    <div className="liveaction-page">
      {/* Header bar */}
      <div className="liveaction-header">
        <div className="liveaction-title">
          <div className="la-live-dot" />
          <span>Live Action {urls.length > 1 ? `#${idx + 1}` : ''}</span>
        </div>
        <div className="liveaction-url-chip">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
          </svg>
          <span>{url}</span>
          <a href={`/stream/${idx}`} target="_blank" rel="noopener noreferrer" className="la-open-btn" title="Buka di tab baru">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
            </svg>
          </a>
        </div>
      </div>

      {/* iframe container */}
      <div className="liveaction-frame-wrap">
        <iframe
          id={`liveaction-frame-${idx}`}
          src={url}
          title={`Live Action ${idx + 1}`}
          className="liveaction-frame"
          allow="camera; microphone; fullscreen; autoplay"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default LiveAction;
