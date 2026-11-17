// precalificacion.js — embudo de dos pasos antes de abrir WhatsApp o enviar la solicitud.
//
// Sin JavaScript, los botones siguen siendo enlaces wa.me normales. Con JavaScript,
// este archivo los intercepta y abre la precalificación.
(function () {
  if (!window.HTMLDialogElement) return; // navegadores sin <dialog>: se conserva el enlace directo

  var CPA = window.CPA = window.CPA || {};
  var evento = CPA.evento || function () {};

  // Servicio que entrega la solicitud en el correo de la firma. La primera vez que se
  // use, FormSubmit envía a ese buzón un mensaje de activación que hay que confirmar.
  var CORREO = 'castilloabogados22@gmail.com';
  var ENVIO_URL = 'https://formsubmit.co/ajax/' + CORREO;

  // Opciones: [valor para analítica, texto visible, aclaración opcional]
  var AREAS = [
    ['penal', 'Derecho Penal'],
    ['laboral', 'Derecho Laboral y Seguridad Social', 'Incluye pensiones'],
    ['familia', 'Derecho de Familia'],
    ['civil_comercial', 'Derecho Civil y Comercial'],
    ['administrativo', 'Derecho Administrativo y Constitucional'],
    ['empresarial', 'Derecho Empresarial y Societario'],
    ['migratorio', 'Trámites Migratorios (EE. UU.)'],
    ['tributario', 'Consultoría Contable y Tributaria'],
    ['otro', 'Otro / Consulta jurídica general']
  ];
  var CIUDADES = [
    ['monteria', 'Montería'],
    ['medellin', 'Medellín'],
    ['virtual_nacional', 'Virtual en Colombia'],
    ['exterior', 'Desde el exterior']
  ];
  var URGENCIAS = [
    ['termino_proximo', 'Tengo un término o una audiencia próxima', 'Captura, audiencia programada o término legal por vencer'],
    ['caso_especifico', 'Asesoría integral o consulta para un caso específico', 'Tutelas, derechos de petición, divorcios, letras de cambio, deudas, comparendos, liquidación conyugal o revisión de documentos'],
    ['preventiva', 'Consulta preventiva', 'Quiero orientación antes de tomar una decisión'],
    ['empresarial', 'Asesoría para una empresa', 'Acompañamiento jurídico, laboral o tributario']
  ];

  function opciones(nombre, lista) {
    return lista.map(function (o) {
      return '<label class="pq-opcion"><input type="radio" name="' + nombre + '" value="' + o[0] + '"><span><b>' + o[1] + '</b>' +
        (o[2] ? '<small>' + o[2] + '</small>' : '') + '</span></label>';
    }).join('');
  }

  var dialogo, form, origen = 'sin_etiqueta', abridor = null;

  function construir() {
    dialogo = document.createElement('dialog');
    dialogo.className = 'pq';
    dialogo.id = 'precalificacion';
    dialogo.setAttribute('aria-labelledby', 'pq-titulo');
    dialogo.innerHTML =
      '<form class="pq-form" novalidate>' +
        '<header class="pq-cab">' +
          '<p class="pq-paso" data-pq="paso">Paso 1 de 2</p>' +
          '<h2 id="pq-titulo" data-pq="titulo" tabindex="-1">Cuéntenos sobre su caso</h2>' +
          '<button type="button" class="pq-cerrar" data-pq="cerrar" aria-label="Cerrar">&times;</button>' +
        '</header>' +
        '<div class="pq-progreso" aria-hidden="true"><span></span></div>' +
        '<div class="pq-cuerpo">' +

          '<div data-pq="p1">' +
            '<fieldset><legend>¿En qué área necesita asesoría?</legend><div class="pq-opciones">' + opciones('area', AREAS) + '</div></fieldset>' +
            '<fieldset><legend>¿Dónde o cómo prefiere ser atendido?</legend><div class="pq-opciones">' + opciones('ciudad', CIUDADES) + '</div></fieldset>' +
            '<fieldset><legend>¿Qué tipo de necesidad tiene?</legend><div class="pq-opciones pq-opciones--una">' + opciones('urgencia', URGENCIAS) + '</div></fieldset>' +
            '<p class="pq-error" data-pq="error1" role="alert"></p>' +
          '</div>' +

          '<div data-pq="p2" hidden>' +
            '<ul class="pq-resumen" data-pq="resumen" aria-label="Lo que eligió"></ul>' +
            '<div class="pq-campo"><label class="pq-etiqueta" for="pq-nombre">Nombre completo</label>' +
              '<input id="pq-nombre" name="nombre" type="text" autocomplete="name" maxlength="80" required aria-describedby="pq-nombre-error">' +
              '<p class="pq-error" id="pq-nombre-error"></p></div>' +
            '<div class="pq-campo"><label class="pq-etiqueta" for="pq-telefono">Teléfono de contacto</label>' +
              '<input id="pq-telefono" name="telefono" type="tel" inputmode="tel" autocomplete="tel" maxlength="20" required aria-describedby="pq-telefono-ayuda pq-telefono-error">' +
              '<p class="pq-ayuda" id="pq-telefono-ayuda">Si escribe desde otro país, incluya el indicativo.</p>' +
              '<p class="pq-error" id="pq-telefono-error"></p></div>' +
            '<div class="pq-campo"><label class="pq-etiqueta" for="pq-resumen">Resumen breve <span class="pq-opcional">(opcional)</span></label>' +
              '<textarea id="pq-resumen" name="resumen" maxlength="500" rows="3" aria-describedby="pq-resumen-ayuda"></textarea>' +
              '<p class="pq-ayuda" id="pq-resumen-ayuda">Una o dos frases bastan. No incluya datos que no quiera compartir todavía.</p></div>' +
            '<div class="pq-trampa" aria-hidden="true"><label>No llene este campo <input name="_honey" type="text" tabindex="-1" autocomplete="off"></label></div>' +
            '<label class="pq-autoriza"><input type="checkbox" name="autoriza" required aria-describedby="pq-autoriza-error">' +
              '<span>Autorizo a Castillo Pérez Asesorías y Consultorías S.A.S. a tratar mis datos personales para atender mi consulta, conforme a la Ley 1581 de 2012 y a la <a href="/politica-de-privacidad/" target="_blank" rel="noopener">política de tratamiento de datos</a>.</span></label>' +
            '<p class="pq-error" id="pq-autoriza-error"></p>' +
            '<p class="pq-nota">La revisión inicial de viabilidad no constituye una relación abogado-cliente ni garantiza el resultado de un proceso (Ley 1123 de 2007).</p>' +
            '<p class="pq-error" data-pq="error2" role="alert"></p>' +
          '</div>' +

          '<div class="pq-ok" data-pq="ok" hidden></div>' +
        '</div>' +

        '<footer class="pq-pie" data-pq="pie1">' +
          '<button type="button" class="btn btn--bronce" data-pq="siguiente">Continuar</button>' +
        '</footer>' +
        '<footer class="pq-pie pq-pie--dos" data-pq="pie2" hidden>' +
          '<button type="button" class="pq-atras" data-pq="atras">Volver al paso 1</button>' +
          '<button type="button" class="btn btn--whatsapp" data-pq="whatsapp">Continuar por WhatsApp</button>' +
          '<button type="button" class="btn btn--linea" data-pq="correo">Enviar solicitud por correo</button>' +
        '</footer>' +
        '<footer class="pq-pie" data-pq="pie-ok" hidden>' +
          '<button type="button" class="btn btn--marino" data-pq="cerrar">Cerrar</button>' +
        '</footer>' +
      '</form>';
    document.body.appendChild(dialogo);
    form = dialogo.querySelector('form');

    form.addEventListener('submit', function (e) { e.preventDefault(); });
    dialogo.addEventListener('click', function (e) {
      if (e.target === dialogo) { cerrar(); return; } // clic en el fondo
      var accion = e.target.closest('[data-pq]');
      if (!accion) return;
      var a = accion.getAttribute('data-pq');
      if (a === 'cerrar') cerrar();
      else if (a === 'siguiente') pasoDos();
      else if (a === 'atras') mostrar('1');
      else if (a === 'whatsapp') porWhatsApp();
      else if (a === 'correo') porCorreo(accion);
    });
    dialogo.addEventListener('close', function () {
      document.documentElement.classList.remove('pq-abierto');
      if (abridor && abridor.focus) abridor.focus();
    });
    // Al corregir un campo se borra su aviso de error
    form.addEventListener('input', function (e) {
      var n = e.target.name;
      if (n === 'nombre' || n === 'telefono' || n === 'autoriza') error(e.target, 'pq-' + n + '-error', '');
      if (n === 'area' || n === 'ciudad' || n === 'urgencia') q('error1').textContent = '';
    });
    // Enter en un campo de texto no envía nada por accidente
    form.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'checkbox' && e.target.type !== 'radio') e.preventDefault();
    });
  }

  function q(nombre) { return dialogo.querySelector('[data-pq="' + nombre + '"]'); }
  function elegido(nombre) { var el = form.querySelector('input[name="' + nombre + '"]:checked'); return el ? el.value : ''; }
  function texto(lista, valor) { for (var i = 0; i < lista.length; i++) if (lista[i][0] === valor) return lista[i][1]; return ''; }
  function marcar(nombre, valor) {
    var el = valor && form.querySelector('input[name="' + nombre + '"][value="' + valor + '"]');
    if (el) el.checked = true;
  }

  function mostrar(paso) {
    dialogo.setAttribute('data-paso', paso);
    q('p1').hidden = paso !== '1';
    q('p2').hidden = paso !== '2';
    q('ok').hidden = paso !== 'ok';
    q('pie1').hidden = paso !== '1';
    q('pie2').hidden = paso !== '2';
    q('pie-ok').hidden = paso !== 'ok';
    q('paso').textContent = paso === '1' ? 'Paso 1 de 2' : paso === '2' ? 'Paso 2 de 2' : 'Solicitud lista';
    q('titulo').textContent = paso === '1' ? 'Cuéntenos sobre su caso' : paso === '2' ? 'Sus datos de contacto' : 'Gracias';
    dialogo.querySelector('.pq-cuerpo').scrollTop = 0;
    q('titulo').focus();
  }

  function abrir(disparador) {
    if (!dialogo) construir();
    abridor = disparador || null;
    origen = (disparador && disparador.getAttribute('data-cta')) || 'sin_etiqueta';
    // Valor del botón pulsado o, si no lo trae, el de la página (<body data-area / data-ciudad>)
    var pagina = document.body.dataset || {};
    ['area', 'ciudad', 'urgencia'].forEach(function (n) {
      marcar(n, (disparador && disparador.getAttribute('data-' + n)) || pagina[n]);
    });
    q('error1').textContent = '';
    q('error2').textContent = '';
    mostrar('1');
    document.documentElement.classList.add('pq-abierto');
    if (!dialogo.open) dialogo.showModal();
    q('titulo').focus();
    evento('prequal_open', { ubicacion_cta: origen, area_juridica: elegido('area') });
  }

  function cerrar() { if (dialogo.open) dialogo.close(); }

  function pasoDos() {
    var area = elegido('area'), ciudad = elegido('ciudad'), urgencia = elegido('urgencia');
    if (!area || !ciudad || !urgencia) {
      var falta = !area ? 'el área' : !ciudad ? 'dónde o cómo prefiere ser atendido' : 'el tipo de necesidad';
      q('error1').textContent = 'Elija ' + falta + ' para continuar.';
      var grupo = form.querySelector('input[name="' + (!area ? 'area' : !ciudad ? 'ciudad' : 'urgencia') + '"]');
      if (grupo) grupo.focus();
      return;
    }
    q('error1').textContent = '';
    q('resumen').innerHTML = [texto(AREAS, area), texto(CIUDADES, ciudad), texto(URGENCIAS, urgencia)]
      .map(function (t) { return '<li>' + t + '</li>'; }).join('');
    evento('form_step_1', { area_juridica: area, ciudad: ciudad, urgencia: urgencia, ubicacion_cta: origen });
    mostrar('2');
  }

  function error(campo, id, mensaje) {
    document.getElementById(id).textContent = mensaje;
    if (mensaje) campo.setAttribute('aria-invalid', 'true'); else campo.removeAttribute('aria-invalid');
    return !mensaje;
  }

  // Valida el paso 2 y devuelve los datos, o null si falta algo.
  function validar() {
    var nombre = form.nombre.value.replace(/\s+/g, ' ').trim();
    var tel = form.telefono.value.trim();
    var digitos = tel.replace(/\D/g, '');
    var ok1 = error(form.nombre, 'pq-nombre-error', nombre.length < 3 ? 'Escriba su nombre completo.' : '');
    var ok2 = error(form.telefono, 'pq-telefono-error', (digitos.length < 7 || digitos.length > 15) ? 'Escriba un teléfono válido, solo con números.' : '');
    var ok3 = error(form.autoriza, 'pq-autoriza-error', form.autoriza.checked ? '' : 'Para continuar debe autorizar el tratamiento de sus datos.');
    if (!ok1) form.nombre.focus(); else if (!ok2) form.telefono.focus(); else if (!ok3) form.autoriza.focus();
    if (!(ok1 && ok2 && ok3)) return null;
    var area = elegido('area'), ciudad = elegido('ciudad'), urgencia = elegido('urgencia');
    return {
      nombre: nombre, telefono: tel, resumen: form.resumen.value.replace(/\s+/g, ' ').trim(),
      areaId: area, ciudadId: ciudad, urgenciaId: urgencia,
      area: texto(AREAS, area), ciudad: texto(CIUDADES, ciudad), urgencia: texto(URGENCIAS, urgencia)
    };
  }

  function confirmar(html) { q('ok').innerHTML = html; mostrar('ok'); }

  function porWhatsApp() {
    var d = validar();
    if (!d) return;
    var url = CPA.waUrl(CPA.waMensaje(d));
    evento('whatsapp_click', { area_juridica: d.areaId, ciudad: d.ciudadId, urgencia: d.urgenciaId, ubicacion_cta: origen, precalificado: true });
    var ventana = null;
    try { ventana = window.open(url, '_blank'); } catch (e) { ventana = null; }
    if (ventana) { try { ventana.opener = null; } catch (e) {} }
    else { window.location.href = url; return; } // bloqueada: se abre WhatsApp en esta misma pestaña
    confirmar('<h3>Se abrió WhatsApp con su mensaje</h3>' +
      '<p>Solo falta que lo envíe desde la aplicación. Un abogado de la firma revisará la viabilidad de su caso en horario de atención.</p>' +
      '<p>Si WhatsApp no se abrió, <a href="' + url + '" target="_blank" rel="noopener">ábralo desde aquí</a>.</p>');
  }

  function porCorreo(boton) {
    var d = validar();
    if (!d) return;
    if (form._honey.value) { confirmar('<h3>Solicitud recibida</h3>'); return; } // robots: no se envía nada
    q('error2').textContent = '';
    var original = boton.textContent;
    boton.disabled = true; boton.textContent = 'Enviando…';
    var cuerpo = {
      _subject: 'Nueva solicitud web — ' + d.area + ' — ' + d.ciudad,
      _template: 'table',
      _captcha: 'false',
      'Nombre': d.nombre,
      'Teléfono': d.telefono,
      'Área': d.area,
      'Ciudad o modalidad': d.ciudad,
      'Tipo de necesidad': d.urgencia,
      'Resumen': d.resumen || '(sin resumen)',
      'Autorización de datos (Ley 1581 de 2012)': 'Sí, otorgada el ' + new Date().toLocaleString('es-CO'),
      'Página de origen': location.href
    };
    fetch(ENVIO_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(cuerpo)
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok || String(j.success) !== 'true') throw new Error('envío rechazado');
      });
    }).then(function () {
      evento('lead_qualified_submit', { area_juridica: d.areaId, ciudad: d.ciudadId, urgencia: d.urgenciaId, ubicacion_cta: origen, canal: 'correo' });
      confirmar('<h3>Recibimos su solicitud</h3>' +
        '<p>Un abogado de la firma revisará la viabilidad de su caso y le contactará al teléfono que indicó, en horario de atención: lunes a viernes, de 8:00 a.&nbsp;m. a 12:00&nbsp;m. y de 2:00 a 6:00&nbsp;p.&nbsp;m.</p>' +
        '<p>Si su caso tiene un término o una audiencia próxima, llame al <a href="tel:+573104893626" data-cta="confirmacion">+57 310 489 3626</a>.</p>');
    }).catch(function () {
      q('error2').textContent = 'No fue posible enviar la solicitud. Puede continuar por WhatsApp o escribir a ' + CORREO + '.';
    }).then(function () {
      boton.disabled = false; boton.textContent = original;
    });
  }

  // Intercepta los botones de consulta: cualquier enlace a wa.me fuera del propio diálogo.
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var enlace = e.target.closest('a[href^="https://wa.me/"]');
    if (!enlace || enlace.closest('.pq')) return;
    e.preventDefault();
    abrir(enlace);
  });

  CPA.abrirPrecalificacion = abrir;
})();
