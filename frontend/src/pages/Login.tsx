import { useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Icon } from '../components/Icon';

interface LocationState {
  from?: { pathname: string };
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      const redirectTo = state.from?.pathname ?? '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error(err);
      setError('Nao foi possivel iniciar sessao. Verifique as credenciais.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, var(--primary-bg) 0%, var(--accent-light) 100%)',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: 'var(--space-4)'
    }}>
      <div className="card" style={{ 
        maxWidth: '440px', 
        width: '100%',
        boxShadow: 'var(--shadow-2xl)',
        border: '1px solid var(--gray-200)',
        background: 'var(--bg-primary)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <div style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: 'var(--space-3)',
            background: 'var(--primary-bg)',
            borderRadius: 'var(--radius-xl)',
            marginBottom: 'var(--space-4)'
          }}>
            <Icon name="briefcase" size="lg" />
          </div>
          <h1 style={{ 
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 'var(--space-2)'
          }}>
            CRM Eclat Net
          </h1>
          <p className="text-muted">
            Entre para aceder ao seu painel de gestão
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--space-4)' }}>
          <div>
            <label htmlFor="email">Endereço de Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="exemplo@empresa.com"
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="password">Palavra-passe</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>
          
          {error ? (
            <div className="alert" style={{ 
              background: 'var(--danger-bg)',
              border: '1px solid var(--danger-light)',
              color: 'var(--danger-dark)'
            }}>
              <Icon name="x" size="sm" />
              {error}
            </div>
          ) : null}
          
          <button 
            className="btn btn-primary btn-lg" 
            type="submit" 
            disabled={loading}
            style={{ marginTop: 'var(--space-2)' }}
          >
            {loading ? (
              <>
                <LoadingSpinner size="small" message="" inline />
                A iniciar sessão...
              </>
            ) : (
              <>
                <Icon name="arrow_right" size="sm" />
                Entrar
              </>
            )}
          </button>
        </form>

        <div style={{ 
          textAlign: 'center', 
          marginTop: 'var(--space-6)',
          paddingTop: 'var(--space-4)',
          borderTop: '1px solid var(--gray-200)'
        }}>
          <p className="text-muted" style={{ fontSize: '0.75rem' }}>
            Sistema de Gestão Empresarial v4.0
          </p>
        </div>
      </div>
    </div>
  );
}
