import { NavLink } from 'react-router-dom';
import { Icon } from './Icon';

interface AppShellProps {
  children: React.ReactNode;
  onLogout: () => void;
}

export function AppShell({ children, onLogout }: AppShellProps) {
  return (
    <div>
      <header className="appbar">
        <nav className="nav container">
          <div className="brand">
            <Icon name="briefcase" size="sm" /> 
            CRM Eclat Net
          </div>
          <NavLink className={({ isActive }) => (isActive ? 'tab active' : 'tab')} to="/dashboard">
            <Icon name="dashboard" size="sm" />
            Dashboard
          </NavLink>
          <NavLink className={({ isActive }) => (isActive ? 'tab active' : 'tab')} to="/clients">
            <Icon name="users" size="sm" />
            Clientes
          </NavLink>
          <NavLink className={({ isActive }) => (isActive ? 'tab active' : 'tab')} to="/services">
            <Icon name="briefcase" size="sm" />
            Serviços
          </NavLink>
          <div className="spacer" />
          <button className="btn btn-danger" onClick={onLogout} type="button">
            <Icon name="logout" size="sm" />
            Terminar sessão
          </button>
        </nav>
      </header>
      <main className="container" style={{ paddingTop: '120px' }}>
        {children}
      </main>
    </div>
  );
}
