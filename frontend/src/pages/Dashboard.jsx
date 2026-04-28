import { useAuth } from '../context/AuthContext';
import '../styles/dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Avatar Aktif', value: '12', icon: '🤖', change: '+3 minggu ini' },
    { label: 'Sesi Hari Ini', value: '48', icon: '📊', change: '+12% dari kemarin' },
    { label: 'Total Pengguna', value: '256', icon: '👥', change: '+8 bulan ini' },
    { label: 'Uptime Sistem', value: '99.9%', icon: '⚡', change: 'Stabil' },
  ];

  return (
    <>
      <header className="dashboard-header">
        <div>
          <h2>Selamat Datang, <span className="highlight">{user?.name?.split(' ')[0]}</span> 👋</h2>
          <p className="header-subtitle">Berikut ringkasan sistem LiveAvatar Anda</p>
        </div>
        <div className="header-actions">
          <div className="header-date">
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <section className="stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card" style={{ '--delay': `${i * 0.1}s` }}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <p className="stat-label">{stat.label}</p>
              <h3 className="stat-value">{stat.value}</h3>
              <p className="stat-change">{stat.change}</p>
            </div>
            <div className="stat-glow" />
          </div>
        ))}
      </section>

      {/* Content Area */}
      <section className="dashboard-content">
        <div className="content-card">
          <div className="card-header">
            <h3>Aktivitas Terkini</h3>
            <button className="btn-outline">Lihat Semua</button>
          </div>
          <div className="activity-list">
            {[
              { action: 'Avatar "Assistant-01" diaktifkan', time: '2 menit lalu', type: 'success' },
              { action: 'Sesi baru dimulai oleh user@example.com', time: '15 menit lalu', type: 'info' },
              { action: 'Model diperbarui ke versi 3.2', time: '1 jam lalu', type: 'warning' },
              { action: 'Backup database berhasil', time: '3 jam lalu', type: 'success' },
              { action: 'Laporan bulanan digenerate', time: '5 jam lalu', type: 'info' },
            ].map((item, i) => (
              <div key={i} className="activity-item">
                <div className={`activity-dot ${item.type}`} />
                <div className="activity-info">
                  <p>{item.action}</p>
                  <span>{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="content-card">
          <div className="card-header">
            <h3>Info Akun</h3>
          </div>
          <div className="account-info">
            <div className="account-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <div className="account-details">
              <h4>{user?.name}</h4>
              <p>{user?.email}</p>
              <span className={`role-badge ${user?.role}`}>
                {user?.role === 'admin' ? '👑 Administrator' : '👤 User'}
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Dashboard;
