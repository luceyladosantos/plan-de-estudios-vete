/* ========= Datos base: materias numeradas =========
   He incluido las materias (nº y nombre) con el orden típico del plan.
   Si alguna materia está nombrada diferente a tu versión, podés editar el array.
*/
const materias = [
  { num: 1, code: "1", name: "I.C.B.", year: 1 },
  { num: 2, code: "2", name: "Anatomía I", year: 1 },
  { num: 3, code: "3", name: "Bioestadística", year: 1 },
  { num: 4, code: "4", name: "Biofísica", year: 1 },
  { num: 5, code: "5", name: "Bioquímica", year: 1 },
  { num: 6, code: "6", name: "Histología y Embriología", year: 1 },

  { num: 7, code: "7", name: "Anatomía II", year: 2 },
  { num: 8, code: "8", name: "Bienestar Animal", year: 2 },
  { num: 9, code: "9", name: "Fisiología", year: 2 },
  { num: 10, code: "10", name: "Genética", year: 2 },
  { num: 11, code: "11", name: "Inglés Técnico", year: 2 },
  { num: 12, code: "12", name: "Microbiología", year: 2 },
  { num: 13, code: "13", name: "Sociología Rural y Urbana", year: 2 },
  { num: 14, code: "14", name: "Zoología y Ecología", year: 2 },

  { num: 15, code: "15", name: "Epidemiología", year: 3 },
  { num: 16, code: "16", name: "Farmacología y Toxicología", year: 3 },
  { num: 17, code: "17", name: "Inmunología", year: 3 },
  { num: 18, code: "18", name: "Introducción a la Producción Animal", year: 3 },
  { num: 19, code: "19", name: "Nutrición y Alimentación", year: 3 },
  { num: 20, code: "20", name: "Patología General y Sistemática", year: 3 },
  { num: 21, code: "21", name: "Seminología", year: 3 },
  { num: 22, code: "22", name: "Taller de Integración del Ciclo Básico", year: 3 },

  { num: 23, code: "23", name: "Cirugía y Anestesiología", year: 4 },
  { num: 24, code: "24", name: "Economía", year: 4 },
  { num: 25, code: "25", name: "Enfermedades Infecciosas", year: 4 },
  { num: 26, code: "26", name: "Enfermedades Parasitarias", year: 4 },
  { num: 27, code: "27", name: "Patología Médica", year: 4 },
  { num: 28, code: "28", name: "Patología Quirúrgica", year: 4 },

  { num: 29, code: "29", name: "Bromatología e Higiene Alimentaria", year: 5 },
  { num: 30, code: "30", name: "Clínica de Grandes Animales", year: 5 },
  { num: 31, code: "31", name: "Clínica de Pequeños Animales", year: 5 },
  { num: 32, code: "32", name: "Medicina Legal y Deontología", year: 5 },
  { num: 33, code: "33", name: "Producción de Aves", year: 5 },
  { num: 34, code: "34", name: "Producción Bovina", year: 5 },
  { num: 35, code: "35", name: "Producción de Pequeños Rumiantes y Cerdos", year: 5 },
  { num: 36, code: "36", name: "Producción No Tradicional", year: 5 },
  { num: 37, code: "37", name: "Salud Pública", year: 5 },
  { num: 38, code: "38", name: "Tecnología de los Alimentos", year: 5 },
  { num: 39, code: "39", name: "Taller de Prácticas Profesionales", year: 5 }
];

/* Estado del usuario */
const STORAGE_KEY = "malla_estado_v2";
let estado = {}; // { "1": { approved:false, regular:false }, ... }

/* correlativas internas: map num -> array of constraints.
   Cada constraint puede ser:
     - { type: 'all_year', year: 3 }   -> ALL 3
     - { type: 'and', options: [ {num:2, need: 'A'}, {num:6, need:'R'} ] } -> todos los items del array deben cumplirse
     - { type: 'or', alternatives: [ {num:3, need:'R'}, {num:5, need:'A'} ] } -> cualquiera
*/
let correlativas = {}; // se llenará al aplicar el texto del usuario o con defaults

