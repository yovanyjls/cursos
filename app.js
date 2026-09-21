const AREA_CLASS = {
  "Full Stack": "tag-fullstack",
  "Backend / Java": "tag-backend",
  "Android / Móvil": "tag-android",
  "Base de datos": "tag-database",
  "Seguridad / Ciberseguridad": "tag-security",
  "Inteligencia Artificial": "tag-ai",
  "Datos / BI": "tag-data",
  "Liderazgo / Coordinación": "tag-lead",
  "Legado (PHP/GeneXus)": "tag-legacy",
  "General / Compliance / Bienestar": "tag-general"
};

const MESES = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];

function fechaLegible(c) {
  if (c.enCurso) return "En curso";
  if (!c.fecha) return "—";
  const [y, m] = c.fecha.split("-");
  return `${MESES[parseInt(m, 10) - 1]} ${y}`;
}

function fechaOrden(c) {
  if (c.enCurso) return "9999-99";
  return c.fecha || "0000-00";
}

function primeraArea(c) {
  return c.area.split(",")[0].trim();
}

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

// ---------- claro / oscuro (manual, independiente del sistema operativo) ----------
// Se aplica de inmediato, antes de cargar los datos, para no parpadear con el tema equivocado.
const THEME_KEY = "cursos-tema-preferido";
const themeToggle = document.getElementById("themeToggle");

function aplicarTema(tema) {
  document.documentElement.setAttribute("data-theme", tema);
  themeToggle.textContent = tema === "dark" ? "☀️" : "🌙";
  themeToggle.setAttribute("aria-label", tema === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
}

let temaActual = localStorage.getItem(THEME_KEY)
  || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
aplicarTema(temaActual);

themeToggle.addEventListener("click", () => {
  temaActual = temaActual === "dark" ? "light" : "dark";
  localStorage.setItem(THEME_KEY, temaActual);
  aplicarTema(temaActual);
});

// ---------- datos + tabla ----------
let CURSOS = [];
let orden = { campo: "fecha", dir: "desc" };
let consulta = "";
let areaFiltro = "";

const tbody = document.getElementById("tbody");
const tally = document.getElementById("tally");
const emptyState = document.getElementById("emptyState");
const emptyQuery = document.getElementById("emptyQuery");
const searchSlot = document.getElementById("searchSlot");
const areaSelect = document.getElementById("areaSelect");
const buscador = document.getElementById("buscador");
const clearBtn = document.getElementById("clearBtn");

function coincide(c) {
  if (areaFiltro && !c.area.split(",").map(a => a.trim()).includes(areaFiltro)) return false;
  if (!consulta) return true;
  const q = consulta.toLowerCase();
  const enNombre = c.nombre.toLowerCase().includes(q);
  const enArea = c.area.toLowerCase().includes(q);
  const enClaves = c.claves.some(k => k.toLowerCase().includes(q));
  return enNombre || enArea || enClaves;
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

function pintar() {
  const filtrados = ordenar(CURSOS.filter(coincide));

  tbody.innerHTML = "";
  emptyState.hidden = filtrados.length > 0;
  emptyQuery.textContent = `“${consulta || areaFiltro}”`;

  for (const c of filtrados) {
    const tr = document.createElement("tr");
    const area1 = primeraArea(c);
    const tagClass = AREA_CLASS[area1] || "tag-general";

    const horasTxt = c.horas ? (Number.isInteger(c.horas) ? c.horas : c.horas.toFixed(1)) + " h" : "—";
    const certHtml = c.url
      ? `<a class="cert-link" href="${c.url}" target="_blank" rel="noopener">Ver certificado ↗</a>`
      : `<span class="cert-none">Sin registro digital</span>`;
    const fechaTxt = c.enCurso
      ? `<span class="badge-curso">En curso</span>`
      : fechaLegible(c);

    // Las palabras clave (c.claves) SOLO se usan para filtrar en coincide();
    // no se muestran en la fila a propósito, para no saturar la tabla.
    tr.innerHTML = `
      <td class="curso-cell">
        <div class="curso-nombre">${resaltar(c.nombre, consulta)}</div>
        <div class="chip-row">
          <span class="tag ${tagClass}">${resaltar(area1, consulta)}</span>
        </div>
      </td>
      <td class="institucion col-institucion">${escapeHtml(c.institucion)}</td>
      <td class="fecha">${fechaTxt}</td>
      <td class="horas num">${horasTxt}</td>
      <td>${certHtml}</td>
    `;
    tbody.appendChild(tr);
  }

  tally.innerHTML = filtrados.length === CURSOS.length
    ? `<strong>${CURSOS.length}</strong> registros`
    : `<strong>${filtrados.length}</strong> de ${CURSOS.length}`;
}

document.querySelectorAll("th.sortable").forEach(th => {
  th.addEventListener("click", () => {
    const campo = th.dataset.sort;
    if (orden.campo === campo) {
      orden.dir = orden.dir === "asc" ? "desc" : "asc";
    } else {
      orden = { campo, dir: campo === "fecha" ? "desc" : "asc" };
    }
    document.querySelectorAll("th.sortable").forEach(t => t.removeAttribute("aria-sort"));
    th.setAttribute("aria-sort", orden.dir === "asc" ? "ascending" : "descending");
    pintar();
  });
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

document.querySelector('th[data-sort="fecha"]').setAttribute("aria-sort", "descending");

fetch("cursos.json")
  .then(r => r.json())
  .then(data => {
    CURSOS = data;

    const areasUnicas = [...new Set(CURSOS.flatMap(c => c.area.split(",").map(a => a.trim())))].sort();
    for (const a of areasUnicas) {
      const opt = document.createElement("option");
      opt.value = a;
      opt.textContent = a;
      areaSelect.appendChild(opt);
    }

    pintar();
  })
  .catch(err => {
    tally.textContent = "Error al cargar cursos.json";
    console.error(err);
  });
