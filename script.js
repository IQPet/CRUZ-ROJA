// Cargar elementos
const btnBuscar = document.getElementById('btnBuscar');
const inputCodigo = document.getElementById('codigo');
const resultado = document.getElementById('resultado');
const noEncontrado = document.getElementById('noencontrado');

const codigoCertEl = document.getElementById('codigoCert');
const nombreEl = document.getElementById('nombre');
const ciEl = document.getElementById('ci');
const cursoEl = document.getElementById('curso');
const horasEl = document.getElementById('horas');
const modalidadEl = document.getElementById('modalidad');
const fechaEl = document.getElementById('fecha');
const btnWhatsApp = document.getElementById('btnImprimir');
const qrImage = document.getElementById('qrImage'); // elemento de la imagen QR

let certificates = [];

// Función para normalizar cadenas: solo alfanuméricos y minúsculas
const normalize = str => String(str).toLowerCase().replace(/[^a-z0-9]/g, '');

// Cargar JSON
fetch('certificates.json')
  .then(res => res.json())
  .then(data => {
    certificates = data;

    // Si la URL tiene ?id=... buscar directamente
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    if (id) {
      buscarYMostrar(id);
    }
  })
  .catch(err => {
    console.error('Error cargando certificados:', err);
  });

// Evento del botón de búsqueda
btnBuscar.addEventListener('click', () => {
  const q = inputCodigo.value.trim();
  if (!q) return;
  buscarYMostrar(q);
});

// Función para buscar y mostrar el certificado
function buscarYMostrar(q) {
  noEncontrado.classList.add('hidden');
  resultado.classList.add('hidden');

  const qlow = normalize(q);

  // Buscar coincidencias exactas por código o por CI
  const matches = certificates.filter(c => {
    const code = normalize(c.code);
    const ci = normalize(c.ci);
    return code === qlow || ci === qlow;
  });

  if (matches.length === 0) {
    noEncontrado.classList.remove('hidden');
    qrImage.src = ''; // Limpiar QR si no se encuentra
    qrImage.alt = 'Código del certificado';
    qrImage.style.animation = 'none';
    return;
  }

  if (matches.length === 1) {
    // Mostrar directamente si solo hay un certificado
    mostrarCertificado(matches[0]);
  } else {
    // Si hay varios certificados (ej. mismo CI), mostrar lista para elegir
    mostrarLista(matches);
  }
}

// Función para mostrar un certificado
function mostrarCertificado(cert) {
  codigoCertEl.textContent = cert.code || '';
  nombreEl.textContent = cert.nombre || '';
  ciEl.textContent = cert.ci || '';
  cursoEl.textContent = cert.curso || '';
  horasEl.textContent = cert.horas || '';
  modalidadEl.textContent = cert.modalidad || '';
  fechaEl.textContent = cert.fecha || '';

  if (cert.qr) {
    qrImage.style.animation = 'none';
    qrImage.src = cert.qr + "?t=" + new Date().getTime();
    qrImage.alt = `Código del certificado ${cert.code}`;
    void qrImage.offsetHeight; // reflow
    qrImage.style.animation = 'qrPulse 2s infinite alternate';
  } else {
    qrImage.src = '';
    qrImage.alt = 'Código del certificado';
    qrImage.style.animation = 'none';
  }

  resultado.classList.remove('hidden');
  noEncontrado.classList.add('hidden');

  history.replaceState(null, '', `?id=${encodeURIComponent(cert.code)}`);
}

// Función para mostrar lista de certificados cuando hay varios
function mostrarLista(certs) {
  // Limpiar resultado y preparar lista
  resultado.classList.remove('hidden');
  noEncontrado.classList.add('hidden');

  const listaDiv = document.createElement('div');
  listaDiv.className = 'lista-certificados';
  listaDiv.innerHTML = '<p>Se encontraron varios certificados, seleccione uno:</p>';

  certs.forEach(c => {
    const btn = document.createElement('button');
    btn.textContent = `${c.code} — ${c.curso}`;
    btn.addEventListener('click', () => mostrarCertificado(c));
    listaDiv.appendChild(btn);
  });

  // Reemplazar contenido del resultado con la lista
  resultado.innerHTML = '';
  resultado.appendChild(listaDiv);
}

// Botón WhatsApp
btnWhatsApp.addEventListener('click', () => {
  if (!codigoCertEl.textContent) return;
  const url = `https://wa.me/59173952743?text=Hola,%20quiero%20información%20sobre%20el%20certificado%20${encodeURIComponent(codigoCertEl.textContent)}`;
  window.open(url, '_blank');
});
