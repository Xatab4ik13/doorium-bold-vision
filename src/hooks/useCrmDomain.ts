/**
 * Detects if the app is running on the CRM subdomain (crm.doorium.ru)
 * When true, only login + dashboard routes should be shown (no marketing site).
 */
export function isCrmDomain(): boolean {
  const host = window.location.hostname;
  return host.startsWith("crm.");
}
