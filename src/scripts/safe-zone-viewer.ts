/* safe-zone-viewer.ts: switch the SafeZoneViewer's format (click, or the
   arrow keys inside the radio group, with a roving tabindex). The markup
   already holds every format's SVG and data; this only shows one and copies
   its facts into the caption, which is an aria-live region. */
export function initSafeZoneViewer(): void {
  for (const root of document.querySelectorAll<HTMLElement>('[data-szv]')) {
    if (root.dataset.szvReady) continue;
    root.dataset.szvReady = '1';
    const options = [...root.querySelectorAll<HTMLButtonElement>('[data-szv-id]')];
    const svgs = [...root.querySelectorAll<SVGElement>('[data-szv-format]')];
    const field = (name: string) => root.querySelector<HTMLElement>(`[data-szv-${name}]`);

    const select = (btn: HTMLButtonElement, focus = false) => {
      for (const o of options) {
        const on = o === btn;
        o.setAttribute('aria-checked', String(on));
        o.tabIndex = on ? 0 : -1;
      }
      for (const svg of svgs) svg.toggleAttribute('data-szv-hidden', svg.dataset.szvFormat !== btn.dataset.szvId);
      for (const key of ['name', 'canvas', 'safe', 'clear', 'note']) {
        const el = field(key);
        if (el) el.textContent = btn.dataset[key] ?? '';
      }
      if (focus) btn.focus();
    };

    for (const o of options) {
      o.addEventListener('click', () => select(o));
      o.addEventListener('keydown', (e) => {
        const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (e.key === 'Home' || e.key === 'End' || step) {
          e.preventDefault();
          const i = options.indexOf(o);
          const next = e.key === 'Home' ? 0 : e.key === 'End' ? options.length - 1 : (i + (step ?? 0) + options.length) % options.length;
          select(options[next], true);
        }
      });
    }
  }
}
