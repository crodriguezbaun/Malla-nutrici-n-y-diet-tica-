/* =======================================================
   LÓGICA DE LA MALLA CURRICULAR INTERACTIVA
   - Marcado de ramos aprobados
   - Validación de requisitos (ramos bloqueados)
   - Mensajes de ramos faltantes
   - Persistencia en localStorage
   ======================================================= */

/* Clave única para guardar el estado en el navegador */
const STORAGE_KEY = "malla_nutricion_aprobados";

/* Mapa de requisitos: cada ramo tiene un arreglo de nombres de ramos requeridos */
const requisitos = {
    "Bioquímica I": ["Química básica", "Laboratorio química básica"],
    "Ciencia de alimentos I": [
        "Introducción a la Nutrición y a la Dietética",
        "Química básica",
        "Laboratorio química básica"
    ],
    "Laboratorio de Ciencia de alimentos I": [
        "Introducción a la Nutrición y a la Dietética",
        "Química básica",
        "Laboratorio química básica"
    ],
    "Bases Fisiológicas de la Nutrición": [
        "Introducción a la Nutrición y a la Dietética",
        "Bioquímica I"
    ],
    "Evaluación del Estado Nutricional": [
        "Bioquímica I"
    ],
    "Ciencia de alimentos II": [
        "Ciencia de alimentos I",
        "Laboratorio de Ciencia de alimentos I"
    ],
    "Laboratorio de Ciencia de alimentos II": [
        "Ciencia de alimentos I",
        "Laboratorio de Ciencia de alimentos I"
    ],
    "Nutrición materno infantil": [
        "Evaluación del Estado Nutricional",
        "Ciencia de alimentos II"
    ],
    "Antropología Alimentaria": [
        "Optativa",
        "Ciencia de alimentos II"
    ],
    "Fisiopatología": [
        "Bases Fisiológicas de la Nutrición"
    ],
    "Nutrición del adulto": [
        "Nutrición materno infantil"
    ],
    "Sistema agroalimentario": [
        "Antropología Alimentaria"
    ],
    "Epidemiología Nutricional I": [
        "Evaluación del Estado Nutricional"
    ],
    "Nutrición Clínica materno infantil": [
        "Nutrición materno infantil",
        "Fisiopatología"
    ],
    "Gerencia de servicios de alimentación y Nutrición": [
        "Fundamentos de Administración",
        "Nutrición del adulto"
    ],
    "Nutrición Clínica adultos": [
        "Fisiopatología",
        "Nutrición del adulto"
    ],
    "Nutrición pública": [
        "Epidemiología Nutricional I"
    ],
    "Práctica Nutrición Clínica materno infantil": [
        "Nutrición Clínica materno infantil"
    ],
    "Práctica de servicios de alimentación y Nutrición": [
        "Gerencia de servicios de alimentación y Nutrición"
    ],
    "Educación alimentaria y nutricional": [
        "Nutrición pública"
    ],
    "Fundamentos de investigación": [
        "Bioestadística Fundamental"
    ],
    "Práctica de Nutrición Clínica adultos": [
        "Nutrición Clínica adultos"
    ],
    "Práctica de Nutrición pública": [
        "Nutrición pública"
    ],
    "Disciplinar Optativa": [
        "Nutrición Clínica materno infantil",
        "Gerencia de servicios de alimentación y Nutrición",
        "Nutrición Clínica adultos",
        "Nutrición pública"
    ],
    "Trabajo de grado": [
        "Práctica de Nutrición Clínica adultos",
        "Práctica Nutrición Clínica materno infantil",
        "Práctica de Nutrición pública",
        "Práctica de servicios de alimentación y Nutrición"
    ]
};

/* Referencias a elementos del DOM */
const ramosDOM = document.querySelectorAll(".ramo");
const mensajeRequisitos = document.getElementById("mensajeRequisitos");
const mensajeTexto = document.getElementById("mensajeTexto");
const cerrarMensajeBtn = document.getElementById("cerrarMensaje");
const resetBtn = document.getElementById("resetBtn");

/* -----------------------------
   Funciones de ayuda
   ----------------------------- */

