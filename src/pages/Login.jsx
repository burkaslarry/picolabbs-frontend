import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../LangContext';
import { useUser } from '../UserContext';
import { t } from '../i18n';
import { login } from '../api';

const LOGIN_HEALTH_URL = 'https://picolabbs-backend.onrender.com/api/health';

export default function Login() {
  const { lang } = useLang();
  const { setCurrentUser } = useUser();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [backendOk, setBackendOk] = useState(true);

  useEffect(() => {
    fetch(LOGIN_HEALTH_URL, { method: 'GET' })
      .then((res) => setBackendOk(res.ok))
      .catch(() => setBackendOk(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setLoading(true);
    setError('');
    try {
      const res = await login(username.trim(), password);
      setCurrentUser(res.user);
    } catch (err) {
      setError(lang === 'zh' ? '登入失敗，請確認後端已啟動' : 'Login failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="card" style={{ width: '100%', maxWidth: 420, padding: '2rem' }}>
        <h1 style={{ margin: '0 0 0.5rem', textAlign: 'center' }}>PicoLabbs CRM</h1>
        <p style={{ margin: '0 0 1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          {t('login.subtitle', lang)}
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.9rem' }}>
            {t('login.username', lang)}
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('login.usernamePlaceholder', lang)}
              autoComplete="username"
              style={{ padding: '0.55rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }}
              required
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.9rem' }}>
            {t('login.password', lang)}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('login.passwordPlaceholder', lang)}
              autoComplete="current-password"
              style={{ padding: '0.55rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }}
              required
            />
          </label>
          <button
            type="submit"
            className="btn"
            disabled={loading}
            style={{ justifyContent: 'center', padding: '0.75rem', marginTop: '0.25rem' }}
          >
            {loading ? t('login.signingIn', lang) : t('login.signIn', lang)}
          </button>
        </form>
        {error && (
          <p style={{ color: 'var(--danger)', margin: '1rem 0 0', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </p>
        )}
        {!backendOk && (
          <p style={{ color: 'var(--warning)', margin: '0.75rem 0 0', fontSize: '0.85rem', textAlign: 'center' }}>
            {lang === 'zh'
              ? '後端健康檢查失敗：' + LOGIN_HEALTH_URL
              : 'Backend health check failed: ' + LOGIN_HEALTH_URL}
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
