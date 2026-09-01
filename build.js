#!/usr/bin/env node
/* ============================================================================
   build.js — generates real HTML pages from js/projects.js
   ----------------------------------------------------------------------------
   WHY THIS EXISTS
   The homepage gallery is built by JavaScript in the browser. Google's
   crawler, LinkedIn's link preview and Facebook's scraper often do not run
   that JavaScript — so before this script existed, they all saw an empty
   portfolio. This generates a real, static HTML page per project so the work
   is readable without JavaScript, shareable as its own URL, and indexable.

   RUN IT:      node build.js
   RUN IT WHEN: you change js/projects.js (add a project, change an image,
                write a case study). Then commit both the data and the
                generated /work/ pages.
   ========================================================================= */

const fs   = require('fs');
const path = require('path');
const { PROJECTS, ICONS } = require('./js/projects.js');

const SITE = 'https://jmerboila.github.io/MyPortfolio';
const AUTHOR = 'Jayson Mercado Erboila';

/* -- helpers ------------------------------------------------------------- */
const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

// Strip tags/entities and clamp, for <meta description>
const meta = (s, n = 155) => {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  return esc(t.length > n ? t.slice(0, n - 1).replace(/[\s,;:.\-]+$/, '') + '…' : t);
};

const cats = p => Array.isArray(p.cat) ? p.cat : [p.cat];
const has  = v => Array.isArray(v) ? v.length > 0 : !!(v && String(v).trim());
const shortName = p => p.shortTitle || p.title;

/* One definition list, used for BOTH the project meta strip and the motion
   section's credits. Sharing the renderer is what keeps them identical —
   restyle `.cs-meta` once and every instance follows. Rows with no value are
   dropped, and an empty set renders nothing at all rather than a bare rule. */
function metaList(rows, cls = '') {
  const kept = rows.filter(([, v]) => has(v));
  if (!kept.length) return '';
  return `<dl class="cs-meta${cls ? ' ' + cls : ''}">
      ${kept.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(Array.isArray(v) ? v.join(', ') : v)}</dd></div>`).join('\n      ')}
    </dl>`;
}

/* -- shared chrome ------------------------------------------------------- */
function head({ title, description, canonical, image, root, jsonld }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="description" content="${description}" />
  <meta name="author" content="${AUTHOR}" />
  <link rel="canonical" href="${esc(canonical)}" />

  <meta property="og:type" content="article" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${esc(canonical)}" />
  <meta property="og:image" content="${esc(image)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${esc(image)}" />

  <script type="application/ld+json">
${JSON.stringify(jsonld, null, 2)}
  </script>

  <link rel="icon" type="image/svg+xml" href="${root}images/favicon.svg" />
  <link rel="icon" type="image/png" sizes="32x32" href="${root}images/favicon-32x32.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="${root}images/apple-touch-icon.png" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Syne:wght@400;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="${root}css/style.css" />
  <link rel="stylesheet" href="${root}css/work.css" />

  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-TSQXJVC5');</script>

  <script>
    // Apply the saved theme before first paint, so pages don't flash.
    try { document.documentElement.setAttribute('data-theme',
      localStorage.getItem('theme') || 'dark'); } catch (e) {}
  </script>
</head>
<body class="work-page">
<a class="skip-link" href="#main">Skip to main content</a>
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TSQXJVC5"
  height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`;
}

function nav(root) {
  return `
  <nav id="navbar" class="scrolled" aria-label="Main">
    <a href="${root}" class="nav-logo" aria-label="Home">
      <img class="logo-dark"  src="${root}images/jmlogowhite.svg" alt="${AUTHOR} logo" />
      <img class="logo-light" src="${root}images/jmlogoblack.svg" alt="${AUTHOR} logo" />
    </a>
    <ul class="nav-links" id="navLinks">
      <li><a href="${root}#about">About</a></li>
      <li><a href="${root}work/">Works</a></li>
      <li><a href="${root}#contact">Let's Connect!</a></li>
      <li>
        <button class="theme-toggle" id="themeToggle" aria-label="Toggle light and dark theme">
          <svg class="icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
          </svg>
          <svg class="icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>
      </li>
    </ul>
    <button class="nav-burger" id="navBurger" aria-label="Open menu" aria-expanded="false" aria-controls="navLinks">
      <span></span><span></span><span></span>
    </button>
  </nav>`;
}

