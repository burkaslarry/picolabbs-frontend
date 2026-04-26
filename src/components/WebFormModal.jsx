import { useState } from 'react';
import { useLang } from '../LangContext';
import { t } from '../i18n';
import { createLead } from '../api';

export default function WebFormModal({ onClose, onCreated }) {
  const { lang } = useLang();
  const [raw_message, setRaw_message] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [source, setSource] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!raw_message.trim()) { setError('Message is required'); return; }
    setLoading(true);
    setError('');
    try {
      await createLead({
        channel: 'web',
        raw_message: raw_message.trim(),
        name: name.trim() || undefined,
        contact: contact.trim() || undefined,
        source: source.trim() || undefined,
      });
      onCreated();
    } catch (e) {
      setError(e.message || 'Failed to create lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{t('modal.webFormTitle', lang)}</h2>
        <form onSubmit={submit}>
          <div className="form-group">
            <label>{t('modal.messageRequired', lang)}</label>
            <textarea value={raw_message} onChange={(e) => setRaw_message(e.target.value)} placeholder={t('modal.inquiryPlaceholder', lang)} required />
          </div>
          <div className="form-group">
            <label>{t('modal.name', lang)}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('modal.name', lang)} />
          </div>
          <div className="form-group">
            <label>{t('leadDetail.contact', lang)}</label>
            <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Email or phone" />
          </div>
          <div className="form-group">
            <label>{t('modal.howHeard', lang)}</label>
            <input value={source} onChange={(e) => setSource(e.target.value)} placeholder="e.g. Google, referral" />
          </div>
          {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>}
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn secondary" onClick={onClose}>{t('leadDetail.cancel', lang)}</button>
            <button type="submit" className="btn" disabled={loading}>{loading ? t('modal.creating', lang) : t('modal.createLead', lang)}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
