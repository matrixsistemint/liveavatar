import { useParams, Navigate } from 'react-router-dom';
import { useLiveAvatarUrls } from '../context/LiveAvatarUrlContext';

const LiveActionFullscreen = () => {
  const { index } = useParams();
  const { urls, loading } = useLiveAvatarUrls();
  const idx = parseInt(index, 10);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#000', color: '#fff' }}>
        <p>Memuat Stream...</p>
      </div>
    );
  }

  if (isNaN(idx) || idx < 0 || idx >= urls.length) {
    return <Navigate to="/dashboard" replace />;
  }

  const url = urls[idx];

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#000' }}>
      <iframe
        src={url}
        title={`Live Action Fullscreen ${idx + 1}`}
        style={{ width: '100%', height: '100%', border: 'none' }}
        allow="camera; microphone; fullscreen; autoplay"
        allowFullScreen
      />
    </div>
  );
};

export default LiveActionFullscreen;
