import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { marked } from 'marked';
import { useLang } from '../LangContext';
import { useUser } from '../UserContext';
import { t } from '../i18n';

export default function DemoGuide() {
  const { lang } = useLang();
  const { currentUser } = useUser();
  const [guideMd, setGuideMd] = useState('');

  useEffect(() => {
    let alive = true;
    fetch('/PicoLabb_Demo_Guide_zh.md')
      .then((res) => {
        if (!res.ok) throw new Error('guide_not_found');
        return res.text();
      })
      .then((text) => {
        if (alive) setGuideMd(text);
      })
      .catch(() => {
        if (alive) setGuideMd('# Guide unavailable\n\nPlease check `public/PicoLabb_Demo_Guide_zh.md`.');
      });
    return () => {
      alive = false;
    };
  }, []);

  const html = useMemo(() => {
    marked.setOptions({ gfm: true, breaks: true });
    return marked.parse(guideMd);
  }, [guideMd]);

  return (
    <div className="demo-guide-page">
      <header
        className="demo-guide-header"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          padding: '0.75rem 1.25rem',
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <strong style={{ fontSize: '1rem' }}>{t('demoGuide.title', lang)}</strong>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('demoGuide.subtitle', lang)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn secondary"
            style={{ fontSize: '0.85rem', padding: '0.4rem 0.75rem' }}
            onClick={() => window.print()}
          >
            {t('demoGuide.savePdf', lang)}
          </button>
          <Link to="/" className="btn secondary" style={{ fontSize: '0.85rem', padding: '0.4rem 0.75rem' }}>
            {currentUser ? t('demoGuide.backApp', lang) : t('demoGuide.backLogin', lang)}
          </Link>
        </div>
      </header>
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '1.5rem 1.25rem 3rem' }}>
        <article
          className="demo-guide-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </main>
    </div>
  );
}
