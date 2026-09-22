// ---------- configuracion: cambia SOLO estos dos valores para ajustar como
// abre la pagina para alguien que la visita por primera vez (sin
// preferencia guardada todavia en su navegador) ----------
const IDIOMA_INICIAL = "es"; // "es" o "en"
const TEMA_INICIAL = "light"; // "light" o "dark"
// -----------------------------------------------------------------------

const I18N = {
  es: {
    kicker: "Yovany Jesús López Serrano",
    titulo: "Cursos y certificaciones",
    subhead: "Busca por nombre, área o palabra clave (IA, AWS, SQL…), y ordena por curso o fecha haciendo clic en el encabezado. La URL real del certificado queda oculta detrás del botón “Ver certificado”.",
    searchPlaceholder: "Buscar por curso, área o palabra clave (ej. IA, AWS, SQL)…",
    clearAria: "Limpiar búsqueda",
    allAreas: "Todas las áreas",
    thCurso: "Curso",
    thInstitucion: "Institución",
    thFecha: "Fecha",
    thHoras: "Horas",
    thCertificado: "Certificado",
    verCertificado: "Ver certificado ↗",
    sinRegistro: "Sin registro digital",
    enCurso: "En curso",
    emptyPrefix: "Sin coincidencias para",
    registros: "registros",
    de: "de",
    meses: ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"],
    themeDark: "Cambiar a modo claro",
    themeLight: "Cambiar a modo oscuro",
    cargando: "Cargando…",
    error: "No se pudieron cargar los cursos.",
    sortAriaLabel: "Ordenar por",
    sortFechaDesc: "Fecha: más reciente primero",
    sortFechaAsc: "Fecha: más antigua primero",
    sortNombreAsc: "Curso: A → Z",
    sortNombreDesc: "Curso: Z → A"
  },
  en: {
    kicker: "Yovany Jesús López Serrano",
    titulo: "Courses & certifications",
    subhead: "Search by name, area or keyword (AI, AWS, SQL…), and sort by course or date by clicking the header. The real certificate URL stays hidden behind the “View certificate” button.",
    searchPlaceholder: "Search by course, area or keyword (e.g. AI, AWS, SQL)…",
    clearAria: "Clear search",
    allAreas: "All areas",
    thCurso: "Course",
    thInstitucion: "Institution",
    thFecha: "Date",
    thHoras: "Hours",
    thCertificado: "Certificate",
    verCertificado: "View certificate ↗",
    sinRegistro: "No digital record",
    enCurso: "In progress",
    emptyPrefix: "No matches for",
    registros: "records",
    de: "of",
    meses: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    themeDark: "Switch to light mode",
    themeLight: "Switch to dark mode",
    cargando: "Loading…",
    error: "Could not load the courses.",
    sortAriaLabel: "Sort by",
    sortFechaDesc: "Date: newest first",
    sortFechaAsc: "Date: oldest first",
    sortNombreAsc: "Course: A → Z",
    sortNombreDesc: "Course: Z → A"
  }
};

const AREA_CLASS = {
  "Full Stack": "tag-fullstack",
  "Backend / Java": "tag-backend",
  "Android / Móvil": "tag-android",
  "Android / Mobile": "tag-android",
  "Base de datos": "tag-database",
  "Database": "tag-database",
  "Seguridad / Ciberseguridad": "tag-security",
  "Security / Cybersecurity": "tag-security",
  "Inteligencia Artificial": "tag-ai",
  "Artificial Intelligence": "tag-ai",
  "Datos / BI": "tag-data",
  "Data / BI": "tag-data",
  "Liderazgo / Coordinación": "tag-lead",
  "Leadership / Coordination": "tag-lead",
  "Legado (PHP/GeneXus)": "tag-legacy",
  "Legacy (PHP/GeneXus)": "tag-legacy",
  "General / Compliance / Bienestar": "tag-general",
  "General / Compliance / Wellness": "tag-general"
};

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}

function resaltar(texto, consulta) {
  const safe = escapeHtml(texto);
  if (!consulta) return safe;
  const idx = safe.toLowerCase().indexOf(consulta.toLowerCase());
  if (idx === -1) return safe;
  return safe.slice(0, idx) + "<mark>" + safe.slice(idx, idx + consulta.length) + "</mark>" + safe.slice(idx + consulta.length);
}

const LANG_KEY = "cursos-idioma-preferido";
const THEME_KEY = "cursos-tema-preferido";

