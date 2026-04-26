import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../LangContext';
import { t } from '../i18n';

const SEED_CONTACTS = [
  { id: '1', name: 'Zoe Li', phone: '+852 9123 4567', company: 'Zoe Li Fitness', tags: ['Fitness', 'VIP'], lastMessageAt: '2 min ago', lastMessagePreview: 'Hi 請問你 small group 仲有位嗎？價錢點？', unreadCount: 1, pipelineStage: 'Qualified', avatar: '🏋️' },
  { id: '2', name: 'Jason Chan', phone: '+852 9234 5678', company: 'Picolab', tags: ['B2B', 'Design'], lastMessageAt: '15 min ago', lastMessagePreview: 'Can you send a quote for the redesign scope?', unreadCount: 2, pipelineStage: 'Qualified', avatar: '🎨' },
  { id: '3', name: 'Michael Wong', phone: '+852 9345 6789', company: 'Picolab', tags: ['B2B', 'Existing'], lastMessageAt: '1 hr ago', lastMessagePreview: 'Quick check on timeline for product pages?', unreadCount: 0, pipelineStage: 'Negotiation', avatar: '📦' },
  { id: '4', name: 'Karen Lau', phone: '+852 9456 7890', tags: ['Fitness', 'Repeat'], lastMessageAt: '3 hr ago', lastMessagePreview: '上次個 whey 食曬，有冇新貨？', unreadCount: 0, avatar: '💪' },
  { id: '5', name: 'Ivy Ng', phone: '+852 9567 8901', tags: ['Fitness', 'At-risk'], lastMessageAt: '6 hr ago', lastMessagePreview: '今晚改 9pm 得唔得呀抱歉', unreadCount: 1, avatar: '⚠️' },
  { id: '6', name: 'Cathy HR', phone: '+852 9678 9012', company: 'Swire Group', tags: ['Fitness', 'Corporate', 'Hot'], lastMessageAt: '52 hr ago', lastMessagePreview: 'Interested in corporate wellness program for ~40 staff', unreadCount: 1, pipelineStage: 'Qualified', avatar: '🏢' },
  { id: '7', name: 'Derek Lam', phone: '+852 9789 0123', company: 'Picolab', tags: ['B2B', 'Overdue-pay'], lastMessageAt: '2 days ago', lastMessagePreview: "Could you resend the invoice? couldn't find it", unreadCount: 1, pipelineStage: 'Won', avatar: '📄' },
];

export default function Contacts() {
  const { lang } = useLang();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return SEED_CONTACTS.filter((c) => {
      const k = search.trim().toLowerCase();
      if (k && !c.name.toLowerCase().includes(k) && !(c.company || '').toLowerCase().includes(k)) return false;
      if (filter === 'unread') return c.unreadCount > 0;
      if (filter === 'overdue') return c.lastMessageAt.includes('day') || (c.lastMessageAt.includes('hr') && parseInt(c.lastMessageAt, 10) >= 48);
      return true;
    });
  }, [filter, search]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '0.75rem', flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0 }}>{t('contacts.title', lang)}</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('contacts.search', lang)} style={{ padding: '0.45rem 0.65rem', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)', color: 'var(--text)' }} />
          <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: '0.45rem 0.65rem', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)', color: 'var(--text)' }}>
            <option value="all">{t('contacts.all', lang)} ({SEED_CONTACTS.length})</option>
            <option value="unread">{t('contacts.unread', lang)}</option>
            <option value="overdue">{t('contacts.overdue', lang)}</option>
          </select>
        </div>
      </div>
      <div className="card" style={{ padding: 0 }}>
        {filtered.map((c) => (
          <Link key={c.id} to={`/?contact=${c.id}`} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: '1.8rem' }}>{c.avatar}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <strong>{c.name}</strong>
                {c.company ? <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>· {c.company}</span> : null}
                {c.pipelineStage ? <span className="badge" style={{ background: 'rgba(59,130,246,0.2)' }}>{c.pipelineStage}</span> : null}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{c.lastMessagePreview}</div>
            </div>
            <div style={{ textAlign: 'right', minWidth: 80 }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{c.lastMessageAt}</div>
              {c.unreadCount > 0 ? <span className="badge" style={{ background: 'rgba(239,68,68,0.2)' }}>{c.unreadCount}</span> : null}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
