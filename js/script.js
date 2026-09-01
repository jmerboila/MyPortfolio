/* ============================================================================
   JAYSON MERCADO ERBOILA — PORTFOLIO SCRIPT
   ----------------------------------------------------------------------------
   ★ TO ADD OR EDIT A PROJECT, edit  js/projects.js  — not this file.
     Then run  node build.js  to regenerate the /work/ pages and sitemap.

   This file only renders the homepage gallery. PROJECTS and ICONS are
   defined in js/projects.js, which must be loaded BEFORE this script.
   ============================================================================ */

const ICON_PAUSE =
  '<svg width="11" height="12" viewBox="0 0 11 12" fill="currentColor" aria-hidden="true">' +
  '<rect x="0" y="0" width="3.6" height="12" rx="1"/><rect x="7.4" y="0" width="3.6" height="12" rx="1"/></svg>';
const ICON_PLAY =
  '<svg width="11" height="12" viewBox="0 0 11 12" fill="currentColor" aria-hidden="true">' +
  '<path d="M0 1.1v9.8a.5.5 0 0 0 .77.42l7.7-4.9a.5.5 0 0 0 0-.84L.77.68A.5.5 0 0 0 0 1.1z"/></svg>';

const ARROW_SVG =
  '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 11L11 3M11 3H5M11 3v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';


