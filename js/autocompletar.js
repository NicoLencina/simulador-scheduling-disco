//necesito los rangos de config para validar
import ConfiguracionDisco from './config.js';


// valores q encontre buscando en internet sobre discos actuales
const valoresRecomendados = {
    stm: 0.5,          // ms/cilindro - valor típico para discos modernos
    vr: 7200,         // RPM - velocidad común en discos actuales
    tt1s: 0.2,        // ms - tiempo promedio de transferencia
    tb: 500,          // bloques por pista - valor realista
    tp: 4,            // total de platos - común en discos de consumo
    pc: 2,            // platos por cilindro - valor razonable
    sc: 128,          // sectores por cilindro - potencia de 2 común
    'initial-position': 0  // posición inicial del cabezal
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
 * le pongo una animacion copada cuando cambia el valor
 * dsps la saco para q no quede marcado
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



function configurarTooltips(inputs) {
    inputs.forEach(input => {
        const helpText = input.nextElementSibling;
        if (helpText?.classList.contains('help-text')) {
            input.addEventListener('focus', () => helpText.style.opacity = '1');
            input.addEventListener('blur', () => helpText.style.opacity = '0.7');
        }
    });
}

// esto inicializa todo - lo puse en una funcion x si hay q recargar
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