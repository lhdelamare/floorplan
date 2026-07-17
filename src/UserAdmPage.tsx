import { useState, useEffect } from 'react';
import { ChevronLeft, Search, ChevronDown, ChevronUp } from 'lucide-react';
import './UserAdmPage.css';

interface ProjectInfo {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface UserWithProjects {
  id: number;
  name: string;
  email: string;
  created_at: string;
  projects: ProjectInfo[];
}

interface UserAdmPageProps {
  onBack: () => void;
}

export default function UserAdmPage({ onBack }: UserAdmPageProps) {
  const [users, setUsers] = useState<UserWithProjects[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedUserIds, setExpandedUserIds] = useState<number[]>([]);

  useEffect(() => {
    fetch('/api/admin/users-projects')
      .then((res) => {
        if (!res.ok) throw new Error('Não foi possível carregar os dados.');
        return res.json();
      })
      .then((json) => {
        if (json.success) {
          setUsers(json.data);
        } else {
          setError(json.error || 'Erro desconhecido');
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const toggleUserExpanded = (userId: number) => {
    if (expandedUserIds.includes(userId)) {
      setExpandedUserIds(expandedUserIds.filter((id) => id !== userId));
    } else {
      setExpandedUserIds([...expandedUserIds, userId]);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUsers = users.length;
  const totalProjects = users.reduce((acc, curr) => acc + curr.projects.length, 0);

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="admin-title-area">
          <h1>Painel do Administrador</h1>
          <div className="admin-subtitle">Gerenciamento de usuários e projetos da plataforma</div>
        </div>
        <button
          type="button"
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 0.875rem',
            fontSize: '0.85rem',
            fontWeight: 500,
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)')}
        >
          <ChevronLeft size={16} />
          Voltar ao Editor
        </button>
      </header>

      {loading ? (
        <div className="admin-loading-container">
          <div className="admin-spinner"></div>
          <div>Carregando informações…</div>
        </div>
      ) : error ? (
        <div style={{ color: 'var(--color-danger)', padding: '2rem', textAlign: 'center' }}>
          <h3>Ocorreu um erro</h3>
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <div className="admin-stat-label">Usuários Cadastrados</div>
              <div className="admin-stat-value">{totalUsers}</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-label">Total de Projetos</div>
              <div className="admin-stat-value">{totalProjects}</div>
            </div>
          </div>

          <div className="admin-controls">
            <div className="admin-search-wrapper">
              <Search size={16} className="admin-search-icon" />
              <input
                type="text"
                className="admin-search-input"
                placeholder="Buscar usuário por nome ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>E-mail</th>
                  <th>Data de Cadastro</th>
                  <th>Projetos</th>
                  <th style={{ width: '120px' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="admin-empty-state">
                      Nenhum usuário encontrado correspondente à pesquisa.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isExpanded = expandedUserIds.includes(u.id);
                    return (
                      <React.Fragment key={u.id}>
                        <tr>
                          <td>
                            <div className="user-avatar-cell">
                              <div className="user-initial-badge">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <span style={{ fontWeight: 600 }}>{u.name || 'Sem nome'}</span>
                            </div>
                          </td>
                          <td>{u.email}</td>
                          <td>{formatDate(u.created_at)}</td>
                          <td>
                            <span className="project-count-badge">
                              {u.projects.length}{' '}
                              {u.projects.length === 1 ? 'projeto' : 'projetos'}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn-toggle-projects"
                              onClick={() => toggleUserExpanded(u.id)}
                            >
                              {isExpanded ? (
                                <>
                                  Ocultar <ChevronUp size={14} />
                                </>
                              ) : (
                                <>
                                  Ver Projetos <ChevronDown size={14} />
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="projects-detail-row">
                            <td colSpan={5}>
                              <div className="projects-detail-container">
                                <div className="projects-detail-title">
                                  Projetos de {u.name || u.email}:
                                </div>
                                {u.projects.length === 0 ? (
                                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    Este usuário não possui nenhum projeto salvo no servidor.
                                  </div>
                                ) : (
                                  <div className="admin-projects-list">
                                    {u.projects.map((p) => (
                                      <div key={p.id} className="admin-project-card">
                                        <div className="admin-project-name">{p.name}</div>
                                        <div className="admin-project-dates">
                                          <span>Criado: {formatDate(p.created_at)}</span>
                                          <span>Modificado: {formatDate(p.updated_at)}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// Ensure React is accessible in the scope since we use Fragment
import React from 'react';
