import { useLang } from '../LangContext';
import { t } from '../i18n';

const OVERDUE = [
  { id: 's1', contactName: 'Cathy HR', company: 'Swire Group', lastMessagePreview: 'Interested in corporate wellness for ~40 staff', hoursOverdue: 52, priority: 'High', avatar: '🏢' },
  { id: 's2', contactName: 'Derek Lam', company: 'Picolab', lastMessagePreview: "Could you resend the invoice?", hoursOverdue: 49, priority: 'High', avatar: '📄' },
  { id: 's3', contactName: 'Ivy Ng', lastMessagePreview: '今晚改 9pm 得唔得呀抱歉', hoursOverdue: 6, priority: 'Medium', avatar: '⚠️' },
];
const TODAY_DUE = [
  { id: 't1', contactName: 'Karen Lau', lastMessagePreview: '上次個 whey 食曬，有冇新貨？', hoursOverdue: 18, priority: 'Medium', avatar: '💪' },
  { id: 't2', contactName: 'Jason Chan', company: 'Picolab', lastMessagePreview: 'Can you send a quote for the redesign scope?', hoursOverdue: 12, priority: 'High', avatar: '🎨' },
];

function MetricCard({ label, value, icon, color }) {
  const colorMap = {
    red: 'rgba(239,68,68,0.15)',
    yellow: 'rgba(234,179,8,0.15)',
    green: 'rgba(34,197,94,0.15)',
    blue: 'rgba(59,130,246,0.15)',
  };
  return (
    <div className="card" style={{ background: colorMap[color], borderColor: 'var(--border)' }}>
      <div style={{ fontSize: '1.2rem' }}>{icon}</div>
      <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{label}</div>
    </div>
  );
}

function Section({ title, items, accent, draftLabel, overdueSuffix }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <h3 style={{ marginBottom: '0.5rem' }}>{title}</h3>
      <div className="card" style={{ padding: 0, borderColor: accent }}>
        {items.map((item) => (
          <div key={item.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: '1.4rem' }}>{item.avatar}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>
                {item.contactName}
                {item.company ? <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}> · {item.company}</span> : null}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{item.lastMessagePreview}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: 'var(--danger)', fontWeight: 600 }}>{item.hoursOverdue}{overdueSuffix}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.priority}</div>
            </div>
            <button className="btn secondary" type="button">{draftLabel}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Sla() {
  const { lang } = useLang();
  return (
    <div>
      <h1 style={{ margin: 0 }}>{t('sla.title', lang)}</h1>
      <p style={{ color: 'var(--text-muted)', marginTop: 6 }}>{t('sla.subtitle', lang)}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginBottom: 16 }}>
        <MetricCard label={t('sla.mOverdue', lang)} value="2" color="red" icon="🚨" />
        <MetricCard label={t('sla.mDueToday', lang)} value="2" color="yellow" icon="⏰" />
        <MetricCard label={t('sla.mHitRate', lang)} value="87%" color="green" icon="✅" />
        <MetricCard label={t('sla.mMedian', lang)} value="3.2h" color="blue" icon="📊" />
      </div>
      <Section title={t('sla.overdueNow', lang)} items={OVERDUE} accent="rgba(239,68,68,0.5)" draftLabel={t('sla.draftReply', lang)} overdueSuffix={t('sla.overdueSuffix', lang)} />
      <Section title={t('sla.dueToday', lang)} items={TODAY_DUE} accent="rgba(234,179,8,0.5)" draftLabel={t('sla.draftReply', lang)} overdueSuffix={t('sla.overdueSuffix', lang)} />
    </div>
  );
}
