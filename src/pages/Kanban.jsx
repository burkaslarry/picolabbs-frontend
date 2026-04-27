import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../LangContext';
import { t } from '../i18n';
import { getLeads, getRagCategories, updateLead } from '../api';
import { useUser } from '../UserContext';

const COLS = ['New', 'Needs Info', 'Qualified', 'Offered Slots', 'Booked', 'Paid/Deposit', 'Completed', 'Lost'];

export default function Kanban() {
  const { lang } = useLang();
  const { currentUser } = useUser();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moveError, setMoveError] = useState(null);
  const [highlightLeadId, setHighlightLeadId] = useState(null);
  const [categoryMap, setCategoryMap] = useState({});

  let visibleCols = COLS;
  if (currentUser?.username === 'plsales_001') visibleCols = ['New', 'Needs Info', 'Qualified', 'Offered Slots', 'Booked'];
  if (currentUser?.username === 'plsales_002') visibleCols = ['Paid/Deposit', 'Completed', 'Lost'];

  const load = async () => {
    setLoading(true);
    setMoveError(null);
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

  const sortedLeads = [...leads].sort((a, b) => {
    const ta = Date.parse(a.updated_at || a.created_at || 0);
    const tb = Date.parse(b.updated_at || b.created_at || 0);
    return tb - ta;
  });
  const byStage = COLS.reduce((acc, s) => ({ ...acc, [s]: sortedLeads.filter((l) => l.stage === s) }), {});

  const move = async (leadId, newStage) => {
    setMoveError(null);
    const previousLeads = leads;
    const nowIso = new Date().toISOString();
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, stage: newStage, updated_at: nowIso } : l)));
    try {
      const updated = await updateLead(leadId, { stage: newStage });
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, stage: updated.stage, updated_at: updated.updated_at || nowIso } : l)));
      setHighlightLeadId(leadId);
      window.setTimeout(() => setHighlightLeadId((curr) => (curr === leadId ? null : curr)), 1200);
    } catch (e) {
      console.error(e);
      setLeads(previousLeads);
      setMoveError(e.message || (lang === 'zh' ? '無法更新階段，請再試一次' : 'Could not update stage. Please try again.'));
    }
  };

  return (
    <div>
      <h1 style={{ margin: '0 0 1rem' }}>{t('kanban.title', lang)}</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
        {t('kanban.hint', lang)}
      </p>
      {moveError && (
        <p style={{ color: 'var(--danger)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>{moveError}</p>
      )}
      {loading ? (
        <p>{t('kanban.loading', lang)}</p>
      ) : (
        <div className="kanban">
          {visibleCols.map((stage) => (
            <div key={stage} className="kanban-col">
              <h3>{stage} ({byStage[stage]?.length ?? 0})</h3>
              {(byStage[stage] || []).map((lead) => (
                <div key={lead.id} className={`kanban-card ${highlightLeadId === lead.id ? 'kanban-card-flash' : ''}`}>
                  <Link
                    to={`/lead/${lead.id}`}
                    style={{
                      color: 'inherit',
                      display: 'flex',
                      flexWrap: 'nowrap',
                      alignItems: 'center',
                      gap: 6,
                      marginBottom: 4,
                      minWidth: 0,
                    }}
                  >
                    <span className={`badge channel-${lead.channel}`} style={{ flexShrink: 0 }}>{lead.channel}</span>
                    <span className={`badge vertical-tag ${lead.vertical || 'unknown'}`} style={{ minWidth: 0 }}>
                      {lead.vertical_display_name || categoryMap[lead.vertical] || t(`vertical.${lead.vertical || 'unknown'}`, lang)}
                    </span>
                    {lead.is_returning_customer && (
                      <span
                        className="badge badge-returning"
                        style={{ flexShrink: 0, fontSize: '0.68rem' }}
                        title={t('returning.visitLine', lang, {
                          visit: String(lead.returning_visit_number ?? 1),
                          total: String(lead.same_contact_lead_count ?? 1),
                        })}
                      >
                        {t('returning.kanbanCompact', lang, {
                          visit: String(lead.returning_visit_number ?? 1),
                          total: String(lead.same_contact_lead_count ?? 1),
                        })}
                      </span>
                    )}
                  </Link>
                  <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {lead.raw_message?.slice(0, 50) || '—'}…
                  </p>
                  <div onClick={(e) => e.stopPropagation()} style={{ marginTop: 4 }}>
                    <select
                      value={lead.stage || 'New'}
                      onChange={(e) => move(lead.id, e.target.value)}
                      style={{ width: '100%', padding: '0.35rem', fontSize: '0.8rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', cursor: 'pointer' }}
                    >
                      {COLS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
