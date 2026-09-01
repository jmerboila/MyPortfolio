/* ============================================================================
   site.js — shared behaviour for the generated project pages (/work/…)
   Just the two interactive bits the pages actually need: theme toggle and
   the mobile menu. No parallax, no custom cursor — those belong to the
   homepage hero only.
   ========================================================================= */
document.addEventListener('DOMContentLoaded', () => {

  /* Theme toggle — shares the same localStorage key as the homepage, so a
     visitor's choice follows them across pages. The initial value is applied
     inline in <head> to avoid a flash of the wrong theme. */
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  /* Mobile nav */
  const burger = document.getElementById('navBurger');
  const navLinks = document.getElementById('navLinks');
  if (burger && navLinks) {
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
  }
});
