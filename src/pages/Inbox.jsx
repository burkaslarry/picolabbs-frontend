import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../LangContext';
import { t } from '../i18n';
import { getLeads } from '../api';
import { useUser } from '../UserContext';
import WhatsAppPasteModal from '../components/WhatsAppPasteModal';
import AiAssistPanel from '../components/AiAssistPanel';

const STAGES = ['New', 'Needs Info', 'Qualified', 'Offered Slots', 'Booked', 'Paid/Deposit', 'Completed', 'Lost'];

export default function Inbox() {
  const { lang } = useLang();
  const { currentUser } = useUser();
  const [leads, setLeads] = useState([]);
  const [channel, setChannel] = useState('');
  const [stage, setStage] = useState('');
  const [loading, setLoading] = useState(true);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

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

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>AI Triage & Draft Generator</h3>
        <p style={{ marginTop: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Select a lead to run AI classification and generate a product reply.
        </p>
        {selectedLead ? (
          <div>
            <div style={{ fontSize: '0.85rem', marginBottom: 6 }}>
              <strong>{selectedLead.name || selectedLead.contact || selectedLead.id}</strong>
            </div>
            <AiAssistPanel messageText={selectedLead.raw_message || ''} contactName={selectedLead.name || ''} />
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', marginBottom: 0 }}>No lead selected.</p>
        )}
      </div>

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
                  <td><span className={`badge ${lead.vertical || 'unknown'}`}>{t(`vertical.${lead.vertical || 'unknown'}`, lang)}</span></td>
                  <td>{lead.stage}</td>
                  <td>{lead.contact || lead.name || '—'}</td>
                  <td style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {lead.raw_message?.slice(0, 60) || '—'}
                    {lead.raw_message?.length > 60 ? '…' : ''}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(lead.created_at).toLocaleString()}</td>
                  <td style={{ display: 'flex', gap: 8 }}>
                    <Link to={`/lead/${lead.id}`}>{t('inbox.open', lang)}</Link>
                    <button type="button" className="btn secondary" style={{ padding: '0.15rem 0.45rem', fontSize: '0.75rem' }} onClick={() => setSelectedLead(lead)}>
                      AI
                    </button>
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