let idioma = localStorage.getItem(LANG_KEY) || IDIOMA_INICIAL;
let DATOS = { es: [], en: [] };
let orden = { campo: "fecha", dir: "desc" };
let consulta = "";
let areaFiltro = "";

const tbody = document.getElementById("tbody");
const tally = document.getElementById("tally");
const emptyState = document.getElementById("emptyState");
const emptyQuery = document.getElementById("emptyQuery");
const searchSlot = document.getElementById("searchSlot");
const areaSelect = document.getElementById("areaSelect");
const sortSelect = document.getElementById("sortSelect");
const buscador = document.getElementById("buscador");
const clearBtn = document.getElementById("clearBtn");
const themeToggle = document.getElementById("themeToggle");
const langEsBtn = document.getElementById("langEs");
const langEnBtn = document.getElementById("langEn");

function cursosActuales() { return DATOS[idioma]; }
function t() { return I18N[idioma]; }

function fechaLegible(c) {
  if (c.enCurso) return t().enCurso;
  if (!c.fecha) return "—";
  const [y, m] = c.fecha.split("-");
  return `${t().meses[parseInt(m, 10) - 1]} ${y}`;
}

function fechaOrden(c) {
  if (c.enCurso) return "9999-99";
  return c.fecha || "0000-00";
}

function primeraArea(c) { return c.area.split(",")[0].trim(); }

function coincide(c) {
  if (areaFiltro && !c.area.split(",").map(a => a.trim()).includes(areaFiltro)) return false;
  if (!consulta) return true;
  const q = consulta.toLowerCase();
  return c.nombre.toLowerCase().includes(q)
    || c.area.toLowerCase().includes(q)
    || c.claves.some(k => k.toLowerCase().includes(q));
}

function ordenar(lista) {
  const { campo, dir } = orden;
  const factor = dir === "asc" ? 1 : -1;
  return [...lista].sort((a, b) => {
    const va = campo === "fecha" ? fechaOrden(a) : a.nombre.toLowerCase();
    const vb = campo === "fecha" ? fechaOrden(b) : b.nombre.toLowerCase();
    if (va < vb) return -1 * factor;
    if (va > vb) return 1 * factor;
    return 0;
  });
}

function aplicarTextosEstaticos() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const clave = el.dataset.i18n;
    if (t()[clave]) el.textContent = t()[clave];
  });
  buscador.placeholder = t().searchPlaceholder;
  clearBtn.setAttribute("aria-label", t().clearAria);
  document.title = idioma === "es"
    ? "Cursos y Certificaciones — Yovany Jesús López Serrano"
    : "Courses & Certifications — Yovany Jesús López Serrano";
  poblarSortSelect();
}

function poblarSortSelect() {
  sortSelect.setAttribute("aria-label", t().sortAriaLabel);
  sortSelect.innerHTML = "";
  const opciones = [
    ["fecha:desc", t().sortFechaDesc],
    ["fecha:asc", t().sortFechaAsc],
    ["nombre:asc", t().sortNombreAsc],
    ["nombre:desc", t().sortNombreDesc]
  ];
  for (const [valor, etiqueta] of opciones) {
    const opt = document.createElement("option");
    opt.value = valor;
    opt.textContent = etiqueta;
    sortSelect.appendChild(opt);
  }
  sortSelect.value = `${orden.campo}:${orden.dir}`;
}

function fijarOrden(campo, dir) {
  orden = { campo, dir };
  document.querySelectorAll("th.sortable").forEach(t2 => t2.removeAttribute("aria-sort"));
  const th = document.querySelector(`th.sortable[data-sort="${campo}"]`);
  if (th) th.setAttribute("aria-sort", dir === "asc" ? "ascending" : "descending");
  sortSelect.value = `${campo}:${dir}`;
  pintar();
}

function repoblarAreas() {
  areaSelect.innerHTML = "";
  const optTodas = document.createElement("option");
  optTodas.value = "";
  optTodas.textContent = t().allAreas;
  areaSelect.appendChild(optTodas);
  const areasUnicas = [...new Set(cursosActuales().flatMap(c => c.area.split(",").map(a => a.trim())))].sort();
  for (const a of areasUnicas) {
    const opt = document.createElement("option");
    opt.value = a;
    opt.textContent = a;
    areaSelect.appendChild(opt);
  }
  areaFiltro = "";
  areaSelect.value = "";
}

