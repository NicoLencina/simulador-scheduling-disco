//necesito los rangos de config para validar
import ConfiguracionDisco from './config.js';


// Valores predeterminados basados en especificaciones típicas de discos modernos
const valoresRecomendados = {
    stm: 0.5,          // Tiempo de movimiento entre cilindros (ms/cilindro)
    vr: 7200,         // Velocidad de rotación (RPM) 
    tt1s: 0.2,        // Tiempo de transferencia por sector (ms)
    tb: 500,          // Bloques por pista
    tp: 4,            // Total de platos
    pc: 2,            // Platos por cilindro
    sc: 128,          // Sectores por cilindro
    'initial-position': 0  // Posición inicial del cabezal
};

// me fijo q los valores no se vayan de rango
Object.entries(valoresRecomendados).forEach(([campo, valor]) => {
    const nombreCampo = campo === 'initial-position' ? 'POS' : campo.toUpperCase();
    const rango = ConfiguracionDisco.RANGOS[nombreCampo];
    if (rango && (valor < rango.min || valor > rango.max)) {
        console.warn(`Valor recomendado fuera de rango para ${campo}: ${valor} [${rango.min}-${rango.max}]`);
    }
});

/**
 * campos q se pueden completar automaticamente
 * @type {string[]}
 */
const CAMPOS = ['stm', 'vr', 'tt1s', 'tb', 'tp', 'pc', 'sc', 'initial-position'];



/**
 * Actualiza el valor de un campo con una animación visual
 * @param {HTMLElement} elemento - El elemento input a actualizar
 * @param {number} valor - El nuevo valor a asignar
 */
function actualizarCampo(elemento, valor) {
    if (!elemento) return;
    
    elemento.style.transition = 'background-color 0.3s';
    elemento.style.backgroundColor = '#e3f2fd';
    elemento.value = valor;
    
    setTimeout(() => {
        elemento.style.backgroundColor = '';
    }, 500);
}


/**
 * Aplica los valores recomendados a todos los campos del formulario
 */
function autocompletarCampos() {
    try {
        // Recorro cada campo y lo actualizo si existe
        Object.entries(valoresRecomendados).forEach(([campo, valor]) => {
            const idCampo = campo === 'initialPosition' ? 'initial-position' : campo;
            const elemento = document.getElementById(idCampo);
            if (elemento) {
                actualizarCampo(elemento, valor);
            }
        });
    } catch (error) {
        console.error('Error al autocompletar:', error);
    }
}



/**
 * Configura los tooltips de ayuda para los campos de entrada
 * @param {NodeList} inputs - Lista de elementos input
 */
function configurarTooltips(inputs) {
    inputs.forEach(input => {
        const helpText = input.nextElementSibling;
        if (helpText?.classList.contains('help-text')) {
            input.addEventListener('focus', () => helpText.style.opacity = '1');
            input.addEventListener('blur', () => helpText.style.opacity = '0.7');
        }
    });
}

/**
 * Inicializa los eventos y comportamientos del autocompletado
 */
function inicializarAutocompletado() {
    try {
        // Configuro el botón d autocompletar
        const btnAutocompletar = document.getElementById('btn-autocompletar');
        btnAutocompletar?.addEventListener('click', (e) => {
            e.preventDefault();
            autocompletarCampos();
        });
        
        // Configuro los tooltips
        const inputs = document.querySelectorAll('input[type="number"]');
        configurarTooltips(inputs);
        
    } catch (error) {
        console.error('Error en la inicialización:', error);
    }
}

// arranco cuando carga la pagina
document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', inicializarAutocompletado)
    : inicializarAutocompletado();

// x ahora solo exporto esto, dsps veo si necesito mas
export { inicializarAutocompletado };