/* ========== helpers de estado ========== */
function cargarEstadoInicial() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      estado = JSON.parse(raw);
      // asegurar que todas las materias existan
      materias.forEach(m => {
        if (!estado[m.code]) estado[m.code] = { approved:false, regular:false };
      });
      return;
    } catch(e){}
  }
  materias.forEach(m => estado[m.code] = { approved:false, regular:false });
  guardarEstado();
}
function guardarEstado(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
}
function resetEstado(){
  materias.forEach(m => estado[m.code] = { approved:false, regular:false });
  guardarEstado();
  renderizarMalla();
}

/* ========== lógica de evaluación de correlativas ==========
   Devuelve true si la materia (por objeto) está disponibile para cursar:
   - si no tiene correlativas definidas -> disponible
   - si correlativas exige ALL X -> verifica todas las materias del año X
   - otros casos -> evalúa las restricciones con approved/regular
*/
function puedeCursarPorNum(num) {
  const m = materias.find(x => x.num === num);
  if (!m) return false;
  const code = m.code;
  const reglas = correlativas[code];
  if (!reglas || reglas.length === 0) return true;

  // reglas es array; interpretamos que todas las entradas del array deben cumplirse (AND)
  return reglas.every(reg => evalRule(reg));
}

function evalRule(reg) {
  if (reg.type === 'all_year') {
    const year = reg.year;
    // todas las materias del año deben estar regularizadas o aprobadas
    const lista = materias.filter(x => x.year === year);
    return lista.every(mat => {
      const s = estado[mat.code];
      return s && (s.regular || s.approved);
    });
  } else if (reg.type === 'and') {
    // todas las opciones en options deben ser true
    return reg.options.every(opt => checkConstraint(opt));
  } else if (reg.type === 'or') {
    // cualquiera true
    return reg.alternatives.some(opt => checkConstraint(opt));
  }
  return false;
}

function checkConstraint(opt) {
  // opt: {num: N, need: 'A'|'R'}
  const mat = materias.find(x => x.num === opt.num);
  if (!mat) return false;
  const s = estado[mat.code];
  if (!s) return false;
  if (opt.need === 'A') return s.approved === true;
  if (opt.need === 'R') return s.approved === true || s.regular === true;
  return false;
}

/* ========== Renderizado ==========
*/
const mallaEl = document.getElementById("malla");

function agruparPorAnios() {
  const años = {};
  materias.forEach(m => {
    años[m.year] = años[m.year] || [];
    años[m.year].push(m);
  });
  return Object.keys(años).sort((a,b)=>a-b).map(y => ({ year: Number(y), items: años[y] }));
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
      sub.dataset.num = m.num;
      sub.dataset.code = m.code;

      const left = document.createElement("div");
      left.className = "sub-left";
      const name = document.createElement("div");
      name.className = "sub-name";
      name.textContent = `${m.num}. ${m.name}`;
      const meta = document.createElement("div");
      meta.className = "sub-meta";

      // mostrar correlativas en texto legible
      const reglas = correlativas[m.code];
      if (!reglas || reglas.length === 0) meta.textContent = "Sin correlativas definidas";
      else meta.textContent = reglasToText(reglas);

      left.appendChild(name);
      left.appendChild(meta);

      const right = document.createElement("div");
      const available = puedeCursarPorNum(m.num);
      const pill = document.createElement("span");
      pill.className = `pill ${available ? "available":"not-available"}`;
      pill.textContent = available ? "Disponible" : "No disponible";

      // marcador aprobado/regular
      const s = estado[m.code];
      if (s && s.approved) {
        const span = document.createElement("span");
        span.className = "approved-indicator";
        span.textContent = "Aprob.";
        left.appendChild(span);
      } else if (s && s.regular) {
        const span = document.createElement("span");
        span.className = "approved-indicator";
        span.style.color = "#ff8fbf";
        span.textContent = "Regular.";
        left.appendChild(span);
      }

      right.appendChild(pill);
      sub.appendChild(left);
      sub.appendChild(right);

      sub.addEventListener("click", ()=> openModal(m.num));

      col.appendChild(sub);
    });

    mallaEl.appendChild(col);
  });
}

