/* Diwali effects shared by every /diwali page: fireworks, sparkles and soft chimes.
   FX.burst(x, y)   one firework at a screen point
   FX.show(n)       n fireworks at random spots
   FX.sparkle(x, y) a small glittery puff
   FX.chime(step)   a soft bell; step raises the pitch
   Sound waits for the first tap (browsers require it) and can be muted. */
(function () {
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cv = document.createElement('canvas');
  cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:50';
  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(cv));
  const ctx = cv.getContext('2d');
  let W = 0, H = 0, dpr = 1, parts = [], running = false;
  function size() { dpr = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  size(); addEventListener('resize', size);

  const PAL = [['#fde047', '#fb923c'], ['#f472b6', '#fde68a'], ['#22d3ee', '#a78bfa'], ['#4ade80', '#fde047'], ['#f87171', '#fbbf24'], ['#c084fc', '#f9a8d4']];
  function add(p) { parts.push(p); if (!running) { running = true; requestAnimationFrame(tick); } }
  function tick() {
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    parts = parts.filter(p => p.life > 0);
    for (const p of parts) {
      if (p.rocket) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.life--;
        ctx.fillStyle = '#fff7ed'; ctx.beginPath(); ctx.arc(p.x, p.y, 2.2, 0, 7); ctx.fill();
        if (Math.random() < .8) add({x: p.x, y: p.y, vx: (Math.random() - .5) * .6, vy: Math.random() * .8, g: .02, life: 18, max: 18, r: 1.4, c: '#fdba74'});
        if (p.vy >= -0.5 || p.life <= 0) { p.life = 0; explode(p.x, p.y, p.pal); }
        continue;
      }
      p.vx *= p.drag || .985; p.vy = p.vy * (p.drag || .985) + p.g; p.x += p.vx; p.y += p.vy; p.life--;
      const a = Math.max(0, p.life / p.max);
      ctx.globalAlpha = a;
      ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (p.twinkle ? (0.6 + Math.random() * .8) : 1), 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    if (parts.length) requestAnimationFrame(tick); else { running = false; ctx.clearRect(0, 0, W, H); }
  }
  function explode(x, y, pal) {
    pal = pal || PAL[Math.floor(Math.random() * PAL.length)];
    const n = calm ? 26 : 70, ring = Math.random() < .35;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.random() * .1, s = ring ? 4.2 : 1 + Math.random() * 4.2;
      add({x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: .05, drag: .975, life: 70 + Math.random() * 30, max: 100, r: 2, c: pal[i % 2], twinkle: true});
    }
    chime(Math.floor(Math.random() * 5), .05);
  }
  const FX = window.FX = {
    burst(x, y, pal) { explode(x, y, pal); },
    launch(x, pal) { add({rocket: true, x, y: H, vx: (Math.random() - .5) * 1.5, vy: -(9 + Math.random() * 3), life: 90, pal}); },
    show(n = 5) { for (let i = 0; i < n; i++) setTimeout(() => FX.launch(W * (.15 + Math.random() * .7)), i * (calm ? 500 : 280)); },
    sparkle(x, y, n = calm ? 8 : 18) {
      for (let i = 0; i < n; i++) { const a = Math.random() * 7, s = Math.random() * 2.6; add({x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1, g: .04, life: 40, max: 40, r: 1.6, c: PAL[i % PAL.length][0], twinkle: true}); }
    },
    chime: (step, vol) => chime(step, vol),
    get muted() { return muted; },
  };

  // Sound: tiny bell made with the Web Audio API, no files.
  let ac = null, muted = false;
  try { muted = localStorage.getItem('dw-muted') === '1'; } catch (e) { /* storage blocked */ }
  const NOTES = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.5];
  function chime(step = 0, vol = .12) {
    if (muted) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === 'suspended') ac.resume();
      const t = ac.currentTime, f = NOTES[Math.abs(step) % NOTES.length];
      for (const [mult, v] of [[1, vol], [2.01, vol * .35], [3, vol * .15]]) {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = 'sine'; o.frequency.value = f * mult;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + 1.4);
        o.connect(g).connect(ac.destination); o.start(t); o.stop(t + 1.5);
      }
    } catch (e) { /* no audio */ }
  }
  // A small mute button in the corner of every Diwali page.
  document.addEventListener('DOMContentLoaded', () => {
    const b = document.createElement('button');
    b.className = 'dw-mute no-print';
    const paint = () => { b.textContent = muted ? '🔇' : '🔔'; b.setAttribute('aria-label', muted ? 'Turn sound on' : 'Turn sound off'); };
    paint();
    b.onclick = () => { muted = !muted; paint(); try { localStorage.setItem('dw-muted', muted ? '1' : '0'); } catch (e) { /* ignore */ } if (!muted) chime(4); };
    document.body.appendChild(b);
  });
})();
