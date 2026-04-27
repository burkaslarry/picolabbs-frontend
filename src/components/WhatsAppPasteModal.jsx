import { useState } from 'react';
import { useLang } from '../LangContext';
import { t } from '../i18n';
import { createInquiry } from '../api';

export default function WhatsAppPasteModal({ onClose, onCreated }) {
  const { lang } = useLang();
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const PRESETS = [
    { label: 'iRelief 門市存貨', msg: '想買母親節 iRelief 組合 $6988 果套，請問銅鑼灣門市有冇現貨？' },
    { label: 'The Shield Pro 功效', msg: 'The Shield Pro 隨身護盾有咩用？可以帶上飛機嗎？' },
    { label: 'iKnee 中環試用 (EN)', msg: 'Hi, I am interested in the iKnee bundle for my mother. Can I try it at the Central Wellness Hub before buying?' },
    { label: 'Happy Pet 狗關節', msg: '狗狗有骨刺關節炎，朋友介紹話你地隻 Happy Pet 關節儀有效，想問點樣用同埋幾錢？' }
  ];

  const submit = async (e) => {
    e.preventDefault();
    if (!message.trim()) { setError('Message is required'); return; }
    setLoading(true);
    setError('');
    try {
      await createInquiry({ message: message.trim(), contact: contact.trim() || undefined });
      onCreated();
    } catch (e) {
      setError(e.message || 'Failed to create inquiry');
    } finally {
      setLoading(false);
    }
  };

  return (
    /*
      UI Component: WhatsApp modal overlay backdrop
      - Full-screen dim background
      - Click backdrop to close modal
    */
    <div className="modal-overlay" onClick={onClose}>
      {/*
        UI Component: WhatsApp modal panel
        - Main dialog container in center
        - Stops click propagation so inside clicks do not close modal
      */}
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{t('modal.whatsappTitle', lang)}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          {t('modal.whatsappHint', lang)}
        </p>

        {/*
          UI Component: Preset quick-insert chips
          - Sample scenarios for one-click message fill
          - Includes supplement/product-related examples
        */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              className="badge preset-chip"
              style={{ background: 'var(--surface-hover)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: '0.8rem', padding: '0.2rem 0.5rem' }}
              onClick={() => setMessage(p.msg)}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/*
          UI Component: Inquiry creation form
          - Message textarea (required)
          - Contact input (optional)
          - Error message area
          - Cancel / Create action buttons
        */}
        <form onSubmit={submit}>
          <div className="form-group">
            <label>{t('modal.messageRequired', lang)}</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Paste WhatsApp message here…" required />
          </div>
          <div className="form-group">
            <label>{t('modal.contact', lang)}</label>
            <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder={t('modal.contactPlaceholder', lang)} />
          </div>
          {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>}
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn secondary" onClick={onClose}>{t('leadDetail.cancel', lang)}</button>
            <button type="submit" className="btn" disabled={loading}>{loading ? t('modal.creating', lang) : t('modal.createInquiry', lang)}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
