/* ============================================================================
   JAYSON MERCADO ERBOILA — PORTFOLIO SCRIPT
   ----------------------------------------------------------------------------
   ★ TO ADD / EDIT A PROJECT: just edit the PROJECTS list directly below.
     Add a new object, and a new card appears automatically — no HTML needed.

   Each project supports these fields:
     cat              One category as a string ("logo"), OR several as an array
                        (["logo", "web"]). Must match a filter button's
                        data-filter value. Options: "logo" | "graphic" | "web" | "mobile"
     category         Label shown on the card (e.g. "Logo & Identity")
     title            Project name (card heading + modal heading)
     desc             Short one-liner shown on the card
     longDesc         Longer description shown in the pop-up modal
     tags             Array of tags, e.g. ["Branding", "Print"]
     image            Path to the SMALL preview image shown on the card,
                        e.g. "projects/lumino-thumb.jpg"
                        → leave as "" to show a placeholder icon instead
     imageFull        (optional) Path to the LARGE image shown in the pop-up modal,
                        e.g. "projects/lumino-full.jpg"
                        → if omitted, the modal reuses "image"
     icon             Placeholder icon when no image:
                        "logo" | "mobile" | "graphic" | "web" | "brand" | "campaign"
     placeholderLabel Small label under the placeholder icon
     size             ""  (normal) | "wide" (2 columns) | "tall" (2 rows)
     link             (optional) URL to the live project / case study. When set,
                        a "View Project" button appears in the modal and opens
                        it in a new tab. e.g. "https://behance.net/gallery/..."
     modalSize        (optional) "large" makes the pop-up modal wider with a
                        bigger image — good for flagship projects. Omit for normal.
   ============================================================================ */

const PROJECTS = [
  {
    cat: "logo",
    category: "Logo & Identity",
    title: "Devsign8",
    desc: "Infinite Creativity. Limitless Digital Solutions.",
    longDesc: "Devsign8 was built on one idea: limitless creativity. From websites and branding to digital marketing, we help businesses transform ideas into impactful digital experiences that inspire, connect, and grow.",
    tags: ["Logo Design", "Branding", "Wordmark"],
    image: "projects/Devsign8-Logo.png",
    imageFull: "projects/Devsign8-Logo-Full.png",
    icon: "logo",
    placeholderLabel: "Logo Design",
    link: "https://jmerboila.github.io/MyPortfolio/Devsign8-Showcase.html",
    modalSize: "",
    size: ""
  },
  {
    cat: ["web", "mobile"],
    category: "Web & Mobile Design",
    title: "Orange Magazine",
    desc: "A responsive editorial platform for pop culture.",
    longDesc: "A responsive editorial platform for pop culture — K-pop, music, film & TV, and the people shaping it. Desktop & mobile, light & dark, built on one bold orange system.",
    tags: ["Web Design", "UI", "Mobile"],
    image: "projects/OrangeMagazine-Preview.png",
    imageFull: "projects/OrangeMagazine-Full.png",
    icon: "web",
    placeholderLabel: "Web Design",
    link: "https://jmerboila.github.io/MyPortfolio/OrangeMagazine.html",
    modalSize: "large",
    size: "wide"
  },
  {
    cat: "logo",
    category: "Logo Design",
    title: "Orange Magazine Logo",
    desc: "A bold, geometric wordmark paired with a simple circular icon.",
    longDesc: "The Orange Magazine logo is a combination mark that pairs a bold, geometric wordmark with a simple, circular icon. The orange color reflects the brand's energy and creativity, while the clean lines convey modernity and clarity.",
    tags: ["Logo Design", "Hybrid", "Combination Mark"],
    image: "projects/OrangeMagazine-Logo-Black.svg",
    imageFull: "projects/OrangeMagazine-Logo-Full.png",
    icon: "brand",
    placeholderLabel: "Brand Identity",
    link: "https://jmerboila.github.io/MyPortfolio/OrangeMagazine-Showcase.html",
    size: ""
  },
  {
    cat: ["mobile", "UX"],
    category: "UI / UX Design",
    title: "DigiSkills",
    desc: "A free, offline digital-safety app that teaches kids 7–11 how to stay safe online — through play, not lectures.",
    longDesc: "DigiSkills — Be Safe Online is a free, offline-first mobile app that teaches children aged 7–11 how to stay safe on the internet through playful, audio-guided lessons. No ads, no data collection, no typing required.",
    tags: ["Mobile","UI Design", "UX Research"],
    image: "projects/DigiSkills-Preview.png",
    imageFull: "projects/DigiSkills-Full.png",
    icon: "mobile",
    placeholderLabel: "Mobile UI",
    modalSize: "large",
    size: "tall"
  },
  {
    cat: "logo",
    category: "Logo & Branding",
    title: "JM Design",
    desc: "The interlocking JM monogram is the heart of the identity",
    longDesc: "JM Design is the personal brand of Jayson Mercado Erboila — designer, developer and founder of the digital agency Devsign8.",
    tags: ["Logo Design", "Branding", "Monogram"],
    image: "projects/JMDesign-Preview.png",
    imageFull: "projects/JMDesign-Full.png",
    icon: "brand",
    placeholderLabel: "Brand Identity",
    link: "https://jmerboila.github.io/MyPortfolio/JM-Showcase.html",
    modalSize: "large",
    size: ""
  },
  {
    cat: "graphic",
    category: "Graphic Design",
    title: "NOVA Festival Campaign",
    desc: "Stage, social media kit & merchandise system",
    longDesc: "Full visual campaign for an independent music festival — including stage backdrops, social media kit, and merchandise design.",
    tags: ["Graphic Design", "Campaign", "Merch"],
    image: "",
    icon: "campaign",
    placeholderLabel: "Campaign Design",
    size: ""
  }
  // ★ Add a new project here — copy the block above, change the values.
];