function foot(root) {
  return `
  <footer>
    <a href="${root}" class="footer-logo" aria-label="Home">
      <img class="logo-dark"  src="${root}images/jmlogowhite.svg" alt="${AUTHOR} logo" />
      <img class="logo-light" src="${root}images/jmlogoblack.svg" alt="${AUTHOR} logo" />
    </a>
    <p class="footer-copy">&copy; ${new Date().getFullYear()} ${AUTHOR}. All rights reserved.</p>
    <div class="footer-socials">
      <a href="https://www.linkedin.com/in/jayson-erboila/" target="_blank" rel="noopener">LinkedIn</a>
      <a href="https://www.behance.net/jaysonerboila" target="_blank" rel="noopener">Behance</a>
      <a href="https://www.instagram.com/hello.devsign8/" target="_blank" rel="noopener">Instagram</a>
    </div>
  </footer>
  <script src="${root}js/site.js" defer></script>
</body>
</html>`;
}

function mediaFor(p, root, cls) {
  const src = p.imageFull || p.image;
  if (src) {
    return `<img src="${root}${esc(src)}" alt="${esc(p.title)}" class="${cls}" />`;
  }
  return `<div class="placeholder-fill ${cls}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true">${ICONS[p.icon] || ICONS.logo}</svg>
        <span>${esc(p.placeholderLabel || p.category)}</span>
      </div>`;
}

