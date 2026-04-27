import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../LangContext';
import { t } from '../i18n';
import { getLeads, getRagCategories } from '../api';
import { useUser } from '../UserContext';
import WhatsAppPasteModal from '../components/WhatsAppPasteModal';

const STAGES = ['New', 'Needs Info', 'Qualified', 'Offered Slots', 'Booked', 'Paid/Deposit', 'Completed', 'Lost'];

export default function Inbox() {
  const { lang } = useLang();
  const { currentUser } = useUser();
  const [leads, setLeads] = useState([]);
  const [channel, setChannel] = useState('');
  const [stage, setStage] = useState('');
  const [loading, setLoading] = useState(true);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [categoryMap, setCategoryMap] = useState({});

  let visibleStages = STAGES;
  if (currentUser?.username === 'plsales_001') visibleStages = ['New', 'Needs Info', 'Qualified', 'Offered Slots', 'Booked'];
  if (currentUser?.username === 'plsales_002') visibleStages = ['Paid/Deposit', 'Completed', 'Lost'];

  const filteredLeads = leads.filter(l => visibleStages.includes(l.stage));

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (channel) params.channel = channel;
      if (stage) params.stage = stage;
      const data = await getLeads(params);
      setLeads(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [channel, stage]);
  useEffect(() => {
    getRagCategories()
      .then((rows) => {
        const map = {};
        (rows || []).forEach((r) => { map[r.code] = r.display_name; });
        setCategoryMap(map);
      })
      .catch((e) => console.error(e));
  }, []);

  const onPasteCreated = () => {
    setPasteOpen(false);
    load();
  };
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h1 style={{ margin: 0 }}>{t('inbox.title', lang)}</h1>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            style={{ padding: '0.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }}
          >
            <option value="">{t('inbox.allChannels', lang)}</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="shopline">Shopline</option>
          </select>
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            style={{ padding: '0.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }}
          >
            <option value="">{t('inbox.allStages', lang)}</option>
            {visibleStages.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button className="btn" onClick={() => setPasteOpen(true)}>
            {t('inbox.whatsappSimulated', lang)}
          </button>
        </div>
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
        {t('inbox.hint', lang)}
      </p>

      <div className="table-wrap card">
        {loading ? (
          <p>{t('inbox.loading', lang)}</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>{t('inbox.channel', lang)}</th>
                <th>{t('inbox.vertical', lang)}</th>
                <th>{t('inbox.stage', lang)}</th>
                <th>{t('inbox.returningShort', lang)}</th>
                <th>{t('inbox.contact', lang)}</th>
                <th>{t('inbox.preview', lang)}</th>
                <th>{t('inbox.created', lang)}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead.id}>
                  <td><span className={`badge channel-${lead.channel}`}>{lead.channel}</span></td>
                  <td>
                    <span className={`badge vertical-tag ${lead.vertical || 'unknown'}`}>
                      {lead.vertical_display_name || categoryMap[lead.vertical] || t(`vertical.${lead.vertical || 'unknown'}`, lang)}
                    </span>
                  </td>
                  <td>{lead.stage}</td>
                  <td>
                    {lead.is_returning_customer ? (
                      <span className="badge badge-returning" title={t('returning.visitLine', lang, { visit: String(lead.returning_visit_number ?? 1), total: String(lead.same_contact_lead_count ?? 1) })}>
                        {t('inbox.returningShort', lang)}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>
                    )}
                  </td>
                  <td>{lead.contact || lead.name || '—'}</td>
                  <td style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {lead.raw_message?.slice(0, 60) || '—'}
                    {lead.raw_message?.length > 60 ? '…' : ''}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(lead.created_at).toLocaleString()}</td>
                  <td style={{ display: 'flex', gap: 8 }}>
                    <Link to={`/lead/${lead.id}`}>{t('inbox.open', lang)}</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && filteredLeads.length === 0 && <p style={{ padding: '1rem', color: 'var(--text-muted)' }}>{t('inbox.noLeads', lang)}</p>}
      </div>

      {pasteOpen && <WhatsAppPasteModal onClose={() => setPasteOpen(false)} onCreated={onPasteCreated} />}
    </div>
  );
}