/* Placeholder icons (inner SVG). Used only when a project has no image. */
const ICONS = {
  logo:     '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" stroke-linecap="round"/>',
  mobile:   '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 7h6M9 11h4M12 19h.01" stroke-linecap="round"/>',
  graphic:  '<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M9 21V9" stroke-linecap="round"/>',
  web:      '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 8h20M6 12h4M6 15h6" stroke-linecap="round"/>',
  brand:    '<path d="M12 2C8 2 4 6 4 10c0 5.5 8 12 8 12s8-6.5 8-12c0-4-4-8-8-8z"/><circle cx="12" cy="10" r="2.5"/>',
  campaign: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>'
};

const ARROW_SVG =
  '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 11L11 3M11 3H5M11 3v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';


/* ============================================================================
   APP — runs once the DOM is ready
============================================================================ */
document.addEventListener('DOMContentLoaded', () => {

  /* ---- Render the gallery from the PROJECTS data ---- */
  const galleryGrid = document.getElementById('galleryGrid');
  const emptyEl     = document.getElementById('galleryEmpty');

  function buildCard(project) {
    const card = document.createElement('article');
    card.className = 'project-card' + (project.size ? ' ' + project.size : '');
    // cat can be a single string ("logo") or an array (["logo","web"]).
    // Store them space-separated, e.g. data-cat="logo web".
    const cats = Array.isArray(project.cat) ? project.cat : [project.cat];
    card.dataset.cat = cats.join(' ');
    card.tabIndex = 0;                       // keyboard focusable
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', 'View project: ' + project.title);

    // Image OR placeholder
    const media = project.image
      ? `<img src="${project.image}" alt="${project.title}" loading="lazy" />`
      : `<div class="placeholder-fill">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true">${ICONS[project.icon] || ICONS.logo}</svg>
           <span>${project.placeholderLabel || project.category}</span>
         </div>`;

    card.innerHTML = `
      <div class="card-image">${media}</div>
      <div class="card-overlay">
        <span class="card-category">${project.category}</span>
        <h3 class="card-title">${project.title}</h3>
        <p class="card-desc">${project.desc}</p>
      </div>
      <div class="card-arrow">${ARROW_SVG}</div>
    `;

    // Open the modal on click or keyboard (Enter / Space)
    card.addEventListener('click', () => openModal(project));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(project);
      }
    });

    return card;
  }

  // Insert every card before the empty-state element
  PROJECTS.forEach(p => galleryGrid.insertBefore(buildCard(p), emptyEl));

  const cards = Array.from(galleryGrid.querySelectorAll('.project-card'));


  /* ---- Gallery category filter ---- */
  const filterBtns = document.querySelectorAll('.filter-btn');

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


  /* ---- Project modal / lightbox ---- */
  const overlay    = document.getElementById('modalOverlay');
  const modalClose = document.getElementById('modalClose');
  const modalImg   = document.getElementById('modalImg');
  const modalCat   = document.getElementById('modalCat');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc  = document.getElementById('modalDesc');
  const modalTags  = document.getElementById('modalTags');
  const modalLink  = document.getElementById('modalLink');
  let lastFocused  = null;

  function openModal(project) {
    // Optional larger modal layout for flagship projects (modalSize: "large")
    overlay.classList.toggle('size-large', project.modalSize === 'large');

    // Use the large image (imageFull) in the modal if provided,
    // otherwise fall back to the card image. Either one works.
    const modalSrc = project.imageFull || project.image;
    if (modalSrc) {
      modalImg.src = modalSrc;
      modalImg.alt = project.title;
      modalImg.style.display = 'block';
    } else {
      modalImg.removeAttribute('src');
      modalImg.style.display = 'none';
    }
    modalCat.textContent   = project.category;
    modalTitle.textContent = project.title;
    modalDesc.textContent  = project.longDesc || project.desc;

    modalTags.innerHTML = '';
    (project.tags || []).forEach(tag => {
      const span = document.createElement('span');
      span.className = 'modal-tag';
      span.textContent = tag;
      modalTags.appendChild(span);
    });

    // Show the "View Project" button only if this project has a link
    if (project.link) {
      modalLink.href = project.link;
      modalLink.style.display = 'inline-flex';
    } else {
      modalLink.removeAttribute('href');
      modalLink.style.display = 'none';
    }

    lastFocused = document.activeElement;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    modalClose.focus();                       // move focus into the modal
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();     // restore focus
  }

  modalClose.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
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
