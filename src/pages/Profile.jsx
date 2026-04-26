import { useState } from 'react';
import { useLang } from '../LangContext';
import { useUser } from '../UserContext';
import { t } from '../i18n';

export default function Profile() {
  const { lang } = useLang();
  const { currentUser, setCurrentUser } = useUser();
  const [timezone, setTimezone] = useState('Asia/Hong_Kong');
  const [saved, setSaved] = useState(false);

  const onSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const onLogout = () => {
    setCurrentUser(null);
  };

  const inputStyle = {
    padding: '0.5rem 0.75rem',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text)',
    width: '100%',
    maxWidth: 320,
  };

  return (
    <div>
      <h1 style={{ margin: 0, marginBottom: '1rem' }}>
        {t('profile.title', lang)}
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        {t('profile.intro', lang)}
      </p>

      <section className="card" style={{ maxWidth: 420 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {t('profile.username', lang)}
            </label>
            <div style={{ padding: '0.5rem 0', fontWeight: 'bold' }}>{currentUser?.username || '-'}</div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {t('profile.fullname', lang)}
            </label>
            <div style={{ padding: '0.5rem 0', fontWeight: 'bold' }}>{currentUser?.name || '-'}</div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {t('profile.userRole', lang)}
            </label>
            <div style={{ padding: '0.5rem 0' }}>
              <span className="badge" style={{ background: 'var(--brand)', color: 'white' }}>{currentUser?.user_role || '-'}</span>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {t('profile.email', lang)}
            </label>
            <div style={{ padding: '0.5rem 0' }}>{currentUser?.email || '-'}</div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.9rem' }}>
              {t('profile.timezone', lang)}
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              style={inputStyle}
            >
              <option value="Asia/Hong_Kong">Asia/Hong_Kong</option>
              <option value="Asia/Taipei">Asia/Taipei</option>
              <option value="Asia/Singapore">Asia/Singapore</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1.25rem' }}>
          <button type="button" className="btn" onClick={onSave}>
            {t('profile.save', lang)}
          </button>
          {saved && (
            <span style={{ color: 'var(--success)', fontSize: '0.9rem' }}>
              {t('profile.saved', lang)}
            </span>
          )}
        </div>
        
        <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <button type="button" className="btn secondary" onClick={onLogout} style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
            {t('profile.logout', lang)}
          </button>
        </div>
      </section>
    </div>
  );
}
