import { useState, useEffect } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { useLang } from './LangContext';
import { t } from './i18n';
import { getHealth } from './api';
import { useUser } from './UserContext';
import Inbox from './pages/Inbox';
import LeadDetail from './pages/LeadDetail';
import Kanban from './pages/Kanban';
import Automations from './pages/Automations';
import Data from './pages/Data';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import ManualLeads from './pages/ManualLeads';
import Login from './pages/Login';
import Catalog from './pages/Catalog';
import DemoGuide from './pages/DemoGuide';
import CustomerLeads from './pages/CustomerLeads';

export default function App() {
  const { lang } = useLang();
  const { currentUser, setCurrentUser } = useUser();
  const [backendStatus, setBackendStatus] = useState('loading'); // 'loading' | 'ok' | 'error'
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    const savedTheme = window.localStorage.getItem('picolabbs-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });

  useEffect(() => {
    getHealth()
      .then(() => setBackendStatus('ok'))
      .catch(() => setBackendStatus('error'));
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem('picolabbs-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  const logout = () => setCurrentUser(null);

  const displayName = currentUser?.name || currentUser?.username || '';

  return (
    <Routes>
      <Route path="/guide" element={<DemoGuide />} />
      <Route
        path="*"
        element={
          !currentUser ? (
            <Login />
          ) : (
            <div className="app">
              <nav className="nav">
                <strong>{t('appTitle', lang)}</strong>
                <span
                  className="backend-status"
                  title={backendStatus === 'ok' ? 'Backend connected' : backendStatus === 'error' ? 'Backend offline or unreachable' : 'Checking…'}
                  style={{
                    fontSize: '0.75rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    color: backendStatus === 'ok' ? 'var(--success)' : backendStatus === 'error' ? 'var(--text-muted)' : 'var(--text-muted)',
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: backendStatus === 'ok' ? 'var(--success)' : backendStatus === 'error' ? 'var(--danger)' : 'var(--warning)',
                    }}
                  />
                  {backendStatus === 'loading' && '…'}
                  {backendStatus === 'ok' && (lang === 'zh' ? '後端連線' : 'Backend OK')}
                  {backendStatus === 'error' && (lang === 'zh' ? '後端離線' : 'Offline')}
                </span>
                <div className="nav-links">
                  <NavLink to="/" end>{t('nav.inbox', lang)}</NavLink>
                  <NavLink to="/customers">{t('nav.returningCustomers', lang)}</NavLink>
                  <NavLink to="/kanban">{t('nav.kanban', lang)}</NavLink>
                  <NavLink to="/automations">{t('nav.automations', lang)}</NavLink>
                  <NavLink to="/manual-leads">{t('nav.manualLeads', lang)}</NavLink>
                  <NavLink to="/data">{t('nav.importHub', lang)}</NavLink>
                  <NavLink to="/catalog">{t('nav.catalog', lang)}</NavLink>
                  <NavLink to="/guide">{t('nav.demoGuide', lang)}</NavLink>
                  <NavLink to="/settings">{t('nav.settings', lang)}</NavLink>
                  <NavLink to="/profile">{t('nav.customerProfile', lang)}</NavLink>
                </div>
                <span className="badge" style={{ background: 'rgba(99,102,241,0.2)' }}>
                  {t('aiMode.label', lang)}: {t('aiMode.mock', lang)}
                </span>
                <span
                  className="nav-user-name"
                  title={currentUser?.username || ''}
                >
                  {displayName}
                </span>
                <button
                  type="button"
                  className="btn secondary nav-theme-toggle"
                  onClick={toggleTheme}
                >
                  {theme === 'dark'
                    ? (lang === 'zh' ? '淺色模式' : 'Light mode')
                    : (lang === 'zh' ? '深色模式' : 'Dark mode')}
                </button>
                <button
                  type="button"
                  className="btn secondary"
                  onClick={logout}
                  style={{ padding: '0.35rem 0.6rem' }}
                >
                  {t('login.logout', lang)}
                </button>
              </nav>
              <div className="layout">
                <aside className="sidebar">
                  <NavLink to="/">{t('nav.inbox', lang)}</NavLink>
                  <NavLink to="/customers">{t('nav.returningCustomers', lang)}</NavLink>
                  <NavLink to="/kanban">{t('nav.pipeline', lang)}</NavLink>
                  <NavLink to="/automations">{t('nav.rulesTemplates', lang)}</NavLink>
                  <NavLink to="/manual-leads">{t('nav.manualLeads', lang)}</NavLink>
                  <NavLink to="/data">{t('nav.importHub', lang)}</NavLink>
                  <NavLink to="/catalog">{t('nav.catalog', lang)}</NavLink>
                  <NavLink to="/guide">{t('nav.demoGuide', lang)}</NavLink>
                  <NavLink to="/settings">{t('nav.settings', lang)}</NavLink>
                  <NavLink to="/profile">{t('nav.customerProfile', lang)}</NavLink>
                </aside>
                <main className="main">
                  <Routes>
                    <Route path="/" element={<Inbox />} />
                    <Route path="/customers" element={<CustomerLeads />} />
                    <Route path="/lead/:id" element={<LeadDetail />} />
                    <Route path="/kanban" element={<Kanban />} />
                    <Route path="/automations" element={<Automations />} />
                    <Route path="/manual-leads" element={<ManualLeads />} />
                    <Route path="/data" element={<Data />} />
                    <Route path="/catalog" element={<Catalog />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/profile" element={<Profile />} />
                  </Routes>
                </main>
              </div>
            </div>
          )
        }
      />
    </Routes>
  );
}