/**
 * Obtiene el conjunto de ramos aprobados desde localStorage.
 * Devuelve un Set con los nombres.
 */
function obtenerAprobadosDesdeStorage() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return new Set();
    try {
        const parsed = JSON.parse(data);
        return new Set(parsed);
    } catch (e) {
        console.error("Error al leer localStorage:", e);
        return new Set();
    }
}

/**
 * Guarda el conjunto de ramos aprobados en localStorage.
 * @param {Set<string>} aprobadosSet
 */
function guardarAprobadosEnStorage(aprobadosSet) {
    const arr = Array.from(aprobadosSet);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

/**
 * Verifica si un ramo puede aprobarse según sus requisitos.
 * Devuelve un objeto:
 *  - puedeAprobarse: boolean
 *  - faltantes: array de nombres de ramos requeridos no aprobados
 * @param {string} nombreRamo
 * @param {Set<string>} aprobadosSet
 */
function validarRequisitos(nombreRamo, aprobadosSet) {
    const reqs = requisitos[nombreRamo] || [];
    const faltantes = reqs.filter(ramoReq => !aprobadosSet.has(ramoReq));
    return {
        puedeAprobarse: faltantes.length === 0,
        faltantes
    };
}

/**
 * Muestra un mensaje con los requisitos faltantes.
 * @param {string} nombreRamo
 * @param {string[]} faltantes
 */
function mostrarMensajeRequisitos(nombreRamo, faltantes) {
    if (faltantes.length === 0) return;
    const lista = faltantes.join(", ");
    mensajeTexto.textContent = `Para aprobar "${nombreRamo}" aún te faltan: ${lista}.`;
    mensajeRequisitos.classList.remove("oculto");
}

/**
 * Oculta el mensaje de requisitos.
 */
function ocultarMensajeRequisitos() {
    mensajeRequisitos.classList.add("oculto");
}

/* -----------------------------
   Lógica principal de interacción
   ----------------------------- */

/* Estado actual de ramos aprobados */
let aprobados = obtenerAprobadosDesdeStorage();

/* Aplicar el estado inicial a los elementos del DOM */
ramosDOM.forEach((ramoEl) => {
    const nombre = ramoEl.dataset.ramo;
    if (aprobados.has(nombre)) {
        ramoEl.classList.add("aprobado");
    }
});

/* Manejar clicks en cada ramo */
ramosDOM.forEach((ramoEl) => {
    ramoEl.addEventListener("click", () => {
        const nombre = ramoEl.dataset.ramo;

        // Si ya está aprobado, lo desmarcamos directamente
        if (aprobados.has(nombre)) {
            aprobados.delete(nombre);
            ramoEl.classList.remove("aprobado");
            guardarAprobadosEnStorage(aprobados);
            ocultarMensajeRequisitos();
            return;
        }

        // Verificar requisitos antes de aprobar
        const { puedeAprobarse, faltantes } = validarRequisitos(nombre, aprobados);

        if (!puedeAprobarse) {
            // Feedback visual breve (borde en rojo + animación)
            ramoEl.classList.add("bloqueado-temporal");
            setTimeout(() => ramoEl.classList.remove("bloqueado-temporal"), 260);
            // Mostrar mensaje con los ramos faltantes
            mostrarMensajeRequisitos(nombre, faltantes);
            return;
        }

        // Si no hay requisitos pendientes, aprobar
        aprobados.add(nombre);
        ramoEl.classList.add("aprobado");
        guardarAprobadosEnStorage(aprobados);
        ocultarMensajeRequisitos();
    });
});

/* Botón para cerrar el mensaje de requisitos */
cerrarMensajeBtn.addEventListener("click", () => {
    ocultarMensajeRequisitos();
});

/* Botón para reiniciar todo el progreso */
resetBtn.addEventListener("click", () => {
    if (!confirm("¿Seguro que quieres reiniciar todos los ramos aprobados?")) {
        return;
    }

    aprobados.clear();
    guardarAprobadosEnStorage(aprobados);
    ramosDOM.forEach((ramoEl) => ramoEl.classList.remove("aprobado"));
    ocultarMensajeRequisitos();
});

