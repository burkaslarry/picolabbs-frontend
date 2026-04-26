import { useState, useEffect } from 'react';
import { useLang } from '../LangContext';
import { t } from '../i18n';
import { getAutomationRules, seedAutomationRules, processScheduledJobs, getScheduledJobs } from '../api';

const RULE_DESCRIPTION_KEYS = {
  'rule-whatsapp-inquiry': 'ruleWhatsappInquiry',
  'rule-shopline-paid': 'ruleShoplinePaid',
  'rule-missing-info': 'ruleMissingInfo',
};

export default function Automations() {
  const { lang } = useLang();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processResult, setProcessResult] = useState(null);
  const [scheduledJobs, setScheduledJobs] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAutomationRules();
      setRules(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadScheduled = async () => {
    try {
      const list = await getScheduledJobs({ status: 'pending' });
      setScheduledJobs(list);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
    loadScheduled();
  }, []);

  useEffect(() => {
    if (processResult && !processResult.error) loadScheduled();
  }, [processResult]);

  const runProcessScheduled = async () => {
    setProcessing(true);
    setProcessResult(null);
    try {
      const result = await processScheduledJobs();
      setProcessResult(result);
      loadScheduled();
    } catch (e) {
      setProcessResult({ error: e.message });
    } finally {
      setProcessing(false);
    }
  };

  const seed = async () => {
    setSeeding(true);
    try {
      const data = await seedAutomationRules();
      setRules(data);
    } catch (e) {
      console.error(e);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h1 style={{ margin: 0 }}>{t('automations.title', lang)}</h1>
        <button className="btn" onClick={seed} disabled={seeding}>
          {seeding ? t('automations.seeding', lang) : t('automations.seedRules', lang)}
        </button>
      </div>

      <div className="auto-intro">
        <h2>{t('automations.introTitle', lang)}</h2>
        <p>{t('automations.introBody', lang)}</p>
      </div>

      <div className="auto-section">
        <h3>{t('automations.sectionRules', lang)}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
          {t('automations.sectionRulesHint', lang)}
        </p>
        {rules.length > 0 ? (
          <div style={{ marginBottom: '0.5rem' }}>
            {rules.map((r) => (
              <div key={r.id} className="auto-rule-card">
                <div className="name">{r.name}</div>
                <div className="does">
                  {RULE_DESCRIPTION_KEYS[r.id]
                    ? t(`automations.${RULE_DESCRIPTION_KEYS[r.id]}`, lang)
                    : (r.name)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
            {t('automations.noRules', lang)}
          </p>
        )}
      </div>

      <div className="auto-section card" style={{ padding: '1rem' }}>
        <h3 style={{ margin: '0 0 0.5rem' }}>{t('automations.scheduled', lang)}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
          {t('automations.scheduledHint', lang)}
        </p>
        <button className="btn" onClick={runProcessScheduled} disabled={processing}>
          {processing ? t('automations.processing', lang) : t('automations.processDue', lang)}
        </button>
        {processResult && (
          <p style={{ marginTop: '0.75rem', marginBottom: 0 }}>
            {processResult.error ? (
              <span style={{ color: 'var(--danger)' }}>{processResult.error}</span>
            ) : (
              <span style={{ color: 'var(--success)' }}>{t('automations.processed', lang, { n: processResult.processed })}</span>
            )}
          </p>
        )}
        {scheduledJobs.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <strong>{t('automations.pending', lang)} ({scheduledJobs.length})</strong>
            <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {scheduledJobs.slice(0, 10).map((j) => (
                <li key={j.id}>{j.job_type} — {j.run_at}</li>
              ))}
              {scheduledJobs.length > 10 && <li>… +{scheduledJobs.length - 10} more</li>}
            </ul>
          </div>
        )}
      </div>

      <div className="auto-section card" style={{ padding: '1rem', marginTop: '1rem' }}>
        <h3 style={{ margin: '0 0 0.5rem' }}>{t('automations.sectionTemplates', lang)}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
          {t('automations.templatesHint', lang)}
        </p>
      </div>

      {rules.length > 0 && (
        <details style={{ marginTop: '1.5rem' }}>
          <summary style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {lang === 'zh' ? '查看規則技術詳情' : 'View rule details (technical)'}
          </summary>
          <div className="card" style={{ marginTop: '0.5rem' }}>
            <table>
              <thead>
                <tr>
                  <th>{t('automations.tableName', lang)}</th>
                  <th>{t('automations.tableTrigger', lang)}</th>
                  <th>{t('automations.tableActions', lang)}</th>
                  <th>{t('automations.tableEnabled', lang)}</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((r) => (
                  <tr key={r.id}>
                    <td><strong>{r.name}</strong></td>
                    <td><code style={{ fontSize: '0.8rem' }}>{r.trigger_condition}</code></td>
                    <td><code style={{ fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>{r.actions}</code></td>
                    <td>{r.enabled ? (lang === 'zh' ? '開啟' : 'Yes') : (lang === 'zh' ? '關閉' : 'No')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </div>
  );
}