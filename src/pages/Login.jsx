import { useState } from 'react';
import { useLang } from '../LangContext';
import { useUser } from '../UserContext';
import { t } from '../i18n';
import { login } from '../api';

export default function Login() {
  const { lang } = useLang();
  const { setCurrentUser } = useUser();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await login(username, password);
      setCurrentUser(res.user);
    } catch (err) {
      setError(lang === 'zh' ? '登入失敗，請檢查帳號密碼' : 'Login failed, please check credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="card" style={{ width: '100%', maxWidth: 400, padding: '2rem' }}>
        <h1 style={{ margin: '0 0 1.5rem', textAlign: 'center' }}>PicoLabbs CRM</h1>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {lang === 'zh' ? '帳號' : 'Username'}
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required
              style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {lang === 'zh' ? '密碼' : 'Password'}
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
              style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
            />
          </label>
          {error && <p style={{ color: 'var(--danger)', margin: 0, fontSize: '0.9rem' }}>{error}</p>}
          <button type="submit" className="btn" disabled={loading} style={{ justifyContent: 'center', marginTop: '0.5rem', padding: '0.75rem' }}>
            {loading ? (lang === 'zh' ? '登入中...' : 'Logging in...') : (lang === 'zh' ? '登入' : 'Login')}
          </button>
        </form>
        <div style={{ marginTop: '2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <p style={{ margin: '0 0 0.5rem' }}>{lang === 'zh' ? 'Demo 帳號:' : 'Demo Accounts:'}</p>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: 1.6 }}>
            <li><code>pladmin</code> / <code>root1234</code></li>
            <li><code>plsales_001</code> / <code>root5678</code></li>
            <li><code>plsales_002</code> / <code>root5678</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
