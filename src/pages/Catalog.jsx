import { useState, useEffect } from 'react';
import { useLang } from '../LangContext';
import { t } from '../i18n';
import {
  getRagProducts,
  getRagCategories,
  createRagProduct,
  updateRagProduct,
  deleteRagProduct,
  updateRagCategory,
  deleteRagCategory,
  importRagProductsCsv
} from '../api';

export default function Catalog() {
  const { lang } = useLang();
  const [products, setProducts] = useState([]);
  const [categoriesMeta, setCategoriesMeta] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [importing, setImporting] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // The product currently being edited/added
  const [categoryModal, setCategoryModal] = useState(null); // { mode: 'edit'|'add', oldName?: '' }

  const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api';

  const load = async () => {
    setLoading(true);
    try {
      const [data, categoriesData] = await Promise.all([getRagProducts(), getRagCategories()]);
      setProducts(data);
      setCategoriesMeta(categoriesData || []);
      if (data.length > 0 && !activeCategory) {
        const cats = [...new Set(data.map(p => p.category || 'Uncategorized'))];
        if (cats.length > 0) setActiveCategory(cats[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const categoryDisplayName = (slug) => {
    if (!slug || slug === 'Uncategorized') return 'Uncategorized';
    const fromMeta = categoriesMeta.find((c) => c.code === slug)?.display_name;
    if (fromMeta && fromMeta.trim()) return fromMeta.trim();
    const translated = t(`vertical.${slug}`, lang);
    return translated.startsWith('vertical.') ? slug : translated;
  };

  const categories = [...new Set([
    ...products.map(p => p.category || 'Uncategorized'),
    ...categoriesMeta.map((c) => c.code).filter(Boolean),
  ])];
  const displayedProducts = products.filter(p => (p.category || 'Uncategorized') === activeCategory);

  const handleImport = async (file) => {
    if (!file) return;
    setImporting(true);
    try {
      await importRagProductsCsv(file);
      alert(lang === 'zh' ? '匯入成功！' : 'Import successful!');
      load();
    } catch (e) {
      alert((lang === 'zh' ? '匯入失敗: ' : 'Import failed: ') + e.message);
    } finally {
      setImporting(false);
    }
  };

  const handleExport = () => {
    window.open(`${API_URL}/rag/products/export`, '_blank');
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingItem.id === 'new') {
        await createRagProduct({
          name: editingItem.name,
          description: editingItem.description,
          region: editingItem.region,
          category: editingItem.category === 'Uncategorized' ? null : editingItem.category
        });
      } else {
        await updateRagProduct(editingItem.id, {
          name: editingItem.name,
          description: editingItem.description,
          region: editingItem.region,
          category: editingItem.category === 'Uncategorized' ? null : editingItem.category
        });
      }
      setEditingItem(null);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm(lang === 'zh' ? '確定刪除產品？' : 'Delete product?')) return;
    try {
      await deleteRagProduct(id);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const saveCategory = async (e) => {
    e.preventDefault();
    const newName = e.target.newName.value.trim();
    const displayName = e.target.displayName.value.trim();
    if (!newName) return;
    try {
      if (categoryModal.mode === 'edit') {
        await updateRagCategory({ oldCode: categoryModal.oldName, code: newName, displayName });
        if (activeCategory === categoryModal.oldName) setActiveCategory(newName);
      } else {
        await updateRagCategory({ code: newName, displayName });
        setActiveCategory(newName);
      }
      setCategoryModal(null);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteCategory = async (name) => {
    if (!window.confirm(lang === 'zh' ? `確定刪除類別 [${name}] 及底下所有產品？` : `Delete category [${name}] and ALL its products?`)) return;
    try {
      if (name !== 'Uncategorized') {
        await deleteRagCategory(name);
      }
      setActiveCategory('');
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h1 style={{ margin: 0 }}>{t('catalog.title', lang)}</h1>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button className="btn secondary" onClick={handleExport}>
            {t('catalog.exportCsv', lang)}
          </button>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImport(f); e.target.value = ''; }}
            style={{ display: 'none' }}
            id="csv-catalog"
          />
          <label htmlFor="csv-catalog">
            <span className="btn secondary" style={{ cursor: 'pointer' }}>
              {importing ? '…' : t('catalog.importCsv', lang)}
            </span>
          </label>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
        {/* Categories Sidebar */}
        <div className="card" style={{ width: 240, flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>{t('catalog.categories', lang)}</h3>
            <button className="btn secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }} onClick={() => setCategoryModal({ mode: 'add' })}>
              +
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {categories.map(cat => (
              <div 
                key={cat} 
                style={{ 
                  padding: '0.5rem 0.75rem', 
                  borderRadius: 6, 
                  cursor: 'pointer',
                  background: activeCategory === cat ? 'var(--brand)' : 'transparent',
                  color: activeCategory === cat ? 'white' : 'var(--text)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onClick={() => setActiveCategory(cat)}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{categoryDisplayName(cat)}</span>
                {activeCategory === cat && cat !== 'Uncategorized' && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <span style={{ fontSize: '0.8rem', cursor: 'pointer', opacity: 0.8 }} onClick={(e) => { e.stopPropagation(); setCategoryModal({ mode: 'edit', oldName: cat }); }}>✏️</span>
                    <span style={{ fontSize: '0.8rem', cursor: 'pointer', opacity: 0.8 }} onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat); }}>🗑️</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Products Table */}
        <div className="card" style={{ flexGrow: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>{categoryDisplayName(activeCategory)} {t('catalog.products', lang)}</h3>
            <button className="btn" onClick={() => setEditingItem({ id: 'new', name: '', description: '', region: 'hk', category: activeCategory })}>
              {t('catalog.addProduct', lang)}
            </button>
          </div>

          {loading ? <p>{t('inbox.loading', lang)}</p> : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>{t('catalog.name', lang)}</th>
                    <th>{t('catalog.desc', lang)}</th>
                    <th>{t('catalog.region', lang)}</th>
                    <th style={{ width: 80 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {displayedProducts.map(p => (
                    <tr key={p.id}>
                      <td><strong>{p.name}</strong></td>
                      <td><div style={{ maxHeight: 60, overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{p.description || '—'}</div></td>
                      <td><span className="badge">{p.region}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }} onClick={() => setEditingItem(p)}>✏️</button>
                          <button className="btn secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', color: 'var(--danger)' }} onClick={() => handleDeleteProduct(p.id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {displayedProducts.length === 0 && (
                    <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{t('data.noData', lang)}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Product Edit/Add Modal */}
      {editingItem && (
        <div className="modal-overlay" onClick={() => setEditingItem(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 500 }}>
            <h3>{editingItem.id === 'new' ? t('catalog.addProduct', lang) : t('catalog.editProduct', lang)}</h3>
            <form onSubmit={saveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <label>
                <div style={{ marginBottom: 4, fontSize: '0.9rem' }}>{t('catalog.name', lang)} *</div>
                <input required type="text" value={editingItem.name} onChange={e => setEditingItem({...editingItem, name: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface-hover)', color: 'var(--text)' }} />
              </label>
              <label>
                <div style={{ marginBottom: 4, fontSize: '0.9rem' }}>{t('catalog.desc', lang)}</div>
                <textarea rows={4} value={editingItem.description || ''} onChange={e => setEditingItem({...editingItem, description: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface-hover)', color: 'var(--text)' }} />
              </label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <label style={{ flex: 1 }}>
                  <div style={{ marginBottom: 4, fontSize: '0.9rem' }}>{t('catalog.region', lang)}</div>
                  <select value={editingItem.region} onChange={e => setEditingItem({...editingItem, region: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface-hover)', color: 'var(--text)' }}>
                    <option value="hk">Hong Kong</option>
                    <option value="tw">Taiwan</option>
                    <option value="cn">China</option>
                  </select>
                </label>
                <label style={{ flex: 1 }}>
                  <div style={{ marginBottom: 4, fontSize: '0.9rem' }}>{t('catalog.categoryName', lang)}</div>
                  <input type="text" value={editingItem.category || ''} onChange={e => setEditingItem({...editingItem, category: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface-hover)', color: 'var(--text)' }} />
                </label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn secondary" onClick={() => setEditingItem(null)}>{t('leadDetail.cancel', lang)}</button>
                <button type="submit" className="btn">{t('profile.save', lang)}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Edit/Add Modal */}
      {categoryModal && (
        <div className="modal-overlay" onClick={() => setCategoryModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 400 }}>
            <h3>{categoryModal.mode === 'add' ? t('catalog.addCategory', lang) : t('catalog.editCategory', lang)}</h3>
            <form onSubmit={saveCategory} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <label>
                <div style={{ marginBottom: 4, fontSize: '0.9rem' }}>{t('catalog.categoryName', lang)} *</div>
                <input required type="text" name="newName" defaultValue={categoryModal.oldName || ''} style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface-hover)', color: 'var(--text)' }} />
              </label>
              <label>
                <div style={{ marginBottom: 4, fontSize: '0.9rem' }}>{t('catalog.displayName', lang)} *</div>
                <input
                  required
                  type="text"
                  name="displayName"
                  defaultValue={categoryModal.mode === 'edit'
                    ? categoryDisplayName(categoryModal.oldName)
                    : ''}
                  placeholder={t('catalog.displayNamePlaceholder', lang)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface-hover)', color: 'var(--text)' }}
                />
              </label>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn secondary" onClick={() => setCategoryModal(null)}>{t('leadDetail.cancel', lang)}</button>
                <button type="submit" className="btn">{t('profile.save', lang)}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}