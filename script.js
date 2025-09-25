/* ========= Datos del plan =========
   Lista de materias extraídas del documento. 
   Cada materia: id (único), name, year (número), prereqs (array de ids).
   REGLA: una materia se puede cursar si todos sus prereqs están aprobados o regularizados.
*/

const materias = [
  /* 1º AÑO */
  { id: "ICB", name: "I.C.B.", year: 1, prereqs: [] },
  { id: "ANAT1", name: "Anatomía I", year: 1, prereqs: [] },
  { id: "BIOEST", name: "Bioestadística", year: 1, prereqs: [] },
  { id: "BIOFIS", name: "Biofísica", year: 1, prereqs: [] },
  { id: "BIOQUIM", name: "Bioquímica", year: 1, prereqs: [] },
  { id: "HISTEMB", name: "Histología y Embriología", year: 1, prereqs: [] },

  /* 2º AÑO */
  { id: "ANAT2", name: "Anatomía II", year: 2, prereqs: ["ANAT1"] },
  { id: "BIENESTAR", name: "Bienestar Animal", year: 2, prereqs: [] },
  { id: "FISIO", name: "Fisiología", year: 2, prereqs: ["BIOQUIM","BIOFIS"] },
  { id: "GENET", name: "Genética", year: 2, prereqs: ["BIOQUIM"] },
  { id: "INGTEC", name: "Inglés Técnico", year: 2, prereqs: [] },
  { id: "MICRO", name: "Microbiología", year: 2, prereqs: ["BIOQUIM"] },
  { id: "SOCIO", name: "Sociología Rural y Urbana", year: 2, prereqs: [] },
  { id: "ZOO", name: "Zoología y Ecología", year: 2, prereqs: [] },

  /* 3º AÑO */
  { id: "EPID", name: "Epidemiología", year: 3, prereqs: ["BIOEST"] },
  { id: "FARMA", name: "Farmacología y Toxicología", year: 3, prereqs: ["FISIO","MICRO"] },
  { id: "INMUNO", name: "Inmunología", year: 3, prereqs: ["MICRO"] },
  { id: "INTRO_PROD", name: "Introducción a la Producción Animal", year: 3, prereqs: [] },
  { id: "NUTRIC", name: "Nutrición y Alimentación", year: 3, prereqs: ["BIOQUIM"] },
  { id: "PATOLOG_GS", name: "Patología General y Sistemática", year: 3, prereqs: ["ANAT2","FISIO"] },
  { id: "SEMINO", name: "Seminología", year: 3, prereqs: ["ANAT2"] },
  { id: "TALLER_INTEGR", name: "Taller de Integración del Ciclo Básico", year: 3, prereqs: ["ICB"] },

  /* 4º AÑO */
  { id: "CIRUGIA", name: "Cirugía y Anestesiología", year: 4, prereqs: ["ANAT2","PATOLOG_GS"] },
  { id: "ECON", name: "Economía", year: 4, prereqs: [] },
  { id: "INFEC", name: "Enfermedades Infecciosas", year: 4, prereqs: ["MICRO","PATOLOG_GS"] },
  { id: "PARASIT", name: "Enfermedades Parasitarias", year: 4, prereqs: ["MICRO"] },
  { id: "PATO_MED", name: "Patología Médica", year: 4, prereqs: ["PATOLOG_GS"] },
  { id: "PATO_QUIR", name: "Patología Quirúrgica", year: 4, prereqs: ["CIRUGIA","PATOLOG_GS"] },

  /* 5º AÑO */
  { id: "BROMATO", name: "Bromatología e Higiene Alimentaria", year: 5, prereqs: ["BIOQUIM"] },
  { id: "CLIN_GRAN", name: "Clínica de Grandes Animales", year: 5, prereqs: ["CIRUGIA","PATO_MED"] },
  { id: "CLIN_PEQ", name: "Clínica de Pequeños Animales", year: 5, prereqs: ["CIRUGIA","PATO_MED"] },
  { id: "MED_LEGAL", name: "Medicina Legal y Deontología", year: 5, prereqs: [] },
  { id: "PROD_AVES", name: "Producción de Aves", year: 5, prereqs: ["INTRO_PROD","NUTRIC"] },
  { id: "PROD_BOV", name: "Producción Bovina", year: 5, prereqs: ["INTRO_PROD"] },
  { id: "PROD_RUM", name: "Producción de Pequeños Rumiantes y Cerdos", year: 5, prereqs: ["INTRO_PROD"] },
  { id: "PROD_NOTRAD", name: "Producción No Tradicional", year: 5, prereqs: ["INTRO_PROD"] },
  { id: "SALUD_PUBLICA", name: "Salud Pública", year: 5, prereqs: ["BROMATO"] },
  { id: "TEC_ALIM", name: "Tecnología de los Alimentos", year: 5, prereqs: ["BROMATO"] },
  { id: "TALLER_PRACT", name: "Taller de Prácticas Profesionales", year: 5, prereqs: [] }
];

/* ====== Estado del usuario (aprobadas / regularizadas) ======
   Guardado en localStorage para persistencia.
*/
const STORAGE_KEY = "malla_estado_v1";

let estado = {}; // { "ICB": { approved: false, regular: false }, ... }

function cargarEstadoInicial() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      estado = JSON.parse(raw);
      return;
    } catch(e){}
  }
  materias.forEach(m => {
    estado[m.id] = { approved: false, regular: false };
  });
  guardarEstado();
}
function guardarEstado() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
}

