/**
 * Serverless function for Vercel Cron: pings the backend /api/health once per day
 * to keep the service warm or record health. Set VITE_API_URL in Vercel env.
 */
export default async function handler(req, res) {
  const base = (process.env.VITE_API_URL || '').replace(/\/$/, '');
  if (!base) {
    res.status(500).json({ error: 'VITE_API_URL not set' });
    return;
  }
  try {
    const r = await fetch(`${base}/api/health`, { method: 'GET' });
    const ok = r.ok;
    const body = await r.json().catch(() => ({}));
    res.status(ok ? 200 : 502).json({ ok, backend: body });
  } catch (e) {
    res.status(502).json({ ok: false, error: e.message });
  }
}
