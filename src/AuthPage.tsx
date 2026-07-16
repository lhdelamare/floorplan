import React, { useState, useEffect } from 'react';
import './AuthPage.css';

interface User {
  id: number;
  email: string;
  name: string;
}

interface AuthPageProps {
  onLogin: (user: User) => void;
}

type AuthMode = 'login' | 'register';

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<'checking' | 'ok' | 'error'>('checking');
  const [dbError, setDbError] = useState('');

  useEffect(() => {
    fetch('/api/health', { credentials: 'include' })
      .then(r => r.json())
      .then(json => {
        if (json.success && json.db === 'connected') {
          setDbStatus('ok');
        } else {
          setDbStatus('error');
          setDbError(json.error || 'Banco de dados não conectado');
        }
      })
      .catch(() => {
        setDbStatus('error');
        setDbError('Servidor não está respondendo (verifique se node server/index.js está rodando)');
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const body: Record<string, string> = { email, password };
    if (mode === 'register') body.name = name;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || 'Erro desconhecido');
      } else {
        onLogin(json.data);
      }
    } catch (err) {
      setError('Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      {/* Animated background */}
      <div className="auth-bg">
        <div className="auth-bg-grid" />
        <div className="auth-bg-orb auth-bg-orb-1" />
        <div className="auth-bg-orb auth-bg-orb-2" />
        <div className="auth-bg-orb auth-bg-orb-3" />
      </div>

      <div className="auth-container">
        {/* Brand / logo side */}
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="4" y="4" width="18" height="18" rx="3" fill="currentColor" opacity="0.9" />
              <rect x="26" y="4" width="18" height="8" rx="2" fill="currentColor" opacity="0.6" />
              <rect x="26" y="16" width="18" height="6" rx="2" fill="currentColor" opacity="0.4" />
              <rect x="4" y="26" width="8" height="18" rx="2" fill="currentColor" opacity="0.5" />
              <rect x="16" y="26" width="14" height="18" rx="2" fill="currentColor" opacity="0.7" />
              <rect x="34" y="26" width="10" height="18" rx="2" fill="currentColor" opacity="0.9" />
            </svg>
          </div>
          <h1 className="auth-brand-title">FloorPlan Pro</h1>
          <h2 className="auth-brand-sub">Equipe SENAI Zerbini</h2>
          <p className="auth-brand-sub">
            Projete, visualize e colabore em plantas baixas com precisão milimétrica.
          </p>
          <ul className="auth-feature-list">
            <li>
              <span className="auth-feature-dot" />
              Editor de paredes e mobiliário em tempo real
            </li>
            <li>
              <span className="auth-feature-dot" />
              Múltiplos andares por projeto
            </li>
            <li>
              <span className="auth-feature-dot" />
              Visualização antes/depois lado a lado
            </li>
            <li>
              <span className="auth-feature-dot" />
              Biblioteca de objetos personalizados
            </li>
          </ul>
        </div>

        {/* Form side */}
        <div className="auth-form-side">
          <div className="auth-card">
            {/* DB Status badge */}
            <div className={`auth-db-badge auth-db-badge--${dbStatus}`}>
              <span className="auth-db-dot" />
              {dbStatus === 'checking' && 'Verificando banco de dados…'}
              {dbStatus === 'ok' && 'Banco de dados conectado'}
              {dbStatus === 'error' && `BD: ${dbError}`}
            </div>

            <div className="auth-tabs">
              <button
                className={`auth-tab ${mode === 'login' ? 'auth-tab--active' : ''}`}
                onClick={() => { setMode('login'); setError(''); }}
              >
                Entrar
              </button>
              <button
                className={`auth-tab ${mode === 'register' ? 'auth-tab--active' : ''}`}
                onClick={() => { setMode('register'); setError(''); }}
              >
                Criar conta
              </button>
            </div>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              {mode === 'register' && (
                <div className="auth-field">
                  <label htmlFor="auth-name">Nome completo</label>
                  <input
                    id="auth-name"
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>
              )}

              <div className="auth-field">
                <label htmlFor="auth-email">E-mail</label>
                <input
                  id="auth-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="auth-password">Senha</label>
                <input
                  id="auth-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <div className="auth-error" role="alert">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                id="auth-submit"
                type="submit"
                className="auth-btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <span className="auth-spinner" />
                ) : mode === 'login' ? 'Entrar na conta' : 'Criar minha conta'}
              </button>
            </form>

            <p className="auth-switch">
              {mode === 'login' ? (
                <>Não tem conta?{' '}
                  <button className="auth-link" onClick={() => { setMode('register'); setError(''); }}>
                    Cadastre-se gratuitamente
                  </button>
                </>
              ) : (
                <>Já tem uma conta?{' '}
                  <button className="auth-link" onClick={() => { setMode('login'); setError(''); }}>
                    Fazer login
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
