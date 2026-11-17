// consentimiento.js — aviso de cookies y carga de Google Analytics 4 solo con consentimiento.
//
// Mientras el visitante no acepte, no se carga ningún script de Google ni se instala
// ninguna cookie de analítica. La decisión se guarda en el navegador (localStorage)
// para no volver a preguntar, y se puede cambiar desde «Preferencias de cookies» en el pie.
(function () {
  var GA_ID = 'G-HHW891HB94';
  var CLAVE = 'cpa-cookies'; // 'aceptado' | 'rechazado'
  var CPA = window.CPA = window.CPA || {};

  function leer() { try { return localStorage.getItem(CLAVE); } catch (e) { return null; } }
  function guardar(valor) { try { localStorage.setItem(CLAVE, valor); } catch (e) {} }

  var cargado = false;
  function cargarGA() {
    if (cargado) return;
    cargado = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }

  // Al retirar el consentimiento se borran las cookies de Google Analytics (_ga, _ga_XXXX)
  function borrarCookiesGA() {
    var host = location.hostname.replace(/^www\./, '');
    document.cookie.split(';').forEach(function (c) {
      var nombre = c.split('=')[0].trim();
      if (!/^_ga/.test(nombre)) return;
      ['', '; domain=' + host, '; domain=.' + host].forEach(function (dominio) {
        document.cookie = nombre + '=; Max-Age=0; path=/' + dominio;
      });
    });
  }

  var aviso = null;
  function cerrarAviso() {
    if (aviso) { aviso.remove(); aviso = null; }
  }

  function decidir(valor) {
    var anterior = leer();
    guardar(valor);
    cerrarAviso();
    if (valor === 'aceptado') cargarGA();
    else if (anterior === 'aceptado' || cargado) { borrarCookiesGA(); location.reload(); }
  }

  function mostrarAviso() {
    if (aviso) return;
    aviso = document.createElement('section');
    aviso.className = 'cookies';
    aviso.setAttribute('aria-label', 'Aviso de cookies');
    aviso.innerHTML =
      '<p>Usamos cookies de analítica (Google Analytics) para saber, de forma agregada, cómo se usa el sitio. ' +
      'Solo se activan si usted las acepta. <a href="/politica-de-privacidad/#cookies">Ver la política de cookies</a>.</p>' +
      '<div class="cookies-acciones">' +
        '<button type="button" class="btn btn--linea-clara" data-decision="rechazado">Rechazar</button>' +
        '<button type="button" class="btn btn--bronce" data-decision="aceptado">Aceptar</button>' +
      '</div>';
    aviso.addEventListener('click', function (e) {
      var boton = e.target.closest('[data-decision]');
      if (boton) decidir(boton.getAttribute('data-decision'));
    });
    document.body.appendChild(aviso);
  }

  // Enlace «Preferencias de cookies» del pie
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-cookies]')) { e.preventDefault(); mostrarAviso(); }
  });

  CPA.analiticaActiva = function () { return cargado; };

  var estado = leer();
  if (estado === 'aceptado') cargarGA();
  else if (estado !== 'rechazado') mostrarAviso();
})();
