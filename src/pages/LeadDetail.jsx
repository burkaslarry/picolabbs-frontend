import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLang } from '../LangContext';
import { useUser } from '../UserContext';
import { t as tr } from '../i18n';
import { LeadDetailSkeleton } from '../components/Skeleton';
import { getLead, updateLead, getDraft, completeTask } from '../api';
import { getRagCategories } from '../api';
const STAGES = ['New', 'Needs Info', 'Qualified', 'Offered Slots', 'Booked', 'Paid/Deposit', 'Completed', 'Lost'];

function parseJsonPayload(payload) {
  if (!payload || typeof payload !== 'string') return null;
  try {
    return JSON.parse(payload);
  } catch (_) {
    return null;
  }
}

function formatTimelinePayload(eventType, payloadObj, lang) {
  if (!payloadObj || typeof payloadObj !== 'object') return null;

  if (eventType === 'created') {
    const channel = payloadObj.channel || '—';
    const source = payloadObj.source || '—';
    return lang === 'zh'
      ? `渠道: ${channel} · 來源: ${source}`
      : `Channel: ${channel} · Source: ${source}`;
  }

  if (eventType === 'automations_applied') {
    const applied = Array.isArray(payloadObj.applied) ? payloadObj.applied : [];
    if (applied.length === 0) {
      return lang === 'zh' ? '已套用規則: 無' : 'Applied rules: none';
    }
    const names = applied
      .map((item) => item?.rule)
      .filter(Boolean)
      .join(' · ');
    return lang === 'zh' ? `已套用規則: ${names}` : `Applied rules: ${names}`;
  }

  const parts = Object.entries(payloadObj)
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`);

  return parts.length ? parts.join(' · ') : null;
}

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useLang();
  const { currentUser } = useUser();
  const [lead, setLead] = useState(null);
  const isOperator = currentUser && (currentUser.role === 'operator' || currentUser.role === 'superadmin');
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [draftLoading, setDraftLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [serviceDateDraft, setServiceDateDraft] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await getLead(id);
      setLead(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);
  useEffect(() => {
    getRagCategories().then(setCategories).catch((e) => console.error(e));
  }, []);
  useEffect(() => {
    setServiceDateDraft(lead?.service_date || '');
  }, [lead?.service_date]);

  // Show skeleton immediately so the page feels responsive
  if (loading && !lead) return <LeadDetailSkeleton />;

  const handleStageChange = async (newStage) => {
    try {
      await updateLead(id, { stage: newStage });
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  const handleServiceDateChange = async (value) => {
    const service_date = value || null;
    try {
      await updateLead(id, { service_date: service_date || undefined });
      setLead((p) => (p ? { ...p, service_date } : null));
    } catch (e) {
      console.error(e);
    }
  };

  const handleVerticalChange = async (newVertical) => {
    const value = newVertical || null;
    try {
      await updateLead(id, { vertical: value || undefined });
      setLead((p) => (p ? { ...p, vertical: value } : null));
    } catch (e) {
      console.error(e);
    }
  };

  const generateDraft = async () => {
    if (!lead?.ai_triage) return;
    setDraftLoading(true);
    try {
      const triageData = lead.ai_triage;
      const ext = typeof triageData.extracted_fields === 'string' ? JSON.parse(triageData.extracted_fields || '{}') : (triageData.extracted_fields || {});
      const res = await getDraft({
        vertical: triageData.vertical || 'picolabbs_wellness',
        intent: triageData.intent || 'info',
        name: lead.name,
        service: triageData.subcategory || ext.serviceName,
        location: ext.location,
      });
      setDraft(res.draft);
    } catch (e) {
      console.error(e);
    } finally {
      setDraftLoading(false);
    }
  };

  const copyDraft = () => {
    if (draft) navigator.clipboard.writeText(draft);
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await completeTask(id, taskId);
      load();
    } catch (e) {
      console.error(e);
    }
  };

  if (!lead) return <p>{tr('leadDetail.loading', lang)}</p>;

  const triage = lead.ai_triage;

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <button className="btn secondary" onClick={() => navigate(-1)}>{tr('leadDetail.back', lang)}</button>
      </div>

      {triage?.safety_escalate === 1 && (
        <div className="escalate-banner">{tr('leadDetail.escalate', lang)}</div>
      )}
      {triage?.urgency_score >= 80 && (
        <div className="urgency-high">{tr('leadDetail.highUrgency', lang)}</div>
      )}

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h2 style={{ margin: '0 0 0.5rem' }}>{tr('leadDetail.lead', lang)}</h2>
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>{tr('inbox.channel', lang)}: <span className={`badge channel-${lead.channel}`}>{lead.channel}</span></p>
        <p style={{ margin: '0.5rem 0 0' }}>
          <strong>{tr('inbox.vertical', lang)} (Service scope):</strong>{' '}
          <select
            value={lead.vertical || ''}
            onChange={(e) => handleVerticalChange(e.target.value || null)}
            style={{ marginLeft: 4, padding: '0.35rem 0.5rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', minWidth: 160 }}
          >
            <option value="">—</option>
            {categories.map((c) => (
              <option key={c.code} value={c.code}>
                {c.display_name}
              </option>
            ))}
          </select>
        </p>
        <p style={{ margin: '0.5rem 0 0' }}><strong>{tr('leadDetail.stage', lang)}:</strong>
          <select
            value={lead.stage}
            onChange={(e) => handleStageChange(e.target.value)}
            style={{ marginLeft: 8, padding: '0.35rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)' }}
          >
            {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {isOperator && lead.stage !== 'Booked' && (
            <button
              type="button"
              className="btn"
              style={{ marginLeft: 12, padding: '0.35rem 0.75rem', fontSize: '0.9rem' }}
              onClick={() => handleStageChange('Booked')}
            >
              {tr('leadDetail.confirmBooking', lang)}
            </button>
          )}
        </p>
        <p style={{ margin: '0.5rem 0 0' }}><strong>{tr('leadDetail.contact', lang)}:</strong> {lead.contact || lead.name || '—'}</p>
        {lead.is_returning_customer && (
          <p style={{ margin: '0.5rem 0 0' }}>
            <span className="badge badge-returning">{tr('returning.badge', lang)}</span>
            <span style={{ marginLeft: 8, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {tr('returning.detailHint', lang, {
                visit: String(lead.returning_visit_number ?? 1),
                total: String(lead.same_contact_lead_count ?? 1),
              })}
            </span>
          </p>
        )}
        <p style={{ margin: '0.5rem 0 0' }}>
          <strong>{tr('leadDetail.serviceDate', lang)}:</strong>{' '}
          <input
            type="text"
            inputMode="numeric"
            placeholder="YYYY-MM-DD"
            value={serviceDateDraft}
            onChange={(e) => setServiceDateDraft(e.target.value)}
            onBlur={() => {
              const value = serviceDateDraft.trim();
              if (!value) {
                handleServiceDateChange(null);
                return;
              }
              if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                handleServiceDateChange(value);
              } else {
                setServiceDateDraft(lead?.service_date || '');
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
            }}
            style={{ padding: '0.35rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)' }}
          />
          <span style={{ marginLeft: 8, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{tr('leadDetail.serviceDateHint', lang)}</span>
        </p>
        <p style={{ margin: '0.5rem 0 0', whiteSpace: 'pre-wrap' }}><strong>{tr('leadDetail.message', lang)}:</strong><br />{lead.raw_message || '—'}</p>
      </div>

      {lead.tasks?.length > 0 && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <h3 style={{ margin: '0 0 0.75rem' }}>{tr('leadDetail.tasks', lang)}</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {lead.tasks.map((task) => (
              <li key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span>{task.title}</span>
                {!task.completed_at && (
                  <button className="btn secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }} onClick={() => handleCompleteTask(task.id)}>{tr('leadDetail.complete', lang)}</button>
                )}
                {task.completed_at && <span style={{ color: 'var(--success)', fontSize: '0.85rem' }}>{tr('leadDetail.done', lang)}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3 style={{ margin: '0 0 0.75rem' }}>{tr('leadDetail.whatsappDraft', lang)}</h3>
        <button className="btn secondary" style={{ marginBottom: '0.75rem' }} onClick={generateDraft} disabled={draftLoading}>{draftLoading ? '…' : tr('leadDetail.generateDraft', lang)}</button>
        {draft && (
          <>
            <pre style={{ background: 'var(--bg)', padding: '1rem', borderRadius: 8, whiteSpace: 'pre-wrap', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{draft}</pre>
            <button className="btn" onClick={copyDraft}>{tr('leadDetail.copy', lang)}</button>
          </>
        )}
      </div>

      <div className="card">
        <h3 style={{ margin: '0 0 0.75rem' }}>{tr('leadDetail.timeline', lang)}</h3>
        <ul className="timeline">
          {(lead.timeline || []).map((ev) => (
            <li key={ev.id}>
              <span className="time">{new Date(ev.created_at).toLocaleString(lang === 'zh' ? 'zh-Hant-TW' : 'en')}</span> — {ev.event_type}
              {(() => {
                const payloadObj = parseJsonPayload(ev.payload);
                const readable = formatTimelinePayload(ev.event_type, payloadObj, lang);
                if (readable) {
                  return <div style={{ marginTop: 4, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{readable}</div>;
                }
                if (ev.payload) {
                  return <div style={{ marginTop: 4, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{ev.payload}</div>;
                }
                return null;
              })()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
