/* ============================================================================
   track.ts: conversion clicks into the GTM dataLayer.
   ----------------------------------------------------------------------------
   Added 2026-09-28 (marketing audit). The booking link leaves for cal.com, so
   GA4 never saw a conversion. Every click on a Cal.com link now pushes
   `book_call_click`, and every "Visit devsign8.com" link (data-cta="visit")
   pushes `visit_site_click`, each with `cta_location` from the link's
   data-cta ("header", "contact", "visit"; "other" when a link has none).
   (The round-1 `hiring_click` went with the LinkedIn line he removed.)

   One delegated listener on the document, so links added later (work pages,
   new CTAs) are covered without touching this file. Runs whatever the motion
   preference; it is not part of v3-motion.ts on purpose.

   GTM side (done in the GTM UI, not here): a Custom Event trigger per event
   name, a GA4 Event tag forwarding `cta_location`, and both marked as key
   events in GA4. Confirmed bookings need Cal.com's own GTM app
   (bookingSuccessfulV2); a click is intent, not a booking.
   ========================================================================= */

type DataLayer = Array<Record<string, unknown>>;

function push(event: string, link: HTMLAnchorElement): void {
  const w = window as unknown as { dataLayer?: DataLayer };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({
    event,
    cta_location: link.dataset.cta ?? 'other',
    link_url: link.href,
  });
}

document.addEventListener('click', (e) => {
  const link = (e.target as Element | null)?.closest?.('a[href]');
  if (!(link instanceof HTMLAnchorElement)) return;
  if (link.hostname === 'cal.com' || link.hostname.endsWith('.cal.com')) {
    push('book_call_click', link);
  } else if (link.dataset.cta === 'visit') {
    push('visit_site_click', link);
  }
});
