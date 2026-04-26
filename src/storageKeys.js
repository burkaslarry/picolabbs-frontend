/** localStorage keys — single source of truth */
export const STORAGE_KEY_SERVICE_SCOPE = 'crm-service-scope';

/** PicoLabbs — default 服務範圍 (vertical ids) */
export const PICOLABBS_BUILTIN_VERTICAL_IDS = [
  'picolabbs_hardware_pain',
  'picolabbs_hardware_beauty',
  'picolabbs_supplements',
  'picolabbs_pet_care',
  'picolabbs_services',
];

/** Legacy demo verticals from the generic med-spa CRM */
const LEGACY_SCOPE_IDS = new Set([
  'med_spa',
  'training',
  'weight_loss_injection',
  'zomate_pt_1on1',
  'zomate_membership_trial',
  'zomate_nutrition',
  'picolabbs_pain_relief',
  'picolabbs_beauty_skin',
  'picolabbs_supplement',
]);

/** Legacy custom scope ids to drop on load (typo / retired slugs) */
export const REMOVED_SERVICE_SCOPE_IDS = ['moisture_mask'];

export function filterRemovedScopeIds(ids) {
  if (!Array.isArray(ids)) return [];
  const drop = new Set(REMOVED_SERVICE_SCOPE_IDS);
  return ids.filter((id) => typeof id === 'string' && id.length > 0 && !drop.has(id));
}

/**
 * If the stored scope still uses old ids, migrate to PicoLabbs defaults
 * so client demos match the configured verticals without clearing localStorage.
 */
export function migrateServiceScopeIds(parsed) {
  if (!Array.isArray(parsed) || parsed.length === 0) return null;
  const cleaned = filterRemovedScopeIds(parsed);
  if (cleaned.length === 0) return [...PICOLABBS_BUILTIN_VERTICAL_IDS];
  if (cleaned.some((id) => LEGACY_SCOPE_IDS.has(id))) {
    return [...PICOLABBS_BUILTIN_VERTICAL_IDS];
  }
  return cleaned;
}
