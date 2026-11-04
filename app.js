// Carga los textos desde content.json. Para cambiar la web, edita content.json (no este archivo).
const get = (o, p) => p.split('.').reduce((a, k) => (a ? a[k] : undefined), o);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rainbow = ['#ef4b4b','#f7a21b','#3fb24a','#20b7b0','#2f7fd8','#8a4fc9','#ee5fa7'];

fetch('content.json', { cache: 'no-store' })
  .then(r => r.json())
  .then(d => {
    document.querySelectorAll('[data-c]').forEach(el => {
      const v = get(d, el.dataset.c);
      if (v) el.textContent = v;
    });

    if (d.aviso) document.querySelector('.aviso').hidden = false;
    const c = d.contacto || {};
    const wa = `https://wa.me/${c.whatsapp}?text=${encodeURIComponent(c.mensaje_whatsapp || '')}`;
    document.querySelectorAll('[data-wa]').forEach(a => a.href = wa);
    document.querySelectorAll('[data-ig]').forEach(a => a.href = `https://instagram.com/${c.instagram}`);
    document.getElementById('wa-num').textContent = '+' + String(c.whatsapp).replace(/^(\d{2})(\d)(\d{4})(\d{4})$/, '$1 $2 $3 $4');
    document.getElementById('ig-user').textContent = '@' + c.instagram;
    if (c.email) {
      document.getElementById('email-row').hidden = false;
      const e = document.getElementById('email'); e.textContent = c.email; e.href = 'mailto:' + c.email;
    }
    document.getElementById('mapa').src = 'https://maps.google.com/maps?q=' + encodeURIComponent(c.direccion) + '&z=16&output=embed';

    document.getElementById('destacados').innerHTML = (d.quienes_somos?.destacados || []).map((x, i) =>
      `<div class="card" style="--c:${rainbow[i % rainbow.length]}"><div class="ico">${esc(x.icono)}</div><h3>${esc(x.titulo)}</h3><p>${esc(x.texto)}</p></div>`).join('');

    document.getElementById('niveles-list').innerHTML = (d.niveles || []).map(n =>
      `<div class="nivel"><div class="dot" style="background:${esc(n.color)}">${esc(n.nombre[0])}</div><h3>${esc(n.nombre)}</h3><p>${esc(n.edad)}</p><p><strong>${esc(n.horario)}</strong></p></div>`).join('');

    // Cada actividad tiene una lista de "fotos". Las que aún no se suben a la carpeta fotos/ se saltan solas;
    // si no hay ninguna, se muestra la imagen de "respaldo".
    const existe = src => new Promise(ok => { const i = new Image(); i.onload = () => ok(true); i.onerror = () => ok(false); i.src = src; });
    Promise.all((d.galeria || []).map(async g => {
      const lista = g.fotos && g.fotos.length ? g.fotos : (g.foto ? [g.foto] : []);
      const ok = (await Promise.all(lista.map(existe))).map((e, k) => e ? lista[k] : null).filter(Boolean);
      return { titulo: g.titulo, fotos: ok.length ? ok : [g.respaldo || 'logo.svg'] };
    })).then(gal => {
      document.getElementById('galeria-list').innerHTML = gal.map(g =>
        `<figure class="foto"><img src="${esc(g.fotos[0])}" alt="${esc(g.titulo)}">${g.fotos.length > 1 ? `<span class="foto-badge">▣ ${g.fotos.length}</span>` : ''}<figcaption>${esc(g.titulo)}</figcaption></figure>`).join('');
      initVisor(gal);
    });

    const t = d.testimonios || [];
    document.getElementById('testimonios').hidden = t.length === 0;
    document.getElementById('testimonios-list').innerHTML = t.map(x =>
      `<figure class="testimonio"><blockquote>${esc(x.texto)}</blockquote><figcaption>${esc(x.autor)}</figcaption></figure>`).join('');
  })
  .catch(err => console.error('No se pudo leer content.json', err));

document.getElementById('year').textContent = new Date().getFullYear();
const btn = document.querySelector('.menu-btn'), links = document.querySelector('.links');
btn.addEventListener('click', () => { const o = links.classList.toggle('open'); btn.setAttribute('aria-expanded', o); });
links.addEventListener('click', e => { if (e.target.tagName === 'A') links.classList.remove('open'); });

// Visor: al tocar una foto se abre en grande y se desliza hacia los lados.
// Si la actividad tiene varias fotos, muestra solo ese álbum; si tiene una, recorre todas las actividades.
function initVisor(gal) {
  if (!gal.length) return;
  const v = document.createElement('div');
  v.className = 'visor';
  v.innerHTML = `<div class="visor-count"></div><div class="visor-track"></div>
    <button class="visor-btn visor-close" aria-label="Cerrar">✕</button>
    <button class="visor-btn visor-prev" aria-label="Anterior">‹</button>
    <button class="visor-btn visor-next" aria-label="Siguiente">›</button>`;
  document.body.appendChild(v);
  const track = v.querySelector('.visor-track'), count = v.querySelector('.visor-count');
  let n = 0;
  const idx = () => Math.round(track.scrollLeft / track.clientWidth);
  const go = i => track.scrollTo({ left: Math.max(0, Math.min(n - 1, i)) * track.clientWidth, behavior: 'smooth' });
  const upd = () => count.textContent = n > 1 ? (idx() + 1) + ' / ' + n : '';
  const close = () => { v.classList.remove('open'); document.body.style.overflow = ''; };
  const open = (slides, start) => {
    n = slides.length;
    track.innerHTML = slides.map(s => `<figure class="visor-slide"><img src="${esc(s.src)}" alt="${esc(s.titulo)}"><figcaption>${esc(s.titulo)}</figcaption></figure>`).join('');
    v.classList.add('open'); document.body.style.overflow = 'hidden';
    v.querySelectorAll('.visor-prev,.visor-next').forEach(b => b.hidden = n < 2);
    track.scrollLeft = start * track.clientWidth; upd();
  };
  track.addEventListener('scroll', upd);
  v.querySelector('.visor-close').onclick = close;
  v.querySelector('.visor-prev').onclick = () => go(idx() - 1);
  v.querySelector('.visor-next').onclick = () => go(idx() + 1);
  v.addEventListener('click', e => { if (e.target.classList.contains('visor-slide')) close(); });
  document.addEventListener('keydown', e => {
    if (!v.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') go(idx() + 1);
    if (e.key === 'ArrowLeft') go(idx() - 1);
  });
  const sueltas = gal.filter(g => g.fotos.length === 1);
  document.querySelectorAll('#galeria-list .foto').forEach((f, i) => f.addEventListener('click', () => {
    const g = gal[i];
    if (g.fotos.length > 1) open(g.fotos.map((src, k) => ({ src, titulo: `${g.titulo} · ${k + 1}/${g.fotos.length}` })), 0);
    else open(sueltas.map(s => ({ src: s.fotos[0], titulo: s.titulo })), sueltas.indexOf(g));
  }));
}