/* -- one project page ---------------------------------------------------- */
function projectPage(p, prev, next) {
  const root = '../../';
  const url  = `${SITE}/work/${p.slug}/`;
  const img  = p.imageFull || p.image;
  const ogImage = img ? `${SITE}/${img}` : `${SITE}/images/og-preview.jpg`;

  // Category is already the eyebrow above the title, so it is not repeated
  // here. If none of these are filled in yet, the whole block is omitted
  // rather than rendering a lonely half-empty strip.
  const metaBlock = metaList([
    ['Role',   p.role],
    ['Client', p.client],
    ['Year',   p.year],
    ['Tools',  p.tools]
  ]);

  const section = (label, title, body) => !has(body) ? '' : `
      <section class="cs-block">
        <p class="cs-label">${label}</p>
        <h2 class="cs-heading">${title}</h2>
        ${String(body).split(/\n\s*\n/).map(par => `<p class="cs-text">${esc(par.trim())}</p>`).join('\n        ')}
      </section>`;

  const constraints = !has(p.constraints) ? '' : `
      <section class="cs-block">
        <p class="cs-label">Constraints</p>
        <h2 class="cs-heading">Designed <em>within</em></h2>
        <ul class="cs-constraints">
          ${p.constraints.map(c => `<li>${esc(c)}</li>`).join('\n          ')}
        </ul>
      </section>`;

  // A carousel built as one continuous artboard has to be SHOWN as one, or
  // the technique is invisible. `galleryLayout: "seamless"` butts the panels
  // edge to edge in a single row so the seam reads; anything else falls back
  // to the ordinary grid.
  const seam = p.galleryLayout === 'seamless';
  const gallery = !has(p.gallery) ? '' : `
      <section class="cs-gallery${seam ? ' is-seamless' : ''}"${seam ? ' aria-label="Carousel panels in swipe order"' : ''}>
        <div class="cs-gallery__track">
          ${p.gallery.map((g, i) => `<img src="${root}${esc(g)}" alt="${esc(p.title)} — panel ${i + 1} of ${p.gallery.length}" loading="lazy" />`).join('\n          ')}
        </div>
        ${seam ? `<p class="cs-gallery__cap">All ${p.gallery.length} panels, in swipe order — one continuous artboard, sliced.</p>` : ''}
      </section>`;

  // Motion. Deliberately NOT autoplaying: a video that starts on its own
  // steals bandwidth, fights screen readers, and on a portfolio it competes
  // with the work above it. `controls` + a poster lets the visitor choose.
  // preload="metadata" fetches a few KB of header, not the whole file.
  const video = !has(p.video) ? '' : `
      <section class="cs-motion${p.videoRatio ? ' ratio-' + p.videoRatio : ''}">
        <p class="cs-label">Motion</p>
        <h2 class="cs-heading">In <em>motion</em></h2>
        ${has(p.videoCaption) ? `<p class="cs-text">${esc(p.videoCaption)}</p>` : ''}
        ${metaList([
          ['Tools',    p.videoTools],
          ['Duration', p.videoRuntime],
          ['Format',   p.videoFormat]
        ], 'is-compact')}
        <figure class="cs-video">
          <video
            controls
            playsinline
            preload="metadata"
            ${p.videoLoop === false ? '' : 'loop'}
            ${p.videoPoster ? `poster="${root}${esc(p.videoPoster)}"` : ''}
            ${has(p.videoAlt) ? `aria-describedby="video-alt-${esc(p.slug)}"` : ''}
            aria-label="${esc(p.videoTitle || p.title + ' — motion piece')}"
            width="1080" height="1920">
            <source src="${root}${esc(p.video)}" type="video/mp4" />
            <p>Your browser can't play this video.
               <a href="${root}${esc(p.video)}">Download the MP4</a> instead.</p>
          </video>
        </figure>
        ${has(p.videoAlt) ? `<p class="cs-video-alt" id="video-alt-${esc(p.slug)}">
          <strong>What happens in this video:</strong> ${esc(p.videoAlt)}
        </p>` : ''}
      </section>`;

  const links = [];
  // Opens in a new tab: the showcase pages are long-form, and sending someone
  // out of the case study without a way back loses them.
  if (p.showcase) links.push(`<a class="contact-btn primary" href="${root}${esc(p.showcase)}" target="_blank" rel="noopener">View the full showcase
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 11L11 3M11 3H5M11 3v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></a>`);
  if (p.link) links.push(`<a class="contact-btn outline" href="${esc(p.link)}" target="_blank" rel="noopener">${p.platform ? 'View on ' + esc(p.platform) : 'View live project'}</a>`);

  // Honest empty-state: if no case study is written yet, say nothing rather
  // than rendering empty headings.
  const caseStudy = [
    section('The problem', 'What needed <em>solving</em>', p.problem),
    constraints,
    section('Process',     'How it came <em>together</em>', p.approach),
    section('Outcome',     'What <em>happened</em>',        p.outcome)
  ].join('');

  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: p.title,
    headline: p.title,
    description: p.longDesc || p.desc,
    url,
    ...(img ? { image: `${SITE}/${img}` } : {}),
    genre: p.category,
    keywords: (p.tags || []).join(', '),
    ...(p.year ? { dateCreated: p.year } : {}),
    author:  { '@type': 'Person', name: AUTHOR, url: SITE + '/' },
    creator: { '@type': 'Person', name: AUTHOR, url: SITE + '/' },
    isPartOf: { '@type': 'CollectionPage', name: 'Selected Works', url: `${SITE}/work/` },
    ...(p.video ? { video: {
      '@type': 'VideoObject',
      name: p.videoTitle || `${p.title} — motion`,
      description: p.videoCaption || p.desc,
      contentUrl: `${SITE}/${p.video}`,
      ...(p.videoPoster ? { thumbnailUrl: `${SITE}/${p.videoPoster}` } : {}),
      ...(p.videoDuration ? { duration: p.videoDuration } : {}),
      ...(p.year ? { uploadDate: `${p.year}-01-01` } : {})
    } } : {})
  };

  return head({
    title: `${p.title} — ${p.category} by ${AUTHOR}`,
    description: meta(p.longDesc || p.desc),
    canonical: url, image: ogImage, root, jsonld
  }) + nav(root) + `
  <main class="cs" id="main">
    <nav class="cs-crumbs" aria-label="Breadcrumb">
      <a href="${root}">Home</a> <span aria-hidden="true">/</span>
      <a href="${root}work/">Works</a> <span aria-hidden="true">/</span>
      <span aria-current="page">${esc(shortName(p))}</span>
    </nav>

    <header class="cs-hero">
      <p class="cs-eyebrow">${esc(p.category)}</p>
      <h1 class="cs-title">${esc(p.title)}</h1>
      <p class="cs-lede">${esc(p.longDesc || p.desc)}</p>
      <div class="cs-tags">${(p.tags || []).map(t => `<span class="modal-tag">${esc(t)}</span>`).join('')}</div>
      ${links.length ? `<div class="cs-actions">${links.join('\n        ')}</div>` : ''}
    </header>

    ${metaBlock}

    <figure class="cs-figure${p.ratio && !p.imageFull ? ' ratio-' + p.ratio : ''}">
      ${mediaFor(p, root, 'cs-img')}
    </figure>

    ${caseStudy}
    ${gallery}
    ${video}

    <nav class="cs-pager" aria-label="More projects">
      ${prev ? `<a class="cs-prev" href="${root}work/${prev.slug}/"><span>Previous</span><strong>${esc(shortName(prev))}</strong></a>` : '<span></span>'}
      ${next ? `<a class="cs-next" href="${root}work/${next.slug}/"><span>Next</span><strong>${esc(shortName(next))}</strong></a>` : '<span></span>'}
    </nav>

    <section class="cs-cta">
      <h2>Like what you see?</h2>
      <p>I'm open to freelance and full-time work.</p>
      <div class="cs-actions">
        <a class="contact-btn primary" href="mailto:jmerboila@gmail.com">Say Hello</a>
        <a class="contact-btn outline" href="${root}work/">See all work</a>
      </div>
    </section>
  </main>` + foot(root);
}