/* ============================================================================
   APP — runs once the DOM is ready
============================================================================ */
document.addEventListener('DOMContentLoaded', () => {

  /* ---- Render the gallery from the PROJECTS data ---- */
  const galleryGrid = document.getElementById('galleryGrid');
  const emptyEl     = document.getElementById('galleryEmpty');

  function buildCard(project, card_) {
    const card = document.createElement('article');
    card.className = 'project-card' + (card_.size ? ' ' + card_.size : '')
                   + (card_.ratio ? ' ratio-' + card_.ratio : '');
    // cat can be a single string ("logo") or an array (["logo","web"]).
    // Store them space-separated, e.g. data-cat="logo web".
    const cats = Array.isArray(project.cat) ? project.cat : [project.cat];
    card.dataset.cat = cats.join(' ');

    // Video, image, or placeholder — in that order of preference.
    // A card with a `video` plays it inline: muted, looping, and with
    // preload="none" and no src until it scrolls into view (see the observer
    // further down), so an off-screen card costs nothing.
    const media = card_.video
      ? `<video class="card-video"
                muted loop playsinline preload="none" tabindex="-1" aria-hidden="true"
                ${card_.videoPoster ? `poster="${card_.videoPoster}"` : ''}
                data-src="${card_.video}"></video>`
      : card_.image
      ? `<img src="${card_.image}" alt="${card_.title}" loading="lazy" />`
      : `<div class="placeholder-fill">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true">${ICONS[project.icon] || ICONS.logo}</svg>
           <span>${project.placeholderLabel || project.category}</span>
         </div>`;

    // The card IS a link. That is what makes each project crawlable,
    // shareable and openable in a new tab. Where a project defines several
    // cards, every one of them points at the same project page.
    card.innerHTML = `
      <a class="card-link" href="work/${project.slug}/" aria-label="View project: ${card_.title}">
        <div class="card-image">${media}</div>
        <div class="card-overlay">
          <span class="card-category">${project.category}</span>
          <h3 class="card-title">${card_.title}</h3>
          <p class="card-desc">${card_.desc}</p>
        </div>
        <div class="card-arrow">${ARROW_SVG}</div>
      </a>
      ${card_.video ? `
      <button class="card-video-toggle" type="button" data-video-toggle
              aria-label="Pause the ${card_.title} video">${ICON_PAUSE}</button>` : ''}
    `;

    return card;
  }

  /* A project normally yields one card. A project with a `cards` array
     yields one per entry — same project page, different media. That is how
     the Mustang campaign shows its carousel and its Reel side by side
     without duplicating the project itself. */
  function cardsFor(p) {
    if (Array.isArray(p.cards) && p.cards.length) {
      return p.cards.map(c => Object.assign({
        title: p.title, desc: p.desc, ratio: p.ratio, size: p.size
      }, c));
    }
    return [{
      title: p.title, desc: p.desc, ratio: p.ratio, size: p.size,
      image: p.image, video: p.video, videoPoster: p.videoPoster
    }];
  }

  // Insert every card before the empty-state element
  PROJECTS.forEach(p => cardsFor(p).forEach(c =>
    galleryGrid.insertBefore(buildCard(p, c), emptyEl)));

  const cards = Array.from(galleryGrid.querySelectorAll('.project-card'));


  /* ---- Gallery category filter ---- */
  const filterBtns = document.querySelectorAll('.filter-btn');

  // A tab that filters to nothing is a promise the gallery can't keep, so
  // hide it until there is work in that category. Adding a project with
  // cat: "social" makes the Social tab appear on its own.
  const presentCats = new Set(PROJECTS.flatMap(p => Array.isArray(p.cat) ? p.cat : [p.cat]));
  filterBtns.forEach(btn => {
    const f = btn.dataset.filter;
    if (f !== 'all' && !presentCats.has(f)) btn.hidden = true;
  });

  function applyFilter(filter) {
    let visibleCount = 0;
    cards.forEach(card => {
      // A card's data-cat may hold several space-separated categories.
      const cardCats = card.dataset.cat.split(' ');
      const match = filter === 'all' || cardCats.includes(filter);
      if (match) {
        card.style.display = '';
        // next frame so the transition runs
        requestAnimationFrame(() => card.classList.remove('is-hidden'));
        visibleCount++;
      } else {
        card.classList.add('is-hidden');
        setTimeout(() => {
          if (card.classList.contains('is-hidden')) card.style.display = 'none';
        }, 450);
      }
    });
    emptyEl.style.display = visibleCount === 0 ? 'block' : 'none';
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilter(btn.dataset.filter);
    });
  });


  /* ---- Theme toggle (remembers choice) ---- */
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme  = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next    = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });


  /* ---- Navbar background on scroll ---- */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });


  /* ---- Mobile nav (hamburger) ---- */
  const burger   = document.getElementById('navBurger');
  const navLinks = document.getElementById('navLinks');
  burger.addEventListener('click', () => {
    const open = burger.classList.toggle('open');
    navLinks.classList.toggle('open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  navLinks.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      burger.classList.remove('open');
      navLinks.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    })
  );


  /* ---- Card video (Reels etc.) ----
     Cards with a `video` play it inline, muted and looping. Two rules keep
     that from being expensive or annoying:
       1. Nothing is fetched until the card is actually on screen — the
          <video> ships with preload="none" and no src; the observer sets it.
       2. Off-screen cards pause, so a long gallery never runs six videos
          at once.
     Anyone who has asked for reduced motion keeps the poster frame instead. */
  const cardVideos = galleryGrid.querySelectorAll('.card-video');
  if (cardVideos.length) {
    const stillOnly = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (stillOnly) {
      // Leave the poster showing. Nothing loads, nothing moves — so the
      // pause control has nothing to control and is removed.
      cardVideos.forEach(v => v.removeAttribute('data-src'));
      galleryGrid.querySelectorAll('[data-video-toggle]').forEach(b => b.remove());
    } else {
      const vidObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const v = entry.target;
          // A visitor who pressed pause stays paused, even after scrolling
          // away and back. Their choice outranks the observer.
          if (v.dataset.userPaused === 'true') return;
          if (entry.isIntersecting) {
            if (v.dataset.src) {          // first time on screen: attach + load
              v.src = v.dataset.src;
              delete v.dataset.src;
            }
            const played = v.play();
            if (played && played.catch) played.catch(() => {});  // autoplay refused
          } else if (!v.paused) {
            v.pause();
          }
        });
      }, { threshold: 0.25 });

      cardVideos.forEach(v => vidObs.observe(v));

      /* WCAG 2.2.2 Pause, Stop, Hide — moving content that starts on its own
         and runs longer than five seconds must be stoppable. Each card with a
         video gets a real button for that. */
      galleryGrid.querySelectorAll('[data-video-toggle]').forEach(btn => {
        const v = btn.parentElement.querySelector('.card-video');
        if (!v) return;
        const label = btn.getAttribute('aria-label').replace(/^(Pause|Play) the /, '').replace(/ video$/, '');
        const sync = () => {
          const paused = v.paused;
          btn.innerHTML = paused ? ICON_PLAY : ICON_PAUSE;
          btn.setAttribute('aria-label', (paused ? 'Play the ' : 'Pause the ') + label + ' video');
        };
        btn.addEventListener('click', () => {
          if (v.paused) {
            delete v.dataset.userPaused;
            if (v.dataset.src) { v.src = v.dataset.src; delete v.dataset.src; }
            const pl = v.play();
            if (pl && pl.catch) pl.catch(() => {});
          } else {
            v.dataset.userPaused = 'true';
            v.pause();
          }
          sync();
        });
        v.addEventListener('play', sync);
        v.addEventListener('pause', sync);
        sync();
      });
    }
  }


  /* ---- Scroll reveal ---- */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));


  /* ---- Footer year (always current) ---- */
  const yearEl = document.getElementById('footerYear');
  if (yearEl) {
    yearEl.textContent = `© ${new Date().getFullYear()} Jayson Mercado Erboila. All rights reserved.`;
  }


  /* ---- Parallax hero + custom cursor ----
     Skipped entirely for touch devices and for users who prefer reduced motion. */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  if (!prefersReducedMotion) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      document.querySelectorAll('[data-depth]').forEach(el => {
        const depth = parseFloat(el.dataset.depth);
        el.style.transform = `translateY(${scrollY * depth}px)`;
      });
    }, { passive: true });
  }

  if (!prefersReducedMotion && !isTouch) {
    const dot  = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

    document.addEventListener('mousemove', e => {
      mouseX = e.clientX; mouseY = e.clientY;
      dot.style.left = mouseX + 'px';
      dot.style.top  = mouseY + 'px';
    });

    (function animRing() {
      ringX += (mouseX - ringX) * 0.14;
      ringY += (mouseY - ringY) * 0.14;
      ring.style.left = ringX + 'px';
      ring.style.top  = ringY + 'px';
      requestAnimationFrame(animRing);
    })();

    // Grow the ring over interactive elements (cards are added dynamically,
    // so we listen on the document and check the target)
    const isInteractive = el =>
      el.closest('a, button, .project-card, .filter-btn, .skill-tag');

    document.addEventListener('mouseover', e => {
      if (isInteractive(e.target)) ring.classList.add('hovered');
    });
    document.addEventListener('mouseout', e => {
      if (isInteractive(e.target)) ring.classList.remove('hovered');
    });
  } else {
    // Hide custom cursor elements entirely on touch / reduced-motion
    document.querySelectorAll('.cursor-dot, .cursor-ring').forEach(el => el.remove());
    document.body.style.cursor = 'auto';
  }

});
