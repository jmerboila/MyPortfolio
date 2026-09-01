/* ============================================================================
   chrome-inject.js — the shared Devsign8 shell for JS-RENDERED pages
   ----------------------------------------------------------------------------
   DigiSkills.html and OrangeMagazine.html are React apps. React takes over the
   document body when it mounts, which wipes out any static markup placed there
   at build time — so the shared bar and footer have to be attached AFTER the
   app has rendered. That is what this file does.

   The four hand-written showcase pages don't need it: their markup is static,
   so the shell is baked straight into the HTML. This script is a no-op if a
   bar is already present, so it is safe to include anywhere.
   ========================================================================= */
(function () {
  'use strict';

  var LINKS = {
    linkedin: 'https://www.linkedin.com/in/jayson-erboila/',
    behance:  'https://www.behance.net/jaysonerboila',
    instagram:'https://www.instagram.com/hello.devsign8/'
  };

  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (html != null) n.innerHTML = html;
    return n;
  }

  /* ---- per-page WCAG contrast corrections -------------------------------
     These pages render their UI from JavaScript, so a <style> block in the
     source HTML is not reliable — React owns the document by the time it
     matters. Injecting the rules here guarantees they land. Only colours
     that carry TEXT are changed; artwork and imagery are untouched. */
  var A11Y_CSS = {
    'OrangeMagazine.html':
      /* white-on-#f56416 measured 3.13:1, the orange kicker 2.93:1 */
      '.btn-orange,.tag,.badge,.pill{background:#c64b09 !important}' +
      '.kick,.eyebrow,.cat,.label-orange{color:#bf4808 !important}'
  };

  function injectCss() {
    var page = location.pathname.split('/').pop();
    var css = A11Y_CSS[page];
    if (!css || document.getElementById('d8-a11y')) return;
    var st = document.createElement('style');
    st.id = 'd8-a11y';
    st.textContent = css;
    document.head.appendChild(st);
  }

  /* Labels and heading levels have to survive re-renders: React can replace
     these nodes at any point, taking the attributes with them. */
  function annotate() {
    var labels = { navlinks: 'Magazine sections', tabbar: 'Mobile navigation' };
    Array.prototype.forEach.call(document.querySelectorAll('nav'), function (n) {
      if (n.getAttribute('aria-label') || n.getAttribute('aria-labelledby')) return;
      var key = (n.className || '').split(/\s+/)[0];
      n.setAttribute('aria-label', labels[key] || 'Page navigation');
    });
    Array.prototype.forEach.call(document.querySelectorAll('h4:not([aria-level])'), function (h) {
      h.setAttribute('role', 'heading');
      h.setAttribute('aria-level', '3');
    });

    // Close a gap in the outline: if the page runs h1 straight to h3 with no
    // h2 between them, lift the h3s to level 2. Screen-reader users navigate
    // by heading level, and a skipped level reads as missing content.
    if (document.querySelector('h1') && !document.querySelector('h2') &&
        document.querySelector('h3:not([aria-level])')) {
      Array.prototype.forEach.call(document.querySelectorAll('h3:not([aria-level])'), function (h) {
        h.setAttribute('role', 'heading');
        h.setAttribute('aria-level', '2');
      });
    }
    var m = document.querySelector('main, [role="main"]');
    if (!m) {
      var root = document.getElementById('root') ||
                 document.querySelector('body > div:not(.d8-bar):not(.d8-foot)');
      if (root) root.setAttribute('role', 'main');
    }
  }

  function build() {
    injectCss();
    annotate();
    if (document.querySelector('.d8-bar')) return;   // bar already there

    // ---- skip link (WCAG 2.4.1) ----
    var skip = el('a', { class: 'd8-skip', href: '#main' }, 'Skip to main content');

    // ---- top bar ----
    var bar = el('header', { class: 'd8-bar' },
      '<a class="d8-bar__logo" href="index.html" aria-label="Jayson Mercado Erboila — home">' +
        '<img src="images/jmlogowhite.svg" alt="Jayson Mercado Erboila" />' +
      '</a>' +
      '<nav aria-label="Portfolio"><ul class="d8-bar__nav">' +
        '<li><a class="is-optional" href="index.html">Portfolio</a></li>' +
        '<li><a href="work/">All Work</a></li>' +
        '<li><a class="is-cta" href="index.html#contact">Let\'s Connect</a></li>' +
      '</ul></nav>');

    // ---- footer ----
    var foot = el('footer', { class: 'd8-foot' },
      '<p class="d8-foot__cta">Let\'s make <em>something great</em></p>' +
      '<p class="d8-foot__sub">Have a project in mind? Whether it\'s a brand, a product, ' +
        'or just an idea — I\'d love to hear about it.</p>' +
      '<div class="d8-foot__actions">' +
        '<a class="is-primary" href="mailto:jmerboila@gmail.com">Say Hello</a>' +
        '<a class="is-ghost" href="work/">See All Work</a>' +
      '</div>' +
      '<div class="d8-foot__base">' +
        '<a href="index.html" aria-label="Jayson Mercado Erboila — home">' +
          '<img src="images/jmlogowhite.svg" alt="Jayson Mercado Erboila" /></a>' +
        '<p class="d8-foot__copy">&copy; ' + new Date().getFullYear() +
          ' Jayson Mercado Erboila. All rights reserved.</p>' +
        '<div class="d8-foot__social">' +
          '<a href="' + LINKS.linkedin + '" target="_blank" rel="noopener">LinkedIn</a>' +
          '<a href="' + LINKS.behance + '" target="_blank" rel="noopener">Behance</a>' +
          '<a href="' + LINKS.instagram + '" target="_blank" rel="noopener">Instagram</a>' +
        '</div>' +
      '</div>');

    document.body.insertBefore(bar, document.body.firstChild);
    document.body.insertBefore(skip, bar);
    document.body.appendChild(foot);

    // ---- main landmark (WCAG 1.3.1) ----
    // The app's own root becomes the main landmark rather than being moved,
    // so React keeps the node it mounted on.
    if (!document.querySelector('main, [role="main"]')) {
      var root = document.getElementById('root') ||
                 document.querySelector('body > div:not(.d8-bar):not(.d8-foot)');
      if (root) { root.setAttribute('role', 'main'); root.id = root.id || 'main'; }
    }
    var m = document.querySelector('main, [role="main"]');
    if (m && !m.id) m.id = 'main';
    if (m && m.id !== 'main') skip.setAttribute('href', '#' + m.id);

  }

  // React mounts before window.load in these pages; run after it, then once
  // more on the next frame in case the app is still settling.
  if (document.readyState === 'complete') build();
  else window.addEventListener('load', build);
  window.addEventListener('load', function () { requestAnimationFrame(build); });

  /* Re-apply labels and heading levels whenever the app re-renders. Throttled
     to one pass per frame so a busy render loop can't turn this into a
     performance problem. */
  var queued = false;
  new MutationObserver(function () {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; annotate(); });
  }).observe(document.documentElement, { childList: true, subtree: true });

  /* Belt and braces: an app that finishes rendering in one synchronous pass
     can mount before the observer is watching, so nothing ever fires. Poll
     briefly at start-up to cover that, then stop — this is not a permanent
     timer. */
  var ticks = 0;
  var settle = setInterval(function () {
    annotate();
    if (++ticks > 20) clearInterval(settle);   // ~5s, then done
  }, 250);
})();
