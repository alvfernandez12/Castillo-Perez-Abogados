// whatsapp.js — construye los enlaces wa.me con el mensaje prellenado.
(function () {
  var NUMERO = '573104893626'; // +57 310 489 3626, único número oficial

  window.CPA = window.CPA || {};

  // Devuelve la URL de WhatsApp para un texto cualquiera.
  window.CPA.waUrl = function (texto) {
    return 'https://wa.me/' + NUMERO + '?text=' + encodeURIComponent(texto);
  };

  // Mensaje de una solicitud precalificada.
  // `d` = { nombre, area, ciudad, urgencia, resumen } con los textos visibles.
  window.CPA.waMensaje = function (d) {
    var lineas = [
      'Hola, soy ' + d.nombre + '.',
      '',
      'Área: ' + d.area,
      'Ciudad o modalidad: ' + d.ciudad,
      'Tipo de necesidad: ' + d.urgencia
    ];
    if (d.resumen) lineas.push('Resumen: ' + d.resumen);
    lineas.push('', 'Autorizo el tratamiento de mis datos personales (Ley 1581 de 2012).');
    lineas.push('Enviado desde castilloperezabogados.com' + location.pathname);
    return lineas.join('\n');
  };
})();
