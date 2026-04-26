import { whatsappHref } from '../data/hkBranches';
import { t } from '../i18n';

export default function HkBranchesReference({ lang, branches = [] }) {
  return (
    <section
      className="card hk-branches-ref"
      style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--accent)' }}
    >
      <h2 style={{ margin: '0 0 0.35rem', fontSize: '1.1rem' }}>
        {t('data.branchesTitle', lang)}
      </h2>
      <p style={{ margin: '0 0 1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        {t('data.branchesIntro', lang)}
      </p>
      <div
        className="hk-branches-grid"
        style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        }}
      >
        {branches.map((b) => {
          const wa = whatsappHref(b.whatsapp);
          return (
            <article
              key={b.id}
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '1rem',
                fontSize: '0.88rem',
                lineHeight: 1.5,
              }}
            >
              <h3 style={{ margin: '0 0 0.65rem', fontSize: '1rem', color: 'var(--text)' }}>
                {lang === 'zh' ? b.name_zh : b.name_en}
                <span style={{ display: 'block', fontWeight: 400, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {lang === 'zh' ? b.name_en : b.name_zh}
                </span>
              </h3>
              <p style={{ margin: '0 0 0.5rem', color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--text)' }}>{t('data.branchDistrict', lang)}:</strong>{' '}
                {lang === 'zh' ? b.district_zh : b.district_en}
                {lang === 'zh' ? ` / ${b.district_en}` : ` / ${b.district_zh}`}
              </p>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>{t('data.branchAddress', lang)}:</strong>
                <br />
                {lang === 'zh' ? b.address_zh : b.address_en}
                {lang === 'zh' && (
                  <>
                    <br />
                    <span style={{ color: 'var(--text-muted)' }}>{b.address_en}</span>
                  </>
                )}
              </p>
              <p style={{ margin: '0 0 0.35rem' }}>
                <strong>{t('data.branchPhone', lang)}:</strong>{' '}
                <a href={`tel:${String(b.phone || '').replace(/\s/g, '')}`}>{b.phone || '—'}</a>
              </p>
              <p style={{ margin: '0 0 0.35rem' }}>
                <strong>{t('data.branchWhatsapp', lang)}:</strong>{' '}
                {wa ? (
                  <a href={wa} target="_blank" rel="noreferrer">
                    {b.whatsapp}
                  </a>
                ) : (
                  b.whatsapp
                )}
              </p>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--text)' }}>{t('data.branchHours', lang)}:</strong>{' '}
                {lang === 'zh' ? b.hours_zh : b.hours_en}
                {lang === 'zh' ? ` / ${b.hours_en}` : ` / ${b.hours_zh}`}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
