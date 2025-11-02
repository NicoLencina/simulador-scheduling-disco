// Script de autocompletado para el simulador de disco
console.log('Cargando funcionalidad de autocompletado...');

// Valores predeterminados recomendados
const valoresRecomendados = {
    stm: 0.5,
    vr: 7200,
    tt1s: 0.2,
    tb: 500,
    tp: 4,
    pc: 2,
    sc: 128,
    'initial-position': 0
};

console.log('Valores recomendados cargados:', valoresRecomendados);

// Función para autocompletar los campos con valores recomendados
function autocompletarCampos() {
    console.log('Iniciando autocompletado...');
    try {
        // Mostrar valores actuales
        ['stm', 'vr', 'tt1s', 'tb', 'tp', 'pc', 'sc', 'initial-position'].forEach(id => {
            const input = document.getElementById(id);
            console.log(`${id}: ${input ? input.value : 'no encontrado'}`);
        });

        // Establecer nuevos valores
        Object.entries(valoresRecomendados).forEach(([campo, valor]) => {
            const idCampo = campo === 'initialPosition' ? 'initial-position' : campo;
            console.log(`Buscando campo: ${idCampo}`);
            const inputElement = document.getElementById(idCampo);
            
            if (inputElement) {
                inputElement.style.transition = 'background-color 0.3s';
                inputElement.style.backgroundColor = '#e3f2fd';
                inputElement.value = valor;
                console.log(`Campo ${idCampo} actualizado a: ${valor}`);
                
                setTimeout(() => {
                    inputElement.style.backgroundColor = '';
                }, 500);
            } else {
                console.warn(`No se encontró el campo: ${idCampo}`);
            }
        });
    } catch (error) {
        console.error('Error al autocompletar:', error); // Debug
    }
}

// Inicializar la funcionalidad de autocompletado
function inicializarAutocompletado() {
    console.log('Configurando autocompletado...'); // Debug
    try {
        const btnAutocompletar = document.getElementById('btn-autocompletar');
        
        if (btnAutocompletar) {
            btnAutocompletar.addEventListener('click', (e) => {
                console.log('Ejecutando autocompletado...'); // Debug
                e.preventDefault();
                autocompletarCampos();
            });
        } else {
            console.warn('Error: No se encontró el botón de autocompletar'); // Debug
        }

        // Mostrar/ocultar tooltips de ayuda al hacer focus/blur en los inputs
        const inputs = document.querySelectorAll('input[type="number"]');
        console.log('Total de campos encontrados:', inputs.length); // Debug
        
        inputs.forEach(input => {
            const helpText = input.nextElementSibling;
            if (helpText && helpText.classList.contains('help-text')) {
                input.addEventListener('focus', () => {
                    helpText.style.opacity = '1';
                });
                input.addEventListener('blur', () => {
                    helpText.style.opacity = '0.7';
                });
            }
        });
    } catch (error) {
        console.error('Error en la inicialización:', error); // Debug
    }
}

// Asegurarnos de que el DOM esté cargado antes de inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarAutocompletado);
} else {
    inicializarAutocompletado();
}

// Hacer la función autocompletarCampos accesible globalmente
window.autocompletarCampos = autocompletarCampos;

// Exportar las funciones que necesitamos
export { inicializarAutocompletado };