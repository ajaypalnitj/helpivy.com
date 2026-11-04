/* Seasonal theme switch. Runs on every page (loaded in <head>).
   The theme turns itself off after SEASON_END, and any visitor can switch it off with the
   button in the corner (remembered on this device only). To end it early for everyone,
   set SEASON = null. */
(function () {
  const SEASON = 'diwali', SEASON_END = '2026-11-16';
  const KEY = 'helpivy-season-off';
  let off = false;
  try { off = localStorage.getItem(KEY) === SEASON; } catch (e) { /* storage blocked */ }
  const live = SEASON && new Date() < new Date(SEASON_END + 'T00:00:00');
  if (!live) return;
  const root = document.documentElement;
  if (!off) root.setAttribute('data-season', SEASON);
  document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('.topnav');
    if (nav) { const t = document.createElement('div'); t.className = 'toran'; t.setAttribute('aria-hidden', 'true'); nav.after(t); }
    const sp = document.createElement('div'); sp.className = 'season-sparkles'; sp.setAttribute('aria-hidden', 'true');
    // Home page: a festive greeting above the headline.
    const icons = document.querySelector('.hero-icons');
    let greet = null;
    if (icons) {
      greet = document.createElement('p'); greet.className = 'season-greeting';
      greet.innerHTML = '🪔 Happy Diwali! शुभ दीपावली · ਦੀਵਾਲੀ ਦੀਆਂ ਵਧਾਈਆਂ · <a href="/diwali/">Diwali fun →</a>';
      icons.before(greet);
    }
    // Other pages (not home, not the Diwali pages): a small link to the Diwali activities.
    if (!icons && !location.pathname.startsWith('/diwali') && nav) {
      const strip = document.createElement('div'); strip.className = 'season-strip';
      strip.innerHTML = '<a href="/diwali/">🪔 Happy Diwali! Try our free Diwali fun →</a>';
      nav.nextElementSibling.after(strip);
    }
    const btn = document.createElement('button'); btn.className = 'season-toggle';
    const paint = () => {
      const on = root.getAttribute('data-season') === SEASON;
      btn.textContent = on ? '🪔 Diwali theme: on' : '🪔 Diwali theme: off';
      btn.setAttribute('aria-pressed', String(on));
      if (on) { if (!sp.isConnected) document.body.appendChild(sp); if (greet) greet.hidden = false; }
      else { sp.remove(); if (greet) greet.hidden = true; }
    };
    btn.onclick = () => {
      const on = root.getAttribute('data-season') === SEASON;
      if (on) root.removeAttribute('data-season'); else root.setAttribute('data-season', SEASON);
      try { if (on) localStorage.setItem(KEY, SEASON); else localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
      paint();
    };
    document.body.appendChild(btn); paint();
  });
})();
