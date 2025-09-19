import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { DevTools } from './components/DevTools';
import { useAuth } from './context/AuthContext';
import { DashboardPage } from './pages/Dashboard';
import { ClientsPage } from './pages/Clients';
import { LoginPage } from './pages/Login';
import { ServicesPage } from './pages/Services';

function ProtectedRoute() {
  const { token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '120px' }}>
        <p>A carregar...</p>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

function AppLayout() {
  const { logout } = useAuth();
  return (
    <AppShell onLogout={logout}>
      <Outlet />
    </AppShell>
  );
}

export default function App() {
  const { token } = useAuth();

  return (
    <>
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/services" element={<ServicesPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      {token && <DevTools show={import.meta.env.DEV} />}
    </>
  );
}
