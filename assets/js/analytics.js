// analytics.js — eventos de medición hacia dataLayer (GTM / GA4).
//
// Regla: aquí nunca entran datos personales (nombre, teléfono ni texto libre).
// Solo viajan el área, la ciudad o modalidad, la urgencia, la página y el botón pulsado.
(function () {
  // Google Analytics 4 se carga desde consentimiento.js, solo si el visitante acepta las cookies.
  //
  // ID opcional de un contenedor de Google Tag Manager, con el formato 'GTM-XXXXXXX'.
  // Mientras esté vacío no se carga ningún script externo: los eventos solo se
  // acumulan en window.dataLayer, listos para cuando se active la medición.
  // Antes de poner el ID hay que actualizar la sección de cookies de la política
  // de datos y añadir el aviso de consentimiento.
  var GTM_ID = '';

  window.dataLayer = window.dataLayer || [];
  window.CPA = window.CPA || {};

  var pagina = location.pathname;

  // Envía un evento. `datos` solo admite las claves de la lista blanca.
  var PERMITIDAS = ['area_juridica', 'ciudad', 'urgencia', 'ubicacion_cta', 'canal', 'precalificado'];
  window.CPA.evento = function (nombre, datos) {
    var carga = { event: nombre, area_juridica: 'no_definida', ciudad: 'no_definida', pagina_origen: pagina };
    PERMITIDAS.forEach(function (clave) {
      if (datos && datos[clave] !== undefined && datos[clave] !== '') carga[clave] = datos[clave];
    });
    // Con consentimiento, GA4 (cargado por consentimiento.js) recibe el evento directamente.
    // Sin consentimiento, el evento solo queda en dataLayer y no sale del navegador.
    if (typeof window.gtag === 'function') {
      var parametros = {};
      Object.keys(carga).forEach(function (k) { if (k !== 'event') parametros[k] = carga[k]; });
      window.gtag('event', nombre, parametros);
    } else {
      window.dataLayer.push(carga);
    }
  };

  // Llamadas: cualquier enlace tel: de la página.
  document.addEventListener('click', function (e) {
    var enlace = e.target.closest('a[href^="tel:"]');
    if (!enlace) return;
    window.CPA.evento('phone_click', {
      ubicacion_cta: enlace.getAttribute('data-cta') || 'sin_etiqueta',
      area_juridica: enlace.getAttribute('data-area') || ''
    });
  });

  // Carga de GTM solo si hay ID configurado.
  if (GTM_ID) {
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(GTM_ID);
    document.head.appendChild(s);
  }
})();
