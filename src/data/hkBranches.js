// Branch rows are loaded from backend table `aicrm_picolabbs_branches`.

export function whatsappHref(digits) {
  const n = String(digits).replace(/\D/g, '');
  return n ? `https://wa.me/${n}` : null;
}