function reglasToText(reglas) {
  // convierte una regla a string para mostrar
  return reglas.map(r => {
    if (r.type === 'all_year') return `Todo ${r.year}° año`;
    if (r.type === 'and') return r.options.map(o => `${o.num}(${o.need})`).join(", ");
    if (r.type === 'or') return "(" + r.alternatives.map(o => `${o.num}(${o.need})`).join(" ó ") + ")";
    return JSON.stringify(r);
  }).join(" && ");
}

/* ========== Modal ========= */
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");
const modalNum = document.getElementById("modal-num");
const modalYear = document.getElementById("modal-year");
const modalPrereqs = document.getElementById("modal-prereqs");
const modalStatus = document.getElementById("modal-status");
const btnClose = document.getElementById("modal-close");
const btnToggleApproved = document.getElementById("btn-toggle-approved");
const btnToggleRegular = document.getElementById("btn-toggle-regular");

let currentModalNum = null;

function openModal(num) {
  const m = materias.find(x=>x.num===num);
  currentModalNum = num;
  modalTitle.textContent = m.name;
  modalNum.textContent = m.num;
  modalYear.textContent = m.year + "º";
  modalPrereqs.innerHTML = "";
  const reglas = correlativas[m.code];
  if (!reglas || reglas.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Sin correlativas definidas";
    modalPrereqs.appendChild(li);
  } else {
    reglas.forEach(r => {
      const li = document.createElement("li");
      if (r.type === 'all_year') li.textContent = `Todas las materias de ${r.year}° año: ${listNamesOfYear(r.year).join(", ")}`;
      else if (r.type === 'and') li.textContent = r.options.map(o => `${o.num}(${o.need})`).join(", ");
      else if (r.type === 'or') li.textContent = r.alternatives.map(o => `${o.num}(${o.need})`).join(" ó ");
      modalPrereqs.appendChild(li);
    });
  }
  updateModalStatus();
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
}
function listNamesOfYear(year){
  return materias.filter(m=>m.year===year).map(m=>`${m.num}.${m.name}`);
}
function closeModal(){ modal.classList.add("hidden"); modal.setAttribute("aria-hidden", "true"); currentModalNum = null; }
btnClose.addEventListener("click", closeModal);
modal.addEventListener("click", (e)=>{ if (e.target === modal) closeModal(); });

function updateModalStatus(){
  if (!currentModalNum) return;
  const m = materias.find(x=>x.num===currentModalNum);
  const s = estado[m.code];
  modalStatus.textContent = s.approved ? "Aprobada" : (s.regular ? "Regularizada" : "No cursada");
  btnToggleApproved.textContent = s.approved ? "Quitar aprobada" : "Marcar como aprobada";
  btnToggleRegular.textContent = s.regular ? "Quitar regular" : "Marcar como regularizada";
}

btnToggleApproved.addEventListener("click", ()=>{
  if (!currentModalNum) return;
  const m = materias.find(x=>x.num===currentModalNum);
  estado[m.code].approved = !estado[m.code].approved;
  if (estado[m.code].approved) estado[m.code].regular = false;
  guardarEstado();
  updateModalStatus();
  renderizarMalla();
});
btnToggleRegular.addEventListener("click", ()=>{
  if (!currentModalNum) return;
  const m = materias.find(x=>x.num===currentModalNum);
  estado[m.code].regular = !estado[m.code].regular;
  guardarEstado();
  updateModalStatus();
  renderizarMalla();
});

