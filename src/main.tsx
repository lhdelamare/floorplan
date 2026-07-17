import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import AuthPage from './AuthPage.tsx';
import UserAdmPage from './UserAdmPage.tsx';

interface User {
  id: number;
  email: string;
  name: string;
}

type AuthState = 'checking' | 'authenticated' | 'unauthenticated';

function Root() {
  const [authState, setAuthState] = useState<AuthState>('checking');
  const [user, setUser] = useState<User | null>(null);
  const [isAdminRoute, setIsAdminRoute] = useState(() => window.location.pathname === '/useradm');

  useEffect(() => {
    const handlePopState = () => {
      setIsAdminRoute(window.location.pathname === '/useradm');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (isAdminRoute) {
    return (
      <UserAdmPage
        onBack={() => {
          window.history.pushState({}, '', '/');
          setIsAdminRoute(false);
        }}
      />
    );
  }

  // On mount, check if there's an active session
  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          setUser(json.data);
          setAuthState('authenticated');
        } else {
          setAuthState('unauthenticated');
        }
      })
      .catch(() => setAuthState('unauthenticated'));
  }, []);

  if (authState === 'checking') {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: '#0a0f1e',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Inter, sans-serif', color: '#94a3b8', fontSize: '0.9rem',
        flexDirection: 'column', gap: 16
      }}>
        <div style={{
          width: 36, height: 36, border: '3px solid rgba(99,102,241,0.3)',
          borderTopColor: '#6366f1', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        Verificando sessão…
      </div>
    );
  }

  if (authState === 'unauthenticated') {
    return (
      <AuthPage
        onLogin={(loggedUser) => {
          setUser(loggedUser);
          setAuthState('authenticated');
        }}
      />
    );
  }

  return <App user={user!} onLogout={() => {
    fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
    setAuthState('unauthenticated');
  }} />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