function pintar() {
  const filtrados = ordenar(cursosActuales().filter(coincide));

  tbody.innerHTML = "";
  emptyState.hidden = filtrados.length > 0;
  emptyQuery.textContent = `“${consulta || areaFiltro}”`;

  for (const c of filtrados) {
    const tr = document.createElement("tr");
    const area1 = primeraArea(c);
    const tagClass = AREA_CLASS[area1] || "tag-general";

    const horasTxt = c.horas ? (Number.isInteger(c.horas) ? c.horas : c.horas.toFixed(1)) + " h" : "—";
    const certHtml = c.url
      ? `<a class="cert-link" href="${c.url}" target="_blank" rel="noopener">${t().verCertificado}</a>`
      : `<span class="cert-none">${t().sinRegistro}</span>`;
    const fechaTxt = c.enCurso ? `<span class="badge-curso">${t().enCurso}</span>` : fechaLegible(c);

    tr.innerHTML = `
      <td class="curso-cell">
        <div class="curso-nombre">${resaltar(c.nombre, consulta)}</div>
        <div class="chip-row">
          <span class="tag ${tagClass}">${resaltar(area1, consulta)}</span>
        </div>
      </td>
      <td class="institucion col-institucion" data-label="${t().thInstitucion}">${escapeHtml(c.institucion)}</td>
      <td class="fecha" data-label="${t().thFecha}">${fechaTxt}</td>
      <td class="horas num" data-label="${t().thHoras}">${horasTxt}</td>
      <td class="cert-cell">${certHtml}</td>
    `;
    tbody.appendChild(tr);
  }

  tally.innerHTML = filtrados.length === cursosActuales().length
    ? `<strong>${cursosActuales().length}</strong> ${t().registros}`
    : `<strong>${filtrados.length}</strong> ${t().de} ${cursosActuales().length}`;
}

document.querySelectorAll("th.sortable").forEach(th => {
  th.addEventListener("click", () => {
    const campo = th.dataset.sort;
    const dir = orden.campo === campo
      ? (orden.dir === "asc" ? "desc" : "asc")
      : (campo === "fecha" ? "desc" : "asc");
    fijarOrden(campo, dir);
  });
});

sortSelect.addEventListener("change", (e) => {
  const [campo, dir] = e.target.value.split(":");
  fijarOrden(campo, dir);
});

buscador.addEventListener("input", (e) => {
  consulta = e.target.value.trim();
  searchSlot.classList.toggle("has-value", consulta.length > 0);
  pintar();
});

clearBtn.addEventListener("click", () => {
  buscador.value = "";
  consulta = "";
  searchSlot.classList.remove("has-value");
  buscador.focus();
  pintar();
});

areaSelect.addEventListener("change", (e) => {
  areaFiltro = e.target.value;
  pintar();
});

function reflejarBotonIdioma() {
  langEsBtn.classList.toggle("active", idioma === "es");
  langEnBtn.classList.toggle("active", idioma === "en");
  document.documentElement.lang = idioma;
}

function cambiarIdioma(nuevo) {
  if (idioma === nuevo) return;
  idioma = nuevo;
  localStorage.setItem(LANG_KEY, idioma);
  reflejarBotonIdioma();
  aplicarTextosEstaticos();
  repoblarAreas();
  pintar();
}

langEsBtn.addEventListener("click", () => cambiarIdioma("es"));
langEnBtn.addEventListener("click", () => cambiarIdioma("en"));

function aplicarTema(tema) {
  document.documentElement.setAttribute("data-theme", tema);
  themeToggle.textContent = tema === "dark" ? "☀️" : "🌙";
  themeToggle.setAttribute("aria-label", tema === "dark" ? t().themeDark : t().themeLight);
}

let temaActual = localStorage.getItem(THEME_KEY) || TEMA_INICIAL;
aplicarTema(temaActual);

themeToggle.addEventListener("click", () => {
  temaActual = temaActual === "dark" ? "light" : "dark";
  localStorage.setItem(THEME_KEY, temaActual);
  aplicarTema(temaActual);
});

document.querySelector('th[data-sort="fecha"]').setAttribute("aria-sort", "descending");

Promise.all([
  fetch("cursos.es.json").then(r => r.json()),
  fetch("cursos.en.json").then(r => r.json())
])
  .then(([es, en]) => {
    DATOS = { es, en };
    reflejarBotonIdioma();
    aplicarTextosEstaticos();
    repoblarAreas();
    pintar();
  })
  .catch(err => {
    tally.textContent = t().error;
    console.error(err);
  });
