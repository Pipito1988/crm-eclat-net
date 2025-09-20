import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Icon } from '../components/Icon';
import { api } from '../lib/api';

export function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    // Validações
    if (formData.password !== formData.confirmPassword) {
      setError('As palavras-passe não coincidem');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('A palavra-passe deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      // Sucesso - redirecionar para login
      navigate('/login', { 
        state: { 
          message: 'Conta criada com sucesso! Agora pode iniciar sessão.' 
        }
      });
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 409) {
        setError('Este email já está registado');
      } else {
        setError('Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(field: keyof typeof formData, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }));
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
            Criar Conta
          </h1>
          <p className="text-muted">
            Crie a sua conta para aceder ao CRM Eclat Net
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--space-4)' }}>
          <div>
            <label htmlFor="name">Nome Completo</label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="O seu nome"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="email">Endereço de Email</label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
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
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              minLength={6}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword">Confirmar Palavra-passe</label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              minLength={6}
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
                A criar conta...
              </>
            ) : (
              <>
                <Icon name="user_plus" size="sm" />
                Criar Conta
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
          <p className="text-muted">
            Já tem conta?{' '}
            <Link 
              to="/login" 
              style={{ 
                color: 'var(--primary)',
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Iniciar sessão
            </Link>
          </p>
        </div>

        <div style={{ 
          textAlign: 'center', 
          marginTop: 'var(--space-4)'
        }}>
          <p className="text-muted" style={{ fontSize: '0.75rem' }}>
            Sistema de Gestão Empresarial v4.0
          </p>
        </div>
      </div>
    </div>
  );
}
