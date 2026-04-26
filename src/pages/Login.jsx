import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../LangContext';
import { useUser } from '../UserContext';
import { t } from '../i18n';
import { login } from '../api';

const DEMO_ACCOUNTS = [
  { username: 'pladmin', password: 'root1234', labelKey: 'login.roleAdmin' },
  { username: 'plsales_001', password: 'root5678', labelKey: 'login.roleSales1' },
  { username: 'plsales_002', password: 'root5678', labelKey: 'login.roleSales2' },
];

export default function Login() {
  const { lang } = useLang();
  const { setCurrentUser } = useUser();
  const [loadingUser, setLoadingUser] = useState(null);
  const [error, setError] = useState('');

  const signInAs = async (username, password) => {
    setLoadingUser(username);
    setError('');
    try {
      const res = await login(username, password);
      setCurrentUser(res.user);
    } catch (err) {
      setError(lang === 'zh' ? '登入失敗，請確認後端已啟動' : 'Login failed. Is the backend running?');
    } finally {
      setLoadingUser(null);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="card" style={{ width: '100%', maxWidth: 420, padding: '2rem' }}>
        <h1 style={{ margin: '0 0 0.5rem', textAlign: 'center' }}>PicoLabbs CRM</h1>
        <p style={{ margin: '0 0 1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          {t('login.pickRole', lang)}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {DEMO_ACCOUNTS.map(({ username, password, labelKey }) => (
            <button
              key={username}
              type="button"
              className="btn"
              disabled={!!loadingUser}
              style={{ justifyContent: 'center', padding: '0.75rem' }}
              onClick={() => signInAs(username, password)}
            >
              {loadingUser === username
                ? (lang === 'zh' ? '登入中…' : 'Signing in…')
                : t(labelKey, lang)}
            </button>
          ))}
        </div>
        {error && (
          <p style={{ color: 'var(--danger)', margin: '1rem 0 0', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </p>
        )}
        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
          <Link
            to="/guide"
            className="btn secondary"
            style={{ display: 'flex', justifyContent: 'center', width: '100%', padding: '0.65rem', textDecoration: 'none' }}
          >
            {t('login.openGuide', lang)}
          </Link>
        </div>
      </div>
    </div>
  );
}
