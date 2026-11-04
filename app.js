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

    document.getElementById('galeria-list').innerHTML = (d.galeria || []).map(g =>
      `<figure class="foto"><img src="${esc(g.foto)}" alt="${esc(g.titulo)}" loading="lazy"><figcaption>${esc(g.titulo)}</figcaption></figure>`).join('');

    initVisor(d.galeria || []);

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

// Visor: al tocar una foto se abre en grande y se desliza hacia los lados
function initVisor(fotos) {
  if (!fotos.length) return;
  const v = document.createElement('div');
  v.className = 'visor';
  v.innerHTML = `<div class="visor-count"></div>
    <div class="visor-track">${fotos.map(g => `<figure class="visor-slide"><img src="${esc(g.foto)}" alt="${esc(g.titulo)}" loading="lazy"><figcaption>${esc(g.titulo)}</figcaption></figure>`).join('')}</div>
    <button class="visor-btn visor-close" aria-label="Cerrar">✕</button>
    <button class="visor-btn visor-prev" aria-label="Anterior">‹</button>
    <button class="visor-btn visor-next" aria-label="Siguiente">›</button>`;
  document.body.appendChild(v);
  const track = v.querySelector('.visor-track'), count = v.querySelector('.visor-count');
  const idx = () => Math.round(track.scrollLeft / track.clientWidth);
  const go = i => track.scrollTo({ left: Math.max(0, Math.min(fotos.length - 1, i)) * track.clientWidth, behavior: 'smooth' });
  const upd = () => count.textContent = (idx() + 1) + ' / ' + fotos.length;
  const close = () => { v.classList.remove('open'); document.body.style.overflow = ''; };
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
  document.querySelectorAll('#galeria-list .foto').forEach((f, i) => f.addEventListener('click', () => {
    v.classList.add('open'); document.body.style.overflow = 'hidden';
    track.scrollLeft = i * track.clientWidth; upd();
  }));
}
