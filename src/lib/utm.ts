/* ============================================================================
   utm.ts: tag links that leave the portfolio for a site Jayson measures.
   ----------------------------------------------------------------------------
   Added 2026-09-28. devsign8.com runs GA4 through GTM, so a visit that
   arrives from here should say so. These three parameters are the whole
   convention: GA4 then reports it as source "portfolio", medium "referral",
   campaign "jm_portfolio". `content` names the spot on the page the click
   came from (e.g. "stage-build", "project-header"), so the report can tell
   which link earns the visits.
   ========================================================================= */
export function withUtm(url: string, content: string): string {
  const u = new URL(url);
  u.searchParams.set('utm_source', 'portfolio');
  u.searchParams.set('utm_medium', 'referral');
  u.searchParams.set('utm_campaign', 'jm_portfolio');
  u.searchParams.set('utm_content', content);
  return u.toString();
}