/* -- the /work/ index ---------------------------------------------------- */
function indexPage() {
  const root = '../';
  const url  = `${SITE}/work/`;
  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Selected Works — ${AUTHOR}`,
    url,
    hasPart: PROJECTS.map(p => ({
      '@type': 'CreativeWork', name: p.title,
      description: p.desc, url: `${SITE}/work/${p.slug}/`
    }))
  };

  // Describe only the disciplines actually represented, so the lede can't
  // promise work that isn't there.
  const LABELS = { logo: 'brand identity', graphic: 'graphic design',
                   web: 'web design', mobile: 'mobile design',
                   social: 'social media creative' };
  const present = [...new Set(PROJECTS.flatMap(cats))].map(c => LABELS[c] || c);
  const disciplines = present.length > 1
    ? present.slice(0, -1).join(', ') + ' and ' + present[present.length - 1]
    : (present[0] || 'design');

  const cards = PROJECTS.map(p => `
      <a class="wi-card${p.ratio ? ' ratio-' + p.ratio : ''}" href="${root}work/${p.slug}/">
        <div class="wi-media">${p.image
          ? `<img src="${root}${esc(p.image)}" alt="${esc(p.title)}" loading="lazy" />`
          : `<div class="placeholder-fill"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true">${ICONS[p.icon] || ICONS.logo}</svg><span>${esc(p.placeholderLabel || p.category)}</span></div>`}
        </div>
        <div class="wi-body">
          <p class="wi-cat">${esc(p.category)}</p>
          <h2 class="wi-title">${esc(p.title)}</h2>
          <p class="wi-desc">${esc(p.desc)}</p>
        </div>
      </a>`).join('');

  return head({
    title: `Selected Works — ${AUTHOR}`,
    description: meta(`${disciplines.charAt(0).toUpperCase() + disciplines.slice(1)} work by ${AUTHOR} — including ${PROJECTS.slice(0, 3).map(p => p.title).join(', ')}.`),
    canonical: url, image: `${SITE}/images/og-preview.jpg`, root, jsonld
  }) + nav(root) + `
  <main class="wi" id="main">
    <header class="wi-head">
      <p class="section-label">Selected Works</p>
      <h1 class="section-title">Every <em>project</em></h1>
      <p class="wi-lede">${PROJECTS.length} projects in ${disciplines}. Each one has its own page — link to any of them directly.</p>
    </header>
    <div class="wi-grid">${cards}
    </div>
  </main>` + foot(root);
}

/* -- write everything ---------------------------------------------------- */
let written = 0;
const out = (file, html) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  written++;
  console.log('  ✓ ' + file);
};

console.log('\nGenerating project pages…');
PROJECTS.forEach((p, i) => {
  out(path.join('work', p.slug, 'index.html'),
      projectPage(p, PROJECTS[i - 1], PROJECTS[i + 1]));
});
out(path.join('work', 'index.html'), indexPage());

/* -- sitemap ------------------------------------------------------------- */
const today = new Date().toISOString().slice(0, 10);
const urls = [
  { loc: `${SITE}/`,      pri: '1.0', freq: 'monthly' },
  { loc: `${SITE}/work/`, pri: '0.9', freq: 'monthly' },
  ...PROJECTS.map(p => ({ loc: `${SITE}/work/${p.slug}/`, pri: '0.8', freq: 'yearly' })),
  ...[...new Set(PROJECTS.map(p => p.showcase).filter(Boolean))]
      .map(s => ({ loc: `${SITE}/${s}`, pri: '0.6', freq: 'yearly' }))
];

fs.writeFileSync('sitemap.xml',
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.pri}</priority>
  </url>`).join('\n')}
</urlset>
`);
console.log('  ✓ sitemap.xml (' + urls.length + ' urls)');
console.log(`\nDone — ${written} pages + sitemap.\n`);
