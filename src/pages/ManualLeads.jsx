import { useEffect, useState } from 'react';
import { useLang } from '../LangContext';
import { t } from '../i18n';
import { createLead, getRagCategories } from '../api';

export default function ManualLeads() {
  const { lang } = useLang();
  const [channel, setChannel] = useState('whatsapp');
  const [rawMessage, setRawMessage] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [source, setSource] = useState('manual_entry');
  const [stage, setStage] = useState('New');
  const [vertical, setVertical] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    getRagCategories()
      .then((rows) => {
        setCategories(rows || []);
        if (!vertical && rows?.length) setVertical(rows[0].code);
      })
      .catch((e) => console.error(e));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!rawMessage.trim()) {
      setError(lang === 'zh' ? '請輸入查詢內容' : 'Please enter inquiry message');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const result = await createLead({
        channel,
        raw_message: rawMessage.trim(),
        name: name.trim() || undefined,
        contact: contact.trim() || undefined,
        source: source.trim() || undefined,
        vertical: vertical || undefined,
      });
      if (stage !== 'New' && result?.lead?.id) {
        // Optional stage override when operator needs direct pipeline placement.
        await fetch(`${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api/leads/${result.lead.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stage }),
        });
      }
      setRawMessage('');
      setName('');
      setContact('');
      setSuccess(lang === 'zh' ? '已成功新增 lead' : 'Lead created successfully');
    } catch (err) {
      setError(err.message || (lang === 'zh' ? '新增失敗' : 'Failed to create lead'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="manual-leads-wrap">
      <div className="manual-leads-card">
        <h1>{t('manualLeads.title', lang)}</h1>
        <p>{t('manualLeads.hint', lang)}</p>
      </div>

      <form onSubmit={submit} className="manual-leads-form">
        <label className="manual-leads-field">
          {t('manualLeads.channel', lang)}
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
          >
            <option value="whatsapp">WhatsApp</option>
            <option value="shopline">Shopline</option>
          </select>
        </label>

        <label className="manual-leads-field">
          {t('manualLeads.category', lang)}
          <select value={vertical} onChange={(e) => setVertical(e.target.value)}>
            {categories.map((c) => (
              <option key={c.code} value={c.code}>
                {c.display_name}
              </option>
            ))}
          </select>
        </label>

        <label className="manual-leads-field">
          {t('manualLeads.stage', lang)}
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
          >
            <option value="New">New</option>
            <option value="Needs Info">Needs Info</option>
            <option value="Qualified">Qualified</option>
            <option value="Offered Slots">Offered Slots</option>
            <option value="Booked">Booked</option>
            <option value="Paid/Deposit">Paid/Deposit</option>
          </select>
        </label>

        <label className="manual-leads-field manual-leads-field-full">
          {t('manualLeads.message', lang)}
          <textarea
            value={rawMessage}
            onChange={(e) => setRawMessage(e.target.value)}
            placeholder={t('manualLeads.messagePlaceholder', lang)}
            rows={4}
          />
        </label>

        <label className="manual-leads-field">
          {t('manualLeads.fullName', lang)}
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>

        <label className="manual-leads-field">
          {t('manualLeads.contact', lang)}
          <input value={contact} onChange={(e) => setContact(e.target.value)} />
        </label>

        <label className="manual-leads-field manual-leads-field-full">
          {t('manualLeads.source', lang)}
          <input value={source} onChange={(e) => setSource(e.target.value)} />
        </label>

        {error && <p className="manual-leads-status manual-leads-status-error">{error}</p>}
        {success && <p className="manual-leads-status manual-leads-status-success">{success}</p>}

        <div className="manual-leads-actions">
          <button className="btn" type="submit" disabled={loading}>
            {loading ? t('manualLeads.creating', lang) : t('manualLeads.submit', lang)}
          </button>
        </div>
      </form>
    </div>
  );
}
