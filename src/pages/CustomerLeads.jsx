import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../LangContext';
import { t } from '../i18n';
import { getLeads, getRagCategories } from '../api';
import { useUser } from '../UserContext';

const STAGES = ['New', 'Needs Info', 'Qualified', 'Offered Slots', 'Booked', 'Paid/Deposit', 'Completed', 'Lost'];

export default function CustomerLeads() {
  const { lang } = useLang();
  const { currentUser } = useUser();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'returning'
  const [categoryMap, setCategoryMap] = useState({});

  let visibleStages = STAGES;
  if (currentUser?.username === 'plsales_001') visibleStages = ['New', 'Needs Info', 'Qualified', 'Offered Slots', 'Booked'];
  if (currentUser?.username === 'plsales_002') visibleStages = ['Paid/Deposit', 'Completed', 'Lost'];

  const load = async () => {
    setLoading(true);
    try {
      const data = await getLeads();
      setLeads(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    getRagCategories()
      .then((rows) => {
        const map = {};
        (rows || []).forEach((r) => { map[r.code] = r.display_name; });
        setCategoryMap(map);
      })
      .catch((e) => console.error(e));
  }, []);

  const scoped = leads.filter((l) => visibleStages.includes(l.stage));
  const filtered = filter === 'returning'
    ? scoped.filter((l) => l.is_returning_customer)
    : scoped;

  const sorted = [...filtered].sort((a, b) => {
    const ra = a.is_returning_customer ? 1 : 0;
    const rb = b.is_returning_customer ? 1 : 0;
    if (rb !== ra) return rb - ra;
    return Date.parse(b.created_at || 0) - Date.parse(a.created_at || 0);
  });

  const returningCount = scoped.filter((l) => l.is_returning_customer).length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>{t('returning.title', lang)}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.5rem 0 0', maxWidth: 640 }}>
            {t('returning.subtitle', lang)}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: '0.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }}
          >
            <option value="all">{t('returning.filterAll', lang)}</option>
            <option value="returning">{t('returning.filterReturning', lang)}</option>
          </select>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {t('returning.summary', lang, { n: String(returningCount) })}
          </span>
        </div>
      </div>

      <div className="table-wrap card">
        {loading ? (
          <p>{t('inbox.loading', lang)}</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>{t('returning.columnCustomer', lang)}</th>
                <th>{t('returning.columnVisit', lang)}</th>
                <th>{t('inbox.channel', lang)}</th>
                <th>{t('inbox.vertical', lang)}</th>
                <th>{t('inbox.stage', lang)}</th>
                <th>{t('inbox.preview', lang)}</th>
                <th>{t('inbox.created', lang)}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span>{lead.contact || lead.name || '—'}</span>
                      {lead.is_returning_customer && (
                        <span className="badge badge-returning" style={{ alignSelf: 'flex-start' }}>
                          {t('returning.badge', lang)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    {t('returning.visitLine', lang, {
                      visit: String(lead.returning_visit_number ?? 1),
                      total: String(lead.same_contact_lead_count ?? 1),
                    })}
                  </td>
                  <td><span className={`badge channel-${lead.channel}`}>{lead.channel}</span></td>
                  <td>
                    <span className={`badge vertical-tag ${lead.vertical || 'unknown'}`}>
                      {lead.vertical_display_name || categoryMap[lead.vertical] || t(`vertical.${lead.vertical || 'unknown'}`, lang)}
                    </span>
                  </td>
                  <td>{lead.stage}</td>
                  <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {lead.raw_message?.slice(0, 50) || '—'}
                    {lead.raw_message?.length > 50 ? '…' : ''}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(lead.created_at).toLocaleString()}</td>
                  <td><Link to={`/lead/${lead.id}`}>{t('inbox.open', lang)}</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && sorted.length === 0 && (
          <p style={{ padding: '1rem', color: 'var(--text-muted)' }}>{t('returning.empty', lang)}</p>
        )}
      </div>
    </div>
  );
}