/* ====== Lógica para determinar si una materia puede cursarse ======
   Una materia es 'disponible' si todos sus prereqs tienen approved === true OR regular === true.
*/
function puedeCursar(materia) {
  if (!materia.prereqs || materia.prereqs.length === 0) return true;
  return materia.prereqs.every(pid => {
    const s = estado[pid];
    return s && (s.approved || s.regular);
  });
}

/* ====== Renderizado de la malla ====== */
const mallaEl = document.getElementById("malla");

function agruparPorAnios() {
  const años = {};
  materias.forEach(m => {
    años[m.year] = años[m.year] || [];
    años[m.year].push(m);
  });
  return Object.keys(años).sort((a,b)=>a-b).map(y => ({ year: Number(y), items: años[y] }));
}

function crearPill(text, className) {
  const span = document.createElement("span");
  span.className = `pill ${className}`;
  span.textContent = text;
  return span;
}

function renderizarMalla() {
  mallaEl.innerHTML = "";
  const grupos = agruparPorAnios();
  grupos.forEach(g => {
    const col = document.createElement("section");
    col.className = "year-column";
    const h = document.createElement("h3");
    h.textContent = `${g.year}º Año`;
    col.appendChild(h);

    g.items.forEach(m => {
      const sub = document.createElement("div");
      sub.className = "subject";
      sub.dataset.id = m.id;

      // left
      const left = document.createElement("div");
      left.className = "sub-left";
      const name = document.createElement("div");
      name.className = "sub-name";
      name.textContent = m.name;
      const meta = document.createElement("div");
      meta.className = "sub-meta";
      meta.textContent = m.prereqs.length ? `Correlativas: ${m.prereqs.join(", ")}` : "Sin correlativas";
      left.appendChild(name);
      left.appendChild(meta);

      // right: pill showing if available or not
      const right = document.createElement("div");
      const available = puedeCursar(m);
      const pill = document.createElement("span");
      pill.className = `pill ${available ? "available" : "not-available"}`;
      pill.textContent = available ? "Disponible" : "No disponible";

      // add approved small marker
      const approvedState = estado[m.id] && estado[m.id].approved;
      const regularState = estado[m.id] && estado[m.id].regular;
      if (approvedState) {
        const approvedSpan = document.createElement("span");
        approvedSpan.className = "approved-indicator";
        approvedSpan.textContent = "Aprob.";
        left.appendChild(approvedSpan);
      } else if (regularState) {
        const regSpan = document.createElement("span");
        regSpan.className = "approved-indicator";
        regSpan.style.color="#ff8fbf";
        regSpan.textContent = "Regular.";
        left.appendChild(regSpan);
      }

      right.appendChild(pill);
      sub.appendChild(left);
      sub.appendChild(right);

      // click handler -> abrir modal
      sub.addEventListener("click", ()=> openModal(m.id));

      col.appendChild(sub);
    });

    mallaEl.appendChild(col);
  });
}

/* ===== Modal management ===== */
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");
const modalYear = document.getElementById("modal-year");
const modalPrereqs = document.getElementById("modal-prereqs");
const modalStatus = document.getElementById("modal-status");
const btnClose = document.getElementById("modal-close");
const btnToggleApproved = document.getElementById("btn-toggle-approved");
const btnToggleRegular = document.getElementById("btn-toggle-regular");

let currentModalId = null;

function openModal(id) {
  currentModalId = id;
  const m = materias.find(x=>x.id===id);
  modalTitle.textContent = m.name;
  modalYear.textContent = m.year + "º";
  modalPrereqs.innerHTML = "";
  if (m.prereqs.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Sin correlativas";
    modalPrereqs.appendChild(li);
  } else {
    m.prereqs.forEach(pid => {
      const mat = materias.find(x=>x.id===pid);
      const li = document.createElement("li");
      li.textContent = `${pid} — ${mat ? mat.name : ""}`;
      modalPrereqs.appendChild(li);
    });
  }
  updateModalStatus();
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  currentModalId = null;
}

function updateModalStatus() {
  if (!currentModalId) return;
  const s = estado[currentModalId];
  modalStatus.textContent = s.approved ? "Aprobada" : (s.regular ? "Regularizada" : "No cursada");
  btnToggleApproved.textContent = s.approved ? "Desmarcar aprobada" : "Marcar como aprobada";
  btnToggleRegular.textContent = s.regular ? "Quitar regular" : "Marcar como regularizada";
}

btnClose.addEventListener("click", closeModal);
modal.addEventListener("click", (e)=>{
  if (e.target === modal) closeModal();
});

btnToggleApproved.addEventListener("click", ()=>{
  if (!currentModalId) return;
  estado[currentModalId].approved = !estado[currentModalId].approved;
  // if approved, clear regular (makes sense)
  if (estado[currentModalId].approved) estado[currentModalId].regular = false;
  guardarEstado();
  updateModalStatus();
  renderizarMalla();
});

btnToggleRegular.addEventListener("click", ()=>{
  if (!currentModalId) return;
  estado[currentModalId].regular = !estado[currentModalId].regular;
  // if regular set, do not auto-change approved
  guardarEstado();
  updateModalStatus();
  renderizarMalla();
});

/* ===== Inicialización ===== */
(function init(){
  cargarEstadoInicial();
  renderizarMalla();
})();
