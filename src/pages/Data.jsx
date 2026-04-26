import { useState, useEffect } from 'react';
import { useLang } from '../LangContext';
import { t } from '../i18n';
import HkBranchesReference from '../components/HkBranchesReference';
import {
  getRagServices,
  getRagProducts,
  getBranches,
  getFollowUpCases,
  getImportedLeads,
  searchRagServices,
  searchRagProducts,
  importRagServicesCsv,
  importRagProductsCsv,
  importLeadsCsv,
  importCasesCsv,
  importRagPdf,
  clearRagServices,
  clearRagProducts,
} from '../api';

const REGIONS = [
  { id: 'hk', labelKey: 'data.regionHK' },
  { id: 'tw', labelKey: 'data.regionTW' },
  { id: 'cn', labelKey: 'data.regionCN' },
];

export default function Data() {
  const { lang } = useLang();
  const [region, setRegion] = useState('hk');
  const [keyword, setKeyword] = useState('');
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [leads, setLeads] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState({
    services: false,
    products: false,
    leads: false,
    cases: false,
    pdf: false,
  });
  const [result, setResult] = useState(null);
  const [pdfLinkage, setPdfLinkage] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      if (keyword.trim()) {
        const [s, p, b, ls, cs] = await Promise.all([
          searchRagServices(region, keyword.trim()),
          searchRagProducts(region, keyword.trim()),
          getBranches(region),
          getImportedLeads(),
          getFollowUpCases(),
        ]);
        setServices(s);
        setProducts(p);
        setBranches(b);
        setLeads(ls);
        setCases(cs);
      } else {
        const [s, p, b, ls, cs] = await Promise.all([
          getRagServices(region),
          getRagProducts(region),
          getBranches(region),
          getImportedLeads(),
          getFollowUpCases(),
        ]);
        setServices(s);
        setProducts(p);
        setBranches(b);
        setLeads(ls);
        setCases(cs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [region, keyword]);

  const handleImport = async (type, file) => {
    if (!file) return;
    setImporting((prev) => ({ ...prev, [type]: true }));
    setResult(null);
    try {
      const fn = type === 'services'
        ? importRagServicesCsv
        : type === 'products'
          ? importRagProductsCsv
          : type === 'leads'
            ? importLeadsCsv
            : importCasesCsv;
      const res = await fn(file);
      setResult(res);
      load();
    } catch (e) {
      setResult({ error: e.message });
    } finally {
      setImporting((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleImportPdf = async (file) => {
    if (!file) return;
    setImporting((prev) => ({ ...prev, pdf: true }));
    setPdfLinkage(null);
    setResult(null);
    try {
      const res = await importRagPdf(file, region);
      setPdfLinkage(res);
      setResult({ imported: 1 });
      load();
    } catch (e) {
      setResult({ error: e.message });
    } finally {
      setImporting((prev) => ({ ...prev, pdf: false }));
    }
  };

  const handleClear = async (type) => {
    if (!window.confirm(lang === 'zh' ? '確定清空？' : 'Clear all?')) return;
    try {
      if (type === 'services') await clearRagServices();
      else await clearRagProducts();
      load();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <h1 style={{ margin: 0, marginBottom: '0.5rem' }}>{t('data.title', lang)}</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        {t('data.intro', lang)}
      </p>

      {region === 'hk' && <HkBranchesReference lang={lang} branches={branches} />}

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem' }}>
          <label>
            <span style={{ marginRight: '0.5rem' }}>{t('data.region', lang)}:</span>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              style={{ padding: '0.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }}
            >
              {REGIONS.map((r) => (
                <option key={r.id} value={r.id}>{t(r.labelKey, lang)}</option>
              ))}
            </select>
          </label>
          <input
            type="text"
            placeholder={t('data.search', lang)}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ padding: '0.5rem', minWidth: 180, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }}
          />
        </div>

        {result && (
          <p style={{ color: result.error ? 'var(--danger)' : 'var(--success)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
            {result.error || (result.imported != null ? t('data.imported', lang, { n: result.imported }) : 'OK')}
          </p>
        )}

        <h3 style={{ margin: '1rem 0 0.5rem' }}>{t('data.services', lang)}</h3>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
          <a className="btn secondary" href="/samples/services-sample.csv" download>{t('data.sampleCsv', lang)}</a>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImport('services', f); e.target.value = ''; }}
            style={{ display: 'none' }}
            id="csv-services"
          />
          <label htmlFor="csv-services">
            <span className="btn secondary" style={{ cursor: 'pointer' }}>
              {importing.services ? '…' : t('data.importCsv', lang)}
            </span>
          </label>
          <button type="button" className="btn secondary" onClick={() => handleClear('services')}>
            {t('data.clearAll', lang)}
          </button>
        </div>
        <p style={{ marginTop: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t('data.csvFormatRag', lang)}</p>
        {loading ? <p>{t('inbox.loading', lang)}</p> : services.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>{t('data.noData', lang)}</p> : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: 200, overflow: 'auto' }}>
            {services.map((s) => (
              <li key={s.id} style={{ padding: '0.35rem 0', borderBottom: '1px solid var(--border)' }}>
                <strong>{s.name}</strong> <span className="badge" style={{ marginLeft: 8 }}>{s.region}</span>
                {s.description && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.description.slice(0, 100)}{s.description.length > 100 ? '…' : ''}</div>}
              </li>
            ))}
          </ul>
        )}

        <h3 style={{ margin: '1.5rem 0 0.5rem' }}>{t('data.products', lang)}</h3>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
          <a className="btn secondary" href="/samples/products-sample.csv" download>{t('data.sampleCsv', lang)}</a>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImport('products', f); e.target.value = ''; }}
            style={{ display: 'none' }}
            id="csv-products"
          />
          <label htmlFor="csv-products">
            <span className="btn secondary" style={{ cursor: 'pointer' }}>
              {importing.products ? '…' : t('data.importCsv', lang)}
            </span>
          </label>
          <button type="button" className="btn secondary" onClick={() => handleClear('products')}>
            {t('data.clearAll', lang)}
          </button>
        </div>
        <p style={{ marginTop: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t('data.csvFormatRag', lang)}</p>
        {loading ? null : products.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>{t('data.noData', lang)}</p> : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: 200, overflow: 'auto' }}>
            {products.map((p) => (
              <li key={p.id} style={{ padding: '0.35rem 0', borderBottom: '1px solid var(--border)' }}>
                <strong>{p.name}</strong> <span className="badge" style={{ marginLeft: 8 }}>{p.region}</span>
                {p.description && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{p.description.slice(0, 100)}{p.description.length > 100 ? '…' : ''}</div>}
              </li>
            ))}
          </ul>
        )}

        <h3 style={{ margin: '1.5rem 0 0.5rem' }}>{t('data.pdfLinkage', lang)}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 0 }}>{t('data.linkageHint', lang)}</p>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImportPdf(f); e.target.value = ''; }}
            style={{ display: 'none' }}
            id="pdf-rag"
          />
          <label htmlFor="pdf-rag">
            <span className="btn secondary" style={{ cursor: 'pointer' }}>
              {importing.pdf ? '…' : t('data.importPdf', lang)}
            </span>
          </label>
        </div>
        {pdfLinkage && (
          <div style={{ background: 'var(--surface-hover)', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1rem' }}>
            <p style={{ margin: '0 0 0.5rem' }}><strong>{t('data.linkedItems', lang)}:</strong> {pdfLinkage.matched_count || 0}</p>
            <p style={{ margin: '0 0 0.35rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('data.linkedServices', lang)}: {pdfLinkage.service_links || 0}</p>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('data.linkedProducts', lang)}: {pdfLinkage.product_links || 0}</p>
            {(pdfLinkage.matches || []).length > 0 ? (
              <ul style={{ margin: '0.75rem 0 0', paddingLeft: '1rem' }}>
                {pdfLinkage.matches.slice(0, 10).map((m, idx) => (
                  <li key={`${m.item_type}-${m.item_id || idx}`} style={{ marginBottom: '0.25rem' }}>
                    <span className="badge" style={{ marginRight: 8 }}>{m.item_type}</span>
                    {m.item_name}
                  </li>
                ))}
              </ul>
            ) : <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>{t('data.noLinks', lang)}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