/* ========== Parser de correlativas desde textarea ==========
   Formatos esperados por línea:
    - "7: 2(A), 6(R)"
    - "15: 10(A) OR 12(R)"
    - "30: ALL 3"  (todas las materias del 3er año)
   También acepta comas y 'ó' en español.
*/
const txt = document.getElementById("correl-text");
const btnApply = document.getElementById("btn-apply");
const btnFill = document.getElementById("btn-fill-sample");
const btnReset = document.getElementById("btn-reset");

btnApply.addEventListener("click", ()=>{
  const raw = txt.value.trim();
  if (!raw) {
    alert("Pega las correlativas o déjalo vacío para limpiar correlativas.");
    return;
  }
  const lines = raw.split(/\r?\n/).map(l=>l.trim()).filter(l=>l.length>0);
  const newCor = {};
  // init empty
  materias.forEach(m => newCor[m.code] = []);
  lines.forEach(line=>{
    // formato: "7: ..." o "7 - ..." etc
    const m = line.match(/^(\d+)\s*[:\-]\s*(.+)$/);
    if (!m) return;
    const targetNum = Number(m[1]);
    const right = m[2].trim();

    const mat = materias.find(x=>x.num===targetNum);
    if (!mat) return;
    const code = mat.code;

    // check ALL X
    const allMatch = right.match(/ALL\s*(\d+)/i);
    if (allMatch) {
      newCor[code].push({ type:'all_year', year: Number(allMatch[1]) });
      return;
    }
    // split by AND? We'll treat comma-separated groups as AND blocks
    // But also handle "OR" within a block by detecting ' OR ' or ' ó '
    const parts = right.split(',').map(p=>p.trim()).filter(Boolean);
    parts.forEach(p=>{
      // if contains OR
      if (/\bOR\b/i.test(p) || /ó/.test(p)) {
        // split by OR / ó
        const alts = p.split(/\bOR\b|ó/i).map(s=>s.trim()).filter(Boolean);
        const alternatives = alts.map(a=>{
          const mm = a.match(/(\d+)\s*\(?([AR]?)\)?/i);
          if (!mm) return null;
          const num = Number(mm[1]);
          const need = (mm[2] || 'R').toUpperCase(); // default R
          return { num, need };
        }).filter(Boolean);
        if (alternatives.length) newCor[code].push({ type:'or', alternatives });
      } else {
        // treat as AND group: e.g. "2(A) 6(R)" or "2(A) 6(R)" or "2(A) 6(R)"
        // split by spaces or just find all occurrences of (\d+)(A|R)
        const matches = [...p.matchAll(/(\d+)\s*\(?([AR]?)\)?/gi)];
        if (matches.length === 1) {
          const num = Number(matches[0][1]);
          const need = (matches[0][2] || 'R').toUpperCase();
          newCor[code].push({ type:'and', options: [{num, need}] });
        } else if (matches.length > 1) {
          const options = matches.map(mt => ({ num: Number(mt[1]), need: (mt[2]||'R').toUpperCase() }));
          newCor[code].push({ type:'and', options });
        }
      }
    });
  });

  correlativas = newCor;
  alert("Correlativas aplicadas. Ahora la malla se actualizará.");
  renderizarMalla();
});

btnFill.addEventListener("click", ()=>{
  // ejemplo rápido para que veas cómo pegar
  const ejemplo = [
    "7: 2(A)",
    "9: 5(A), 4(R)",
    "20: 2(A) 5(R)",
    "30: ALL 3",
    "25: 12(A) OR 15(R)"
  ].join("\n");
  txt.value = ejemplo;
});

btnReset.addEventListener("click", ()=>{
  if (!confirm("¿Querés resetear todas las materias (quitar aprobadas/regularizadas)?")) return;
  resetEstado();
});

/* ========== Inicialización por defecto ==========
   Por defecto correlativas = vacío (todas las materias mostradas como 'sin correlativas definidas'),
   para que pegues la tabla y se apliquen las reglas tal como figuren en tu plan.
*/
(function init(){
  // init estado
  cargarEstadoInicial();

  // init correlativas como vacías
  materias.forEach(m => correlativas[m.code] = []);

  // render
  renderizarMalla();
})();
