// home.js — aparicion progresiva de bloques y burbuja del boton flotante
(function () {
  var bloques = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('visible');
          obs.unobserve(en.target);
        }
      });
    }, { threshold: 0.1 });
    bloques.forEach(function (el) { obs.observe(el); });
  } else {
    bloques.forEach(function (el) { el.classList.add('visible'); });
  }

  ['problems-grid', 'services-grid', 'testi-grid', 'team-grid', 'diferencia-list', 'confianza-cards'].forEach(function (c) {
    document.querySelectorAll('.' + c + ' > *').forEach(function (el, i) {
      el.style.transitionDelay = (i % 3) * 80 + 'ms';
    });
  });

  // Las secciones fuera de pantalla se maquetan en diferido (content-visibility),
  // así que al abrir la página con un ancla (#contacto) se recoloca al terminar la carga.
  if (location.hash.length > 1) {
    window.addEventListener('load', function () {
      var destino;
      try { destino = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch (e) { return; }
      if (destino) destino.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
  }

  setTimeout(function () {
    var b = document.getElementById('waBubble');
    if (!b) return;
    b.style.cssText = 'opacity:0;transform:translateY(8px);transition:all .5s;';
    setTimeout(function () { b.remove(); }, 500);
  }, 7000);
})();
