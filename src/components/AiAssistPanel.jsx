import { useState } from 'react';
import { analyzeAiMessage } from '../api';

export default function AiAssistPanel({ messageText, contactName }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState('canto');
  const [editedDraft, setEditedDraft] = useState('');
  const [error, setError] = useState('');

  async function analyze() {
    if (!messageText?.trim()) return;
    setLoading(true);
    setError('');
    try {
      const data = await analyzeAiMessage({
        messageText: messageText.trim(),
        contactName: contactName || '',
      });
      setResult(data);
      setEditedDraft(data?.draft_canto || '');
      setLang('canto');
    } catch (e) {
      setError(e.message || 'Failed');
    } finally {
      setLoading(false);
    }
  }

  const priority = result?.triage?.priority || 'Low';
  const priorityColor =
    priority === 'High'
      ? 'rgba(239,68,68,0.2)'
      : priority === 'Medium'
        ? 'rgba(234,179,8,0.2)'
        : 'rgba(148,163,184,0.2)';

  if (!result) {
    return (
      <div>
        <button
          type="button"
          onClick={analyze}
          disabled={loading || !messageText?.trim()}
          className="btn"
        >
          {loading ? 'Analyzing…' : 'Generate Triage & Draft'}
        </button>
        {error ? <p style={{ marginTop: 8, color: 'var(--danger)' }}>{error}</p> : null}
      </div>
    );
  }

  return (
    <div style={{ marginTop: 12, padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--surface)' }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        <span className="badge" style={{ background: 'rgba(59,130,246,0.2)' }}>
          {result?.triage?.category || 'Other'}
        </span>
        <span className="badge" style={{ background: priorityColor }}>
          {priority} Priority
        </span>
        {result?.pipeline_suggestion?.suggested_stage ? (
          <span className="badge" style={{ background: 'rgba(34,197,94,0.2)' }}>
            {result.pipeline_suggestion.suggested_stage}
          </span>
        ) : null}
      </div>
      <p style={{ margin: '0 0 8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        {result?.triage?.reasoning}
      </p>
      <div style={{ marginBottom: 10 }}>
        <strong style={{ fontSize: '0.85rem' }}>Next step</strong>
        <div style={{ fontSize: '0.9rem', marginTop: 4 }}>{result?.next_step}</div>
      </div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <strong style={{ fontSize: '0.85rem' }}>Draft reply</strong>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              className="btn secondary"
              style={{ padding: '0.15rem 0.45rem', fontSize: '0.75rem' }}
              onClick={() => {
                setLang('canto');
                setEditedDraft(result?.draft_canto || '');
              }}
            >
              廣東話
            </button>
            <button
              type="button"
              className="btn secondary"
              style={{ padding: '0.15rem 0.45rem', fontSize: '0.75rem' }}
              onClick={() => {
                setLang('english');
                setEditedDraft(result?.draft_english || '');
              }}
            >
              English
            </button>
          </div>
        </div>
        <textarea
          value={editedDraft}
          onChange={(e) => setEditedDraft(e.target.value)}
          style={{ width: '100%', minHeight: 90, background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 8, padding: 8 }}
        />
      </div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        Follow-up in {result?.follow_up?.due_in_hours ?? 24}h — {result?.follow_up?.note || 'check-in'}
      </div>
      <div style={{ marginTop: 8 }}>
        <button type="button" className="btn secondary" onClick={analyze} disabled={loading}>
          {loading ? 'Regenerating…' : `Regenerate (${lang})`}
        </button>
      </div>
    </div>
  );
}
