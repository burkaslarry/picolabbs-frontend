/**
 * Mirrors backend ContactKey.normalize — same grouping for 「熟客」摘要統計。
 */
export function contactKeyNormalize(raw) {
  if (raw == null || typeof raw !== 'string') return null;
  const t = raw.trim();
  if (!t) return null;
  if (t.includes('@')) return t.toLowerCase();
  const digits = t.replace(/\D/g, '');
  if (digits.length >= 8) return digits;
  return t.toLowerCase().replace(/\s+/g, ' ');
}

/** Fallback when contact missing — one key per lead so we don’t merge unrelated rows. */
export function contactGroupKey(lead) {
  return contactKeyNormalize(lead?.contact) || `id:${lead?.id ?? ''}`;
}
