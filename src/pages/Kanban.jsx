import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../LangContext';
import { t } from '../i18n';
import { getLeads, updateLead } from '../api';
import { useUser } from '../UserContext';

const COLS = ['New', 'Needs Info', 'Qualified', 'Offered Slots', 'Booked', 'Paid/Deposit', 'Completed', 'Lost'];

export default function Kanban() {
  const { lang } = useLang();
  const { currentUser } = useUser();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moveError, setMoveError] = useState(null);

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

  const byStage = COLS.reduce((acc, s) => ({ ...acc, [s]: leads.filter((l) => l.stage === s) }), {});

  const move = async (leadId, newStage) => {
    setMoveError(null);
    const previousLeads = leads;
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, stage: newStage } : l)));
    try {
      const updated = await updateLead(leadId, { stage: newStage });
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, stage: updated.stage } : l)));
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
                <div key={lead.id} className="kanban-card">
                  <Link to={`/lead/${lead.id}`} style={{ color: 'inherit', display: 'block', marginBottom: 4 }}>
                    <span className={`badge channel-${lead.channel}`} style={{ marginRight: 4 }}>{lead.channel}</span>
                    <span className={`badge ${lead.vertical || 'unknown'}`}>{t(`vertical.${lead.vertical || 'unknown'}`, lang)}</span>
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
