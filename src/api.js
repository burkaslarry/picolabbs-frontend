// In dev, Vite proxies /api to backend. In production (e.g. Vercel), set VITE_API_URL to your backend (e.g. https://your-api.railway.app).
const API = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api';

/** Call backend /api/health; returns { ok: true } or throws. Use for header status and cron ping. */
export async function getHealth() {
  const res = await fetch(`${API}/health`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

export async function login(username, password) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

/** Turn backend error body into a short user-facing message. Avoid showing raw HTML or Node/SQLite errors. */
async function errorMessage(res) {
  const text = await res.text();
  if (typeof text === 'string' && (text.trimStart().startsWith('<!') || text.includes('SqliteError') || text.includes('readonly database'))) {
    return 'Backend error: make sure the Kotlin backend is running (run ./run-local.sh from the project root). Do not use the Node/SQLite backend.';
  }
  try {
    const j = JSON.parse(text);
    if (j && typeof j.error === 'string') return j.error;
  } catch (_) {}
  return text && text.length < 200 ? text : (res.statusText || 'Request failed');
}

export async function getLeads(params = {}) {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`${API}/leads${q ? '?' + q : ''}`);
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

export async function getLead(id) {
  const res = await fetch(`${API}/leads/${id}`);
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

export async function createLead(body) {
  const res = await fetch(`${API}/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

export async function updateLead(id, body) {
  const res = await fetch(`${API}/leads/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

export async function createInquiry(body) {
  const res = await fetch(`${API}/inquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

export async function getDraft(body) {
  const res = await fetch(`${API}/ai/draft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

export async function analyzeAiMessage(body) {
  const res = await fetch(`${API}/ai/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

export async function addSlots(leadId, slots) {
  const res = await fetch(`${API}/leads/${leadId}/slots`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slots }),
  });
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

export async function completeTask(leadId, taskId) {
  const res = await fetch(`${API}/leads/${leadId}/tasks/${taskId}/complete`, { method: 'POST' });
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

export async function getAutomationRules() {
  const res = await fetch(`${API}/automations/rules`);
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

export async function seedAutomationRules() {
  const res = await fetch(`${API}/automations/rules/seed`, { method: 'POST' });
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

export async function processScheduledJobs() {
  const res = await fetch(`${API}/automations/process-scheduled`, { method: 'POST' });
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

export async function getScheduledJobs(params = {}) {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`${API}/automations/scheduled-jobs${q ? '?' + q : ''}`);
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

// RAG: services & products (CSV import, search by region HK/TW/CN)
export async function getRagServices(region = null) {
  const q = region ? `?region=${encodeURIComponent(region)}` : '';
  const res = await fetch(`${API}/rag/services${q}`);
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

export async function getRagProducts(region = null) {
  const q = region ? `?region=${encodeURIComponent(region)}` : '';
  const res = await fetch(`${API}/rag/products${q}`);
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

export async function searchRagServices(region = null, q = null) {
  const params = new URLSearchParams();
  if (region) params.set('region', region);
  if (q) params.set('q', q);
  const res = await fetch(`${API}/rag/services/search?${params}`);
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

export async function searchRagProducts(region = null, q = null) {
  const params = new URLSearchParams();
  if (region) params.set('region', region);
  if (q) params.set('q', q);
  const res = await fetch(`${API}/rag/products/search?${params}`);
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

export async function importRagServicesCsv(file) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API}/rag/services/import`, { method: 'POST', body: form });
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

export async function importRagProductsCsv(file) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API}/rag/products/import`, { method: 'POST', body: form });
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

export async function importLeadsCsv(file) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API}/rag/import/leads`, { method: 'POST', body: form });
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

export async function importCasesCsv(file) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API}/rag/import/cases`, { method: 'POST', body: form });
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

export async function importRagPdf(file, region = 'hk') {
  const form = new FormData();
  form.append('file', file);
  const q = region ? `?region=${encodeURIComponent(region)}` : '';
  const res = await fetch(`${API}/rag/documents/import-pdf${q}`, { method: 'POST', body: form });
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

export async function getFollowUpCases() {
  const res = await fetch(`${API}/rag/follow-up-cases`);
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

export async function getImportedLeads() {
  const res = await fetch(`${API}/rag/imported-leads`);
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

export async function clearRagServices() {
  const res = await fetch(`${API}/rag/services`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

export async function clearRagProducts() {
  const res = await fetch(`${API}/rag/products`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

export async function createRagProduct(body) {
  const res = await fetch(`${API}/rag/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

export async function updateRagProduct(id, body) {
  const res = await fetch(`${API}/rag/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

export async function deleteRagProduct(id) {
  const res = await fetch(`${API}/rag/products/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

export async function updateRagCategory(oldName, newName) {
  const res = await fetch(`${API}/rag/categories`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ oldName, newName }),
  });
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

export async function deleteRagCategory(name) {
  const res = await fetch(`${API}/rag/categories/${encodeURIComponent(name)}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

// Users (superadmin, operator)
export async function getUsers() {
  const res = await fetch(`${API}/users`);
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

export async function createUser(body) {
  const res = await fetch(`${API}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

export async function updateUserRole(id, role) {
  const res = await fetch(`${API}/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}
