import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LiveAvatarUrlProvider } from './context/LiveAvatarUrlContext';
import PrivateRoute from './components/PrivateRoute';
import AppLayout from './components/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import LiveAction from './pages/LiveAction';
import './index.css';

const ProtectedLayout = ({ children, roles }) => (
  <PrivateRoute roles={roles}>
    <AppLayout>{children}</AppLayout>
  </PrivateRoute>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <LiveAvatarUrlProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected — dengan AppLayout (sidebar) */}
            <Route
              path="/dashboard"
              element={<ProtectedLayout><Dashboard /></ProtectedLayout>}
            />
            <Route
              path="/settings"
              element={<ProtectedLayout><Settings /></ProtectedLayout>}
            />

            {/* Live Actions — dynamic per URL index */}
            <Route
              path="/live/:index"
              element={<ProtectedLayout><LiveAction /></ProtectedLayout>}
            />

            {/* Admin only */}
            <Route
              path="/admin/*"
              element={<ProtectedLayout roles={['admin']}><Dashboard /></ProtectedLayout>}
            />

            {/* Redirect root */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </LiveAvatarUrlProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
