import { useState, useEffect } from 'react';
import { useLang } from '../LangContext';
import { t } from '../i18n';
import { getUsers, createUser, updateUserRole } from '../api';
import { useUser } from '../UserContext';
import { CRM_USER_ROLES, userRoleLabel } from '../userRoles';

export default function Settings() {
  const { lang, setLang } = useLang();
  const { currentUser, setCurrentUser } = useUser();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [newUserRole, setNewUserRole] = useState('ops_front');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);

  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    const savedTheme = window.localStorage.getItem('picolabbs-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const load = async () => {
    setLoading(true);
    try {
      const list = await getUsers();
      setUsers(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setAdding(true);
    setError(null);
    try {
      await createUser({ email: email.trim(), name: name.trim() || undefined, role: newUserRole });
      setEmail('');
      setName('');
      setNewUserRole('ops_front');
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setAdding(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      load();
      if (currentUser?.id === userId) setCurrentUser({ ...currentUser, role: newRole });
    } catch (e) {
      console.error(e);
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    window.localStorage.setItem('picolabbs-theme', newTheme);
  };

  return (
    <div>
      <h1 style={{ margin: 0, marginBottom: '1rem' }}>
        {t('settings.title', lang)}
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        {t('settings.intro', lang)}
      </p>

      {/* System Preferences */}
      <section className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: '0 0 0.75rem', fontSize: '1.1rem' }}>
          {lang === 'zh' ? '系統偏好設定' : 'System Preferences'}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 400 }}>
          
          {/* Language Selection */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {lang === 'zh' ? '語言 (Language)' : 'Language (語言)'}
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className={`btn ${lang === 'zh' ? '' : 'secondary'}`} 
                onClick={() => setLang('zh')}
              >
                繁體中文
              </button>
              <button 
                className={`btn ${lang === 'en' ? '' : 'secondary'}`} 
                onClick={() => setLang('en')}
              >
                English
              </button>
            </div>
          </div>

          {/* Theme Selection */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {lang === 'zh' ? '介面主題 (Theme)' : 'Interface Theme'}
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className={`btn ${theme === 'light' ? '' : 'secondary'}`} 
                onClick={() => handleThemeChange('light')}
              >
                ☀️ {lang === 'zh' ? '淺色 (Light)' : 'Light'}
              </button>
              <button 
                className={`btn ${theme === 'dark' ? '' : 'secondary'}`} 
                onClick={() => handleThemeChange('dark')}
              >
                🌙 {lang === 'zh' ? '深色 (Dark)' : 'Dark'}
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* User Management (Only visible to master_admin or superadmin) */}
      {(currentUser?.user_role === 'master_admin' || currentUser?.role === 'superadmin') && (
        <section className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ margin: '0 0 0.75rem', fontSize: '1.1rem' }}>
            {t('users.title', lang)}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {t('users.intro', lang)}
          </p>

          <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--surface-hover)', borderRadius: 8 }}>
            <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem' }}>{t('users.addUser', lang)}</h3>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 400 }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('users.roleHint', lang)}</p>
              <input
                type="email"
                placeholder={t('users.email', lang)}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ padding: '0.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }}
              />
              <input
                type="text"
                placeholder={t('users.name', lang)}
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ padding: '0.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }}
              />
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                {t('users.role', lang)}
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  style={{ padding: '0.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }}
                >
                  {CRM_USER_ROLES.map((r) => (
                    <option key={r} value={r}>{userRoleLabel(r, t, lang)}</option>
                  ))}
                </select>
              </label>
              {error && <p style={{ color: 'var(--danger)', fontSize: '0.9rem', margin: 0 }}>{error}</p>}
              <button type="submit" className="btn" disabled={adding}>{adding ? '…' : t('users.addUser', lang)}</button>
            </form>
          </div>

          <div>
            {loading ? <p>{t('inbox.loading', lang)}</p> : users.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>{t('users.noUsers', lang)}</p> : (
              <div className="table-wrap">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '0.5rem 0' }}>{t('users.email', lang)}</th>
                      <th style={{ padding: '0.5rem 0' }}>{t('users.name', lang)}</th>
                      <th style={{ padding: '0.5rem 0' }}>{t('users.role', lang)}</th>
                      <th style={{ padding: '0.5rem 0' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.5rem 0' }}>{u.email}</td>
                        <td style={{ padding: '0.5rem 0' }}>{u.name || '—'}</td>
                        <td style={{ padding: '0.5rem 0' }}>
                          <select
                            value={CRM_USER_ROLES.includes(u.role) ? u.role : 'operator'}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            style={{ padding: '0.35rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)' }}
                          >
                            {CRM_USER_ROLES.map((r) => (
                              <option key={r} value={r}>{userRoleLabel(r, t, lang)}</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ padding: '0.5rem 0' }}>
                          {currentUser?.id === u.id && <span className="badge" style={{ background: 'var(--accent-dim)' }}>current</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

    </div>
  );
}