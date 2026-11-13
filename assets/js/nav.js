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
