// nav.js — sombra del encabezado al desplazar y menu movil accesible
(function () {
  var navbar = document.getElementById('navbar');
  var links = document.getElementById('navLinks');
  var boton = document.querySelector('.nav-hamburger');

  if (navbar) {
    var alDesplazar = function () {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    };
    window.addEventListener('scroll', alDesplazar, { passive: true });
    alDesplazar();
  }

  // Las secciones lejanas se maquetan en diferido (content-visibility): al abrir la
  // página con un ancla (#contacto) se recoloca cuando termina la carga.
  if (location.hash.length > 1) {
    window.addEventListener('load', function () {
      var destino;
      try { destino = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch (e) { return; }
      if (destino) destino.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
  }

  // Por el mismo motivo, tras un salto a un ancla se comprueba dónde quedó el destino:
  // si las secciones intermedias cambiaron de altura durante el desplazamiento, se corrige.
  document.addEventListener('click', function (e) {
    var enlace = e.target.closest('a[href^="#"]');
    if (!enlace || enlace.getAttribute('href').length < 2) return;
    var destino = document.getElementById(enlace.getAttribute('href').slice(1));
    if (!destino) return;

    var ajustar = function () {
      var margen = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      if (Math.abs(destino.getBoundingClientRect().top - margen) > 8) {
        destino.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    };

    if ('onscrollend' in window) {
      window.addEventListener('scrollend', ajustar, { once: true });
      setTimeout(function () { window.removeEventListener('scrollend', ajustar); }, 2500);
    } else {
      setTimeout(ajustar, 900);
    }
  });

  if (!boton || !links) return;

  function abrir(estado) {
    links.classList.toggle('open', estado);
    boton.setAttribute('aria-expanded', String(estado));
    boton.setAttribute('aria-label', estado ? 'Cerrar menú' : 'Abrir menú');
  }

  boton.addEventListener('click', function () {
    abrir(!links.classList.contains('open'));
  });
  links.addEventListener('click', function (e) {
    if (e.target.closest('a')) abrir(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && links.classList.contains('open')) {
      abrir(false);
      boton.focus();
    }
  });
})();
