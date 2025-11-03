// Importo las clases necesarias
import ConfiguracionDisco from './config.js';
import PeticionDisco from './request.js';
import * as utils from './utils.js';

// Hacer las clases disponibles globalmente
window.ConfiguracionDisco = ConfiguracionDisco;
window.PeticionDisco = PeticionDisco;
window.utils = utils;

//importo todos los algoritmos q voy a usar
import algoritmoFIFO from './algoritmos/fifo.js';
import algoritmoSSTF from './algoritmos/sstf.js';
import algoritmoSCAN from './algoritmos/scan.js';
import algoritmoCSCAN from './algoritmos/cscan.js';
import algoritmoLOOK from './algoritmos/look.js';
import algoritmoCLOOK from './algoritmos/clook.js';
import algoritmoFSCAN from './algoritmos/fscan.js';
import algoritmoNSTEPSCAN from './algoritmos/nstepscan.js';

//variables globales (no es la mejor practica pero bue, para este tp sirve)
let configDisco = new ConfiguracionDisco();
let listaPeticiones = [];

// Descripciones de los algoritmos
const descripcionesAlgoritmos = {
    fifo: "First In First Out - Atiende las peticiones en el orden exacto en que llegan, sin considerar su posición en el disco. Simple pero puede generar mucho movimiento.",
    sstf: "Shortest Seek Time First - Selecciona la petición más cercana a la posición actual del cabezal. Minimiza el tiempo de búsqueda pero puede causar inanición.",
    scan: "SCAN (Algoritmo del Ascensor) - El cabezal se mueve en una dirección atendiendo peticiones hasta llegar al final, luego invierte dirección. Distribución justa del servicio.",
    cscan: "Circular SCAN - Similar a SCAN pero al llegar al final retorna al inicio sin atender peticiones. Tiempo de espera más uniforme.",
    look: "LOOK - Variante de SCAN que solo va hasta la última petición en cada dirección, no hasta el final del disco. Más eficiente que SCAN.",
    clook: "Circular LOOK - Variante de C-SCAN que solo va hasta la última petición. Combina eficiencia de LOOK con uniformidad de C-SCAN.",
    fscan: "F-SCAN - Congela la cola de peticiones al comenzar un barrido. Las nuevas peticiones se atienden en el siguiente barrido. Previene inanición.",
    nstepscan: "N-STEP-SCAN - Procesa peticiones en grupos de N. Las peticiones que llegan durante el procesamiento esperan al siguiente grupo. Balance entre eficiencia y equidad."
};

//casos d prueba para verificar q todo ande bien
const casosDePrueba = [
    {
        nombre: "Caso Simple",
        peticiones: [0, 45, 20, 88, 15, 92, 150, 5, 35, 78, 98, 120, 44, 65, 25],
        config: {
            stm: 0.1,
            vr: 7200,
            tt1s: 0.02,
            tb: 64,
            tp: 4,
            pc: 2,
            sc: 32,
            posInicial: 50
        }
    },
    {
        nombre: "Caso con Movimientos Largos",
        peticiones: [0, 199, 0, 199, 50, 150, 25, 175, 100, 150, 0, 199, 100, 50, 25],
        config: {
            stm: 0.1,
            vr: 7200,
            tt1s: 0.02,
            tb: 64,
            tp: 4,
            pc: 2,
            sc: 32,
            posInicial: 100
        }
    }
];

// Función para autocompletar campos
function autocompletarCampos() {
    // Valores recomendados basados en discos duros reales
    // Ver documentos/VALORES_PARAMETROS.md para detalles técnicos
    const valoresRecomendados = {
        stm: 0.1,      // Seek Time Multiplier: 0.1 ms/cilindro (disco moderno rápido)
        vr: 7200,      // Velocidad Rotacional: 7200 RPM (estándar para discos SATA)
        tt1s: 0.1,     // Tiempo de Transferencia: 0.1 ms/sector (dentro del rango)
        tb: 500,       // Bloques por pista: 500 (valor medio del rango 100-1000)
        tp: 4,         // Total de platos: 4 (disco duro típico de 2TB)
        pc: 2,         // Platos por cilindro: 2 (lectura en ambas caras)
        sc: 128,       // Sectores por cilindro: 128 (valor medio del rango 32-256)
        'initial-position': 50,  // Posición inicial: cilindro 50 (zona media)
        requests: '45, 20, 88, 15, 92, 150, 5, 35, 78, 98, 120, 44, 65, 25, 100'  // 15 peticiones variadas
    };

    // Autocompletar cada campo con animación
    for (const [id, valor] of Object.entries(valoresRecomendados)) {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.value = valor;
            elemento.classList.remove('campo-error');
            elemento.classList.add('campo-completado');
            setTimeout(() => {
                elemento.classList.remove('campo-completado');
            }, 1000);
        }
    }
    
    // Limpiar mensajes de error
    limpiarErrores();
    
    // Mostrar mensaje de éxito
    mostrarNotificacion('Campos autocompletados correctamente', 'success');
}

// Función para limpiar todos los errores
function limpiarErrores() {
    document.querySelectorAll('.campo-error').forEach(campo => {
        campo.classList.remove('campo-error');
    });
    document.querySelectorAll('.mensaje-error').forEach(msg => {
        msg.remove();
    });
}

// Función para mostrar error en un campo específico
function mostrarErrorCampo(idCampo, mensaje) {
    const campo = document.getElementById(idCampo);
    if (campo) {
        campo.classList.add('campo-error');
        
        // Remover mensaje anterior si existe
        const grupoFormulario = campo.closest('.grupo-formulario');
        const mensajeAnterior = grupoFormulario.querySelector('.mensaje-error');
        if (mensajeAnterior) {
            mensajeAnterior.remove();
        }
        
        // Agregar nuevo mensaje
        const mensajeError = document.createElement('span');
        mensajeError.className = 'mensaje-error';
        mensajeError.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${mensaje}`;
        grupoFormulario.appendChild(mensajeError);
        
        // Scroll al campo con error
        campo.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'error') {
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion notificacion-${tipo}`;
    
    const icono = tipo === 'success' ? 'check-circle' : 
                  tipo === 'warning' ? 'exclamation-triangle' : 'times-circle';
    
    notificacion.innerHTML = `
        <i class="fas fa-${icono}"></i>
        <span>${mensaje}</span>
    `;
    
    document.body.appendChild(notificacion);
    
    // Animar entrada
    setTimeout(() => notificacion.classList.add('mostrar'), 10);
    
    // Remover después de 4 segundos
    setTimeout(() => {
        notificacion.classList.remove('mostrar');
        setTimeout(() => notificacion.remove(), 300);
    }, 4000);
}

//cuando carga la pagina conecto todos los eventos
window.addEventListener('load', () => {
    console.log('Iniciando aplicación...');
    
    // Inicializar la configuración del disco
    configDisco = new ConfiguracionDisco();
    console.log('Configuración inicial creada:', configDisco);
    
    //botones principales
    document.getElementById('simular').addEventListener('click', iniciarSimulacion);
    document.getElementById('generar-random').addEventListener('click', generarPeticionesRandom);
    document.getElementById('btn-autocompletar').addEventListener('click', autocompletarCampos);
    
    //cuando cambia el algoritmo veo si necesito mostrar params extra
    document.getElementById('algoritmo').addEventListener('change', mostrarParamsExtra);
    
    //cuando cambia el modo de validación
    document.getElementById('modo-libre').addEventListener('change', cambiarModoValidacion);
    
    //cuando cambia el tipo de cálculo a mostrar
    const tipoCalculoSelect = document.getElementById('tipo-calculo');
    if (tipoCalculoSelect) {
        tipoCalculoSelect.addEventListener('change', function() {
            // Obtener las peticiones actuales de la última simulación
            if (listaPeticiones && listaPeticiones.length > 0) {
                mostrarCalculoDetallado(this.value, listaPeticiones);
            }
        });
    }
    
    //botón expandir/colapsar cálculos detallados
    const btnExpandir = document.getElementById('btn-expandir-calculo');
    if (btnExpandir) {
        btnExpandir.addEventListener('click', function() {
            const detalleDiv = document.getElementById('detalle-calculo');
            const contenidoCompleto = detalleDiv.getAttribute('data-completo');
            
            // Buscar si ya existe el div expandido
            let elementosExpandidos = detalleDiv.querySelectorAll('.contenido-expandido');
            
            if (elementosExpandidos.length > 0) {
                // Ya está expandido - colapsar
                elementosExpandidos.forEach(el => {
                    // Si es el resultado-final, solo quitar la clase expandido pero no eliminarlo
                    if (el.classList.contains('resultado-final')) {
                        el.classList.remove('contenido-expandido');
                    } else {
                        // Eliminar los demás elementos expandidos
                        el.remove();
                    }
                });
                
                // Contar cuántos pasos hay ocultos
                const pasosOcultos = detalleDiv.getAttribute('data-pasos-ocultos') || 0;
                if (pasosOcultos > 0) {
                    btnExpandir.innerHTML = `<i class="fas fa-chevron-down"></i> Ver más (${pasosOcultos} ocultos)`;
                } else {
                    btnExpandir.innerHTML = '<i class="fas fa-chevron-down"></i> Ver más';
                }
                btnExpandir.classList.remove('expandido');
            } else {
                // Expandir - agregar solo el contenido detallado
                if (contenidoCompleto && contenidoCompleto.trim() !== '') {
                    // Buscar y extraer el resultado final del contenido actual
                    const resultadoFinal = detalleDiv.querySelector('.resultado-final');
                    let resultadoHTML = '';
                    if (resultadoFinal) {
                        resultadoHTML = resultadoFinal.outerHTML;
                        resultadoFinal.classList.add('contenido-expandido'); // Marcar para restaurar después
                    }
                    
                    // Agregar contenido completo directamente (sin separador)
                    const divNuevo = document.createElement('div');
                    divNuevo.className = 'contenido-expandido';
                    divNuevo.innerHTML = contenidoCompleto;
                    detalleDiv.appendChild(divNuevo);
                    
                    // Mover el resultado final al final (no agregar otro, mover el existente)
                    if (resultadoFinal) {
                        detalleDiv.appendChild(resultadoFinal);
                    }
                    
                    btnExpandir.innerHTML = '<i class="fas fa-chevron-up"></i> Ver menos';
                    btnExpandir.classList.add('expandido');
                } else {
                    // No hay contenido adicional para mostrar
                    console.log('No hay contenido adicional para expandir');
                }
            }
        });
    }
    
    //botón expandir/colapsar tabla de peticiones
    const btnExpandirTabla = document.getElementById('btn-expandir-tabla');
    const tablaSecuencia = document.getElementById('sequence-table');
    if (btnExpandirTabla && tablaSecuencia) {
        btnExpandirTabla.addEventListener('click', function() {
            const isExpanded = tablaSecuencia.classList.contains('tabla-expandida');
            const totalFilas = tablaSecuencia.getElementsByTagName('tbody')[0].rows.length;
            const filasOcultas = Math.max(0, totalFilas - 5);
            
            if (isExpanded) {
                // Colapsar - mostrar solo primeras 5 filas
                tablaSecuencia.classList.remove('tabla-expandida');
                if (filasOcultas > 0) {
                    btnExpandirTabla.innerHTML = `<i class="fas fa-chevron-down"></i> Ver más (${filasOcultas} ocultas)`;
                } else {
                    btnExpandirTabla.innerHTML = '<i class="fas fa-chevron-down"></i> Ver más';
                }
            } else {
                // Expandir - mostrar todas las filas
                tablaSecuencia.classList.add('tabla-expandida');
                btnExpandirTabla.innerHTML = '<i class="fas fa-chevron-up"></i> Ver menos';
            }
        });
    }
    
    // Ya se inicializó configDisco arriba
    console.log('Configuración inicial creada:', configDisco);
});

//cambia entre modo estricto y modo libre
function cambiarModoValidacion() {
    const modoLibre = document.getElementById('modo-libre').checked;
    const modoTexto = document.getElementById('modo-texto');
    const modoDescripcion = document.getElementById('modo-descripcion');
    
    if (modoLibre) {
        modoTexto.textContent = 'Modo Libre';
        modoDescripcion.textContent = 'Valores personalizados sin restricciones';
        mostrarNotificacion('Modo Libre activado - Puedes usar cualquier valor', 'warning');
    } else {
        modoTexto.textContent = 'Modo Estricto';
        modoDescripcion.textContent = 'Valores dentro de rangos recomendados';
        mostrarNotificacion('Modo Estricto activado - Valores dentro de rangos', 'success');
    }
}

//genera una lista random de peticiones
function generarPeticionesRandom() {
    const cantidad = 15; //minimo q pidio el profe
    const maxCilindro = 199; //ponele q el disco tiene 200 cilindros
    
    let peticiones = [];
    for(let i = 0; i < cantidad; i++) {
        //genero numeros random entre 0 y maxCilindro
        const cilindro = Math.floor(Math.random() * (maxCilindro + 1));
        peticiones.push(cilindro);
    }
    
    //los muestro en el textarea
    document.getElementById('requests').value = peticiones.join(', ');
    
    // Limpiar error si existía
    const campo = document.getElementById('requests');
    campo.classList.remove('campo-error');
    const grupoFormulario = campo.closest('.grupo-formulario');
    const mensajeAnterior = grupoFormulario.querySelector('.mensaje-error');
    if (mensajeAnterior) {
        mensajeAnterior.remove();
    }
}

//muestra los params extra segun el algoritmo
function mostrarParamsExtra() {
    const algoritmo = document.getElementById('algoritmo').value;
    const paramsDiv = document.getElementById('algorithm-params');
    const nStepParam = document.querySelector('.n-step-param');
    
    //solo NSTEP necesita params extra x ahora
    if(algoritmo === 'nstepscan') {
        paramsDiv.classList.remove('oculto');
        nStepParam.classList.remove('oculto');
    } else {
        paramsDiv.classList.add('oculto');
        nStepParam.classList.add('oculto');
    }
}

//funcion principal q arranca la simulacion
function iniciarSimulacion() {
    // Limpiar errores previos
    limpiarErrores();
    
    try {
        //agarro todos los valores q puso el usuario
        const params = obtenerParametros();
        
        //actualizo la config del disco
        configDisco.establecerConfig(params);
        
        //creo la lista d peticiones
        const peticiones = procesarPeticiones(params.requests);
        
        //elijo el algoritmo y lo ejecuto
        const resultado = ejecutarAlgoritmo(params.algoritmo, peticiones);
        
        //muestro los resultados
        mostrarResultados(resultado, params.algoritmo);
        
        // Scroll automático a los resultados
        setTimeout(() => {
            document.getElementById('seccion-resultados').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }, 100);
        
        // Notificación de éxito
        mostrarNotificacion('Simulación completada exitosamente', 'success');
        
    } catch(error) {
        console.error('Error en simulación:', error);
        mostrarNotificacion(error.message || error, 'error');
    }
}

//levanta todos los valores d los inputs con validación
function obtenerParametros() {
    const modoLibre = document.getElementById('modo-libre').checked;
    
    const params = {
        stm: Number(document.getElementById('stm').value),
        vr: Number(document.getElementById('vr').value),
        tt1s: Number(document.getElementById('tt1s').value),
        tb: Number(document.getElementById('tb').value),
        tp: Number(document.getElementById('tp').value),
        pc: Number(document.getElementById('pc').value),
        sc: Number(document.getElementById('sc').value),
        posInicial: Number(document.getElementById('initial-position').value),
        algoritmo: document.getElementById('algoritmo').value,
        requests: document.getElementById('requests').value,
        nstep: Number(document.getElementById('n-step').value)
    };
    
    // Validar que no estén vacíos (siempre obligatorio)
    if (!params.stm || params.stm <= 0) {
        mostrarErrorCampo('stm', 'Ingrese el tiempo de búsqueda (STM). Debe ser mayor a 0.');
        throw new Error('Complete el campo STM');
    }
    
    if (!params.vr || params.vr <= 0) {
        mostrarErrorCampo('vr', 'Ingrese la velocidad rotacional (VR). Debe ser mayor a 0.');
        throw new Error('Complete el campo VR');
    }
    
    if (!params.tt1s || params.tt1s <= 0) {
        mostrarErrorCampo('tt1s', 'Ingrese el tiempo de transferencia (TT1S). Debe ser mayor a 0.');
        throw new Error('Complete el campo TT1S');
    }
    
    if (!params.tb || params.tb <= 0) {
        mostrarErrorCampo('tb', 'Ingrese bloques por pista (TB). Debe ser mayor a 0.');
        throw new Error('Complete el campo TB');
    }
    
    if (!params.tp || params.tp <= 0) {
        mostrarErrorCampo('tp', 'Ingrese total de platos (TP). Debe ser mayor a 0.');
        throw new Error('Complete el campo TP');
    }
    
    if (!params.pc || params.pc <= 0) {
        mostrarErrorCampo('pc', 'Ingrese platos por cilindro (PC). Debe ser mayor a 0.');
        throw new Error('Complete el campo PC');
    }
    
    if (!params.sc || params.sc <= 0) {
        mostrarErrorCampo('sc', 'Ingrese sectores por cilindro (SC). Debe ser mayor a 0.');
        throw new Error('Complete el campo SC');
    }
    
    if (isNaN(params.posInicial) || params.posInicial < 0) {
        mostrarErrorCampo('initial-position', 'Ingrese la posición inicial del cabezal (≥ 0)');
        throw new Error('Complete el campo Posición Inicial');
    }
    
    // Validar relación PC <= TP (siempre obligatorio)
    if (params.pc > params.tp) {
        mostrarErrorCampo('pc', `PC no puede ser mayor que TP (${params.tp})`);
        throw new Error('PC mayor que TP');
    }
    
    // Si está en modo estricto, validar rangos recomendados
    if (!modoLibre) {
        if (params.stm < 0.1 || params.stm > 1.0) {
            mostrarErrorCampo('stm', 'STM fuera de rango recomendado (0.1 - 1.0 ms). Active "Modo Libre" para usar valores personalizados.');
            throw new Error('STM fuera de rango');
        }
        
        if (params.vr < 5400 || params.vr > 15000) {
            mostrarErrorCampo('vr', 'VR fuera de rango recomendado (5400 - 15000 RPM). Active "Modo Libre" para usar valores personalizados.');
            throw new Error('VR fuera de rango');
        }
        
        if (params.tt1s < 0.1 || params.tt1s > 1.0) {
            mostrarErrorCampo('tt1s', 'TT1S fuera de rango recomendado (0.1 - 1.0 ms). Active "Modo Libre" para usar valores personalizados.');
            throw new Error('TT1S fuera de rango');
        }
        
        if (params.tb < 100 || params.tb > 1000) {
            mostrarErrorCampo('tb', 'TB fuera de rango recomendado (100 - 1000 bloques). Active "Modo Libre" para usar valores personalizados.');
            throw new Error('TB fuera de rango');
        }
        
        if (params.tp < 1 || params.tp > 8) {
            mostrarErrorCampo('tp', 'TP fuera de rango recomendado (1 - 8 platos). Active "Modo Libre" para usar valores personalizados.');
            throw new Error('TP fuera de rango');
        }
        
        if (params.sc < 32 || params.sc > 256) {
            mostrarErrorCampo('sc', 'SC fuera de rango recomendado (32 - 256 sectores). Active "Modo Libre" para usar valores personalizados.');
            throw new Error('SC fuera de rango');
        }
    }
    
    return params;
}

//convierte el string d peticiones en objetos PeticionDisco
function procesarPeticiones(requestsStr) {
    if (!requestsStr || requestsStr.trim() === '') {
        mostrarErrorCampo('requests', 'Ingrese la lista de peticiones separadas por comas. Mínimo 15 peticiones.');
        throw new Error('No se han ingresado peticiones');
    }

    //separo x comas y limpio espacios
    const numeros = requestsStr.split(',')
        .map(n => n.trim())
        .filter(n => n !== '')
        .map(n => {
            const num = Number(n);
            if (isNaN(num)) {
                mostrarErrorCampo('requests', `Valor inválido: "${n}". Solo se permiten números separados por comas.`);
                throw new Error(`Petición inválida: "${n}"`);
            }
            if (num < 0) {
                mostrarErrorCampo('requests', `Valor negativo no permitido: ${n}. Los cilindros deben ser ≥ 0.`);
                throw new Error('Cilindro negativo');
            }
            return num;
        });
        
    if(numeros.length < 15) {
        mostrarErrorCampo('requests', `Insuficientes peticiones: ${numeros.length}/15. Agregue ${15 - numeros.length} más.`);
        throw new Error('Mínimo 15 peticiones requeridas');
    }
    
    //convierto cada numero en una PeticionDisco y calculo sus tiempos
    return numeros.map((n, i) => {
        const peticion = new PeticionDisco(n, i);
        // Calcular tiempos iniciales si es necesario
        if (i > 0) {
            peticion.calcularTiempos(configDisco, numeros[i-1]);
        } else {
            peticion.calcularTiempos(configDisco, configDisco.posicionActual);
        }
        return peticion;
    });
}

//ejecuta el algoritmo seleccionado
function ejecutarAlgoritmo(algoritmo, peticiones) {
    switch(algoritmo) {
        case 'fifo':
            return algoritmoFIFO(peticiones, configDisco);
        case 'sstf':
            return algoritmoSSTF(peticiones, configDisco);
        case 'scan':
            return algoritmoSCAN(peticiones, configDisco);
        case 'cscan':
            return algoritmoCSCAN(peticiones, configDisco);
        case 'look':
            return algoritmoLOOK(peticiones, configDisco);
        case 'clook':
            return algoritmoCLOOK(peticiones, configDisco);
        case 'fscan':
            return algoritmoFSCAN(peticiones, configDisco);
        case 'nstepscan':
            const N = Number(document.getElementById('n-step').value);
            return algoritmoNSTEPSCAN(peticiones, configDisco, N);
        default:
            throw 'Algoritmo no valido';
    }
}

//muestra los resultados en la tabla y el grafico
function mostrarResultados(peticiones, algoritmo) {
    if (!Array.isArray(peticiones) || peticiones.length === 0) {
        console.error('No hay peticiones para mostrar');
        return;
    }

    // Guardar peticiones procesadas globalmente para el selector de cálculos
    listaPeticiones = peticiones;

    //muestro la seccion d resultados
    document.getElementById('seccion-resultados').classList.remove('oculto');
    
    // Actualizo nombre y descripción del algoritmo
    const nombreAlgoritmo = document.getElementById('nombre-algoritmo');
    const descripcionAlgoritmo = document.getElementById('descripcion-algoritmo');
    
    nombreAlgoritmo.textContent = algoritmo.toUpperCase();
    descripcionAlgoritmo.textContent = descripcionesAlgoritmos[algoritmo] || 'Algoritmo de scheduling de disco.';
    
    //calculo estadisticas
    let tiempoBusquedaTotal = 0;
    let tiempoRotacionTotal = 0;
    let tiempoTransferenciaTotal = 0;
    let tiempoAccesoTotal = 0;
    let distanciaTotal = 0;
    
    // Empezamos desde la posición inicial del cabezal
    let posicionAnterior = configDisco.posicionActual;
    
    //limpio la tabla y reseteo el estado de expandir
    const tablaSecuencia = document.getElementById('sequence-table');
    const tabla = tablaSecuencia.getElementsByTagName('tbody')[0];
    tabla.innerHTML = '';
    tablaSecuencia.classList.remove('tabla-expandida');
    
    // Resetear el botón de expandir tabla
    const btnExpandirTabla = document.getElementById('btn-expandir-tabla');
    if (btnExpandirTabla) {
        btnExpandirTabla.innerHTML = '<i class="fas fa-chevron-down"></i> Ver más';
    }
    
    //variables para el grafico
    const cilindros = [];
    const tiempos = [];
    
    //proceso cada peticion
    peticiones.forEach((p, i) => {
        // Validar que los valores existan y sean números
        const tiempoBusqueda = Number(p.tiempoBusqueda) || 0;
        const retrasoRotacional = Number(p.retrasoRotacional) || 0;
        const tiempoTransferencia = Number(p.tiempoTransferencia) || 0;
        const tiempoTotal = tiempoBusqueda + retrasoRotacional + tiempoTransferencia;
        
        //sumo los tiempos
        tiempoBusquedaTotal += tiempoBusqueda;
        tiempoRotacionTotal += retrasoRotacional;
        tiempoTransferenciaTotal += tiempoTransferencia;
        tiempoAccesoTotal += tiempoTotal;
        
        //calculo distancia desde la posición anterior (incluye la posición inicial para la primera petición)
        distanciaTotal += Math.abs(p.cilindro - posicionAnterior);
        posicionAnterior = p.cilindro;
        
        //agrego la fila a la tabla
        const fila = tabla.insertRow();
        fila.insertCell(0).textContent = i + 1;
        fila.insertCell(1).textContent = p.cilindro || 0;
        fila.insertCell(2).textContent = tiempoBusqueda.toFixed(2);
        fila.insertCell(3).textContent = retrasoRotacional.toFixed(2);
        fila.insertCell(4).textContent = tiempoTransferencia.toFixed(2);
        fila.insertCell(5).textContent = tiempoTotal.toFixed(2);
        
        //guardo datos para el grafico
        cilindros.push(p.cilindro || 0);
        tiempos.push(p.tiempoProceso || 0);
    });
    
    //actualizo los totales
    document.getElementById('distancia-total').textContent = distanciaTotal;
    document.getElementById('tiempo-busqueda-total').textContent = tiempoBusquedaTotal.toFixed(2);
    document.getElementById('tiempo-rotacion-total').textContent = tiempoRotacionTotal.toFixed(2);
    document.getElementById('tiempo-transferencia-total').textContent = tiempoTransferenciaTotal.toFixed(2);
    document.getElementById('tiempo-acceso-total').textContent = tiempoAccesoTotal.toFixed(2);
    
    // Actualizar el texto del botón de expandir tabla según la cantidad de filas
    const totalFilas = peticiones.length;
    const filasOcultas = Math.max(0, totalFilas - 5);
    if (btnExpandirTabla && filasOcultas > 0) {
        btnExpandirTabla.innerHTML = `<i class="fas fa-chevron-down"></i> Ver más (${filasOcultas} ocultas)`;
        btnExpandirTabla.style.display = 'block';
    } else if (btnExpandirTabla) {
        btnExpandirTabla.style.display = 'none'; // Ocultar botón si hay 5 o menos filas
    }
    
    //muestro los cálculos detallados (por defecto distancia) usando la posición inicial del disco
    mostrarCalculoDetallado('distancia', peticiones, configDisco.posicionActual);
    
    //dibujo todos los graficos
    dibujarGrafico(cilindros, tiempos);
    dibujarGraficoTiempos(tiempoBusquedaTotal, tiempoRotacionTotal, tiempoTransferenciaTotal);
    dibujarGraficoCircular(tiempoBusquedaTotal, tiempoRotacionTotal, tiempoTransferenciaTotal);
    dibujarGraficoDistancias(peticiones, configDisco.posicionActual);
}

//funcion para probar todos los algoritmos con casos d prueba
// Función para mostrar los cálculos detallados (resumido y completo)
function mostrarCalculoDetallado(tipoCalculo, peticiones, posicionInicialParam = null) {
    const detalleDiv = document.getElementById('detalle-calculo');
    const posInicial = posicionInicialParam !== null ? posicionInicialParam : configDisco.posicionActual;
    let htmlResumido = '';
    let htmlCompleto = '';
    
    switch(tipoCalculo) {
        case 'distancia':
            let posAnterior = posInicial;
            let suma = '';
            let distTotal = 0;
            
            // Calcular total
            peticiones.forEach((p, i) => {
                const dist = Math.abs(p.cilindro - posAnterior);
                distTotal += dist;
                suma += (i > 0 ? ' + ' : '') + dist;
                posAnterior = p.cilindro;
            });
            
            // VERSIÓN RESUMIDA
            htmlResumido = '<span class="formula-titulo"><i class="fas fa-route"></i> Cálculo de Distancia Total</span>';
            htmlResumido += '<div class="paso"><span class="paso-numero">Fórmula:</span> Distancia = Σ |Cilindro<sub>actual</sub> - Cilindro<sub>anterior</sub>|</div>';
            
            // Primeros 3 pasos
            posAnterior = posInicial;
            const pasosAMostrar = Math.min(3, peticiones.length);
            for(let i = 0; i < pasosAMostrar; i++) {
                const p = peticiones[i];
                const dist = Math.abs(p.cilindro - posAnterior);
                htmlResumido += `<div class="paso">`;
                htmlResumido += `<span class="paso-numero">Paso ${i + 1}:</span> `;
                htmlResumido += `|${p.cilindro} - ${posAnterior}| = <span class="valor">${dist}</span> cilindros`;
                htmlResumido += `</div>`;
                posAnterior = p.cilindro;
            }
            
            // Siempre mostrar resultado final en la vista resumida
            htmlResumido += `<div class="resultado-final"><i class="fas fa-check-circle"></i> Resultado: ${distTotal} cilindros</div>`;
            
            // VERSIÓN COMPLETA - Pasos restantes (continuando la numeración)
            if(peticiones.length > 3) {
                posAnterior = peticiones[2].cilindro;
                
                for(let i = 3; i < peticiones.length; i++) {
                    const p = peticiones[i];
                    const dist = Math.abs(p.cilindro - posAnterior);
                    htmlCompleto += `<div class="paso">`;
                    htmlCompleto += `<span class="paso-numero">Paso ${i + 1}:</span> `;
                    htmlCompleto += `|${p.cilindro} - ${posAnterior}| = <span class="valor">${dist}</span> cilindros`;
                    htmlCompleto += `</div>`;
                    posAnterior = p.cilindro;
                }
            }
            break;
            
        case 'busqueda':
            let totalBusqueda = 0;
            let posAnt = posInicial;
            
            // Calcular total
            peticiones.forEach((p) => {
                const dist = Math.abs(p.cilindro - posAnt);
                totalBusqueda += dist * configDisco.multiplicadorTiempoBusqueda;
                posAnt = p.cilindro;
            });
            
            // VERSIÓN RESUMIDA
            htmlResumido = '<span class="formula-titulo"><i class="fas fa-search"></i> Tiempo de Búsqueda</span>';
            htmlResumido += '<div class="paso"><span class="paso-numero">Fórmula:</span> Tiempo = Distancia × STM</div>';
            htmlResumido += `<div class="paso"><span class="paso-numero">STM:</span> <span class="valor">${configDisco.multiplicadorTiempoBusqueda}</span> ms/cilindro</div>`;
            htmlResumido += `<div class="paso"><span class="paso-numero">Peticiones:</span> <span class="valor">${peticiones.length}</span></div>`;
            htmlResumido += `<div class="resultado-final"><i class="fas fa-clock"></i> Resultado: ${totalBusqueda.toFixed(2)} ms</div>`;
            
            // VERSIÓN COMPLETA - Desglose detallado por cada petición
            posAnt = posInicial;
            peticiones.forEach((p, i) => {
                const dist = Math.abs(p.cilindro - posAnt);
                const tiempo = dist * configDisco.multiplicadorTiempoBusqueda;
                
                htmlCompleto += `<div class="paso">`;
                htmlCompleto += `<span class="paso-numero">Petición ${i + 1}:</span> `;
                htmlCompleto += `${dist} cilindros × ${configDisco.multiplicadorTiempoBusqueda} ms = <span class="valor">${tiempo.toFixed(2)}</span> ms`;
                htmlCompleto += `</div>`;
                posAnt = p.cilindro;
            });
            break;
            
        case 'rotacion':
            const msPerRev = (60 * 1000) / configDisco.velocidadRotacional;
            const latencia = msPerRev / 2;
            const totalRotacion = latencia * peticiones.length;
            
            // VERSIÓN RESUMIDA
            htmlResumido = '<span class="formula-titulo"><i class="fas fa-sync"></i> Tiempo de Rotación</span>';
            htmlResumido += '<div class="paso"><span class="paso-numero">Fórmula:</span> (60,000 ms / RPM) / 2</div>';
            htmlResumido += `<div class="paso"><span class="paso-numero">Latencia:</span> <span class="valor">${latencia.toFixed(2)}</span> ms por petición</div>`;
            htmlResumido += `<div class="paso"><span class="paso-numero">Peticiones:</span> <span class="valor">${peticiones.length}</span></div>`;
            htmlResumido += `<div class="resultado-final"><i class="fas fa-sync"></i> Resultado: ${totalRotacion.toFixed(2)} ms</div>`;
            
            // VERSIÓN COMPLETA - Desglose paso a paso del cálculo
            htmlCompleto += `<div class="paso"><span class="paso-numero">Velocidad Rotacional:</span> <span class="valor">${configDisco.velocidadRotacional}</span> RPM</div>`;
            htmlCompleto += `<div class="paso"><span class="paso-numero">Milisegundos por revolución:</span> 60,000 ÷ ${configDisco.velocidadRotacional} = <span class="valor">${msPerRev.toFixed(2)}</span> ms</div>`;
            htmlCompleto += `<div class="paso"><span class="paso-numero">Latencia promedio (½ revolución):</span> ${msPerRev.toFixed(2)} ÷ 2 = <span class="valor">${latencia.toFixed(2)}</span> ms</div>`;
            htmlCompleto += `<div class="paso"><span class="paso-numero">Cálculo:</span> ${latencia.toFixed(2)} ms × ${peticiones.length} peticiones</div>`;
            break;
            
        case 'transferencia':
            const totalTransf = configDisco.tiempoTransferenciaSector * peticiones.length;
            
            // VERSIÓN RESUMIDA
            htmlResumido = '<span class="formula-titulo"><i class="fas fa-exchange-alt"></i> Tiempo de Transferencia</span>';
            htmlResumido += '<div class="paso"><span class="paso-numero">Fórmula:</span> TT1S × Peticiones</div>';
            htmlResumido += `<div class="paso"><span class="paso-numero">TT1S:</span> <span class="valor">${configDisco.tiempoTransferenciaSector}</span> ms/sector</div>`;
            htmlResumido += `<div class="paso"><span class="paso-numero">Peticiones:</span> <span class="valor">${peticiones.length}</span></div>`;
            htmlResumido += `<div class="resultado-final"><i class="fas fa-exchange-alt"></i> Resultado: ${totalTransf.toFixed(2)} ms</div>`;
            
            // VERSIÓN COMPLETA - Información adicional
            htmlCompleto += `<div class="paso"><span class="paso-numero">Explicación TT1S:</span> Tiempo de Transferencia por Sector</div>`;
            htmlCompleto += `<div class="paso"><span class="paso-numero">Asunción:</span> 1 sector por petición (estándar)</div>`;
            htmlCompleto += `<div class="paso"><span class="paso-numero">Cálculo detallado:</span> ${configDisco.tiempoTransferenciaSector} ms × ${peticiones.length} peticiones</div>`;
            break;
            
        case 'total':
            let tBusqueda = 0, tRotacion = 0, tTransf = 0;
            let posA = posInicial;
            
            peticiones.forEach((p) => {
                const dist = Math.abs(p.cilindro - posA);
                tBusqueda += dist * configDisco.multiplicadorTiempoBusqueda;
                tRotacion += ((60 * 1000) / configDisco.velocidadRotacional) / 2;
                tTransf += configDisco.tiempoTransferenciaSector;
                posA = p.cilindro;
            });
            
            const total = tBusqueda + tRotacion + tTransf;
            
            // VERSIÓN RESUMIDA
            htmlResumido = '<span class="formula-titulo"><i class="fas fa-calculator"></i> Tiempo Total de Acceso</span>';
            htmlResumido += '<div class="paso"><span class="paso-numero">Fórmula:</span> Búsqueda + Rotación + Transferencia</div>';
            htmlResumido += `<div class="paso"><span class="paso-numero">Búsqueda:</span> <span class="valor">${tBusqueda.toFixed(2)}</span> ms</div>`;
            htmlResumido += `<div class="paso"><span class="paso-numero">Rotación:</span> <span class="valor">${tRotacion.toFixed(2)}</span> ms</div>`;
            htmlResumido += `<div class="paso"><span class="paso-numero">Transferencia:</span> <span class="valor">${tTransf.toFixed(2)}</span> ms</div>`;
            htmlResumido += `<div class="resultado-final"><i class="fas fa-hourglass-end"></i> Resultado: ${total.toFixed(2)} ms</div>`;
            
            // VERSIÓN COMPLETA - Análisis detallado con porcentajes
            htmlCompleto += `<div class="paso"><span class="paso-numero">Análisis Porcentual:</span></div>`;
            htmlCompleto += `<div class="paso">• Búsqueda: ${(tBusqueda/total*100).toFixed(1)}% del total</div>`;
            htmlCompleto += `<div class="paso">• Rotación: ${(tRotacion/total*100).toFixed(1)}% del total</div>`;
            htmlCompleto += `<div class="paso">• Transferencia: ${(tTransf/total*100).toFixed(1)}% del total</div>`;
            
            // Determinar cuál componente es el dominante
            const max = Math.max(tBusqueda, tRotacion, tTransf);
            let dominante = '';
            if (max === tBusqueda) dominante = 'Búsqueda (movimiento del cabezal)';
            else if (max === tRotacion) dominante = 'Rotación (latencia rotacional)';
            else dominante = 'Transferencia (lectura de datos)';
            
            htmlCompleto += `<div class="paso"><span class="paso-numero">Componente dominante:</span> ${dominante}</div>`;
            htmlCompleto += `<div class="paso"><span class="paso-numero">Verificación de suma:</span> ${tBusqueda.toFixed(2)} + ${tRotacion.toFixed(2)} + ${tTransf.toFixed(2)}</div>`;
            break;
    }
    
    // Guardar ambas versiones en el div principal
    detalleDiv.innerHTML = htmlResumido;
    detalleDiv.setAttribute('data-resumido', htmlResumido);
    detalleDiv.setAttribute('data-completo', htmlCompleto);
    
    // Contar elementos ocultos según el tipo de cálculo
    let elementosOcultos = 0;
    if (tipoCalculo === 'distancia') {
        elementosOcultos = Math.max(0, peticiones.length - 3);
    } else if (tipoCalculo === 'busqueda') {
        elementosOcultos = peticiones.length; // todas las peticiones están ocultas en resumido
    }
    detalleDiv.setAttribute('data-pasos-ocultos', elementosOcultos);
    
    console.log('Mostrando cálculo:', tipoCalculo);
    console.log('HTML Resumido length:', htmlResumido.length);
    console.log('HTML Completo length:', htmlCompleto.length);
    
    // Resetear el botón expandir y limpiar contenido expandido previo
    const btnExpandir = document.getElementById('btn-expandir-calculo');
    if (btnExpandir) {
        if (elementosOcultos > 0 && htmlCompleto.trim() !== '') {
            btnExpandir.innerHTML = `<i class="fas fa-chevron-down"></i> Ver más (${elementosOcultos} ocultos)`;
            btnExpandir.style.display = 'block';
        } else if (htmlCompleto.trim() !== '') {
            btnExpandir.innerHTML = '<i class="fas fa-chevron-down"></i> Ver más';
            btnExpandir.style.display = 'block';
        } else {
            btnExpandir.style.display = 'none';
        }
        btnExpandir.classList.remove('expandido');
    }
    
    // Eliminar cualquier contenido expandido que pueda existir
    const elementosExpandidos = detalleDiv.querySelectorAll('.contenido-expandido');
    elementosExpandidos.forEach(el => el.remove());
}

//dibuja el grafico d movimiento del cabezal - versión mejorada
function dibujarGrafico(cilindros, tiempos) {
    const canvas = document.getElementById('grafico-movimiento');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Ajustar tamaño del canvas al contenedor
    canvas.width = canvas.offsetWidth;
    canvas.height = 500;
    
    // Márgenes más grandes para etiquetas
    const margenIzq = 80;
    const margenDer = 40;
    const margenTop = 40;
    const margenBot = 60;
    
    const anchoGrafico = canvas.width - margenIzq - margenDer;
    const altoGrafico = canvas.height - margenTop - margenBot;
    
    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Fondo con gradiente
    const gradienteFondo = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradienteFondo.addColorStop(0, '#f8f9fa');
    gradienteFondo.addColorStop(1, '#ffffff');
    ctx.fillStyle = gradienteFondo;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calcular escalas
    const maxCilindro = Math.max(...cilindros, configDisco.posicionActual);
    const minCilindro = Math.min(...cilindros, configDisco.posicionActual, 0);
    const rangoCilindros = maxCilindro - minCilindro || 1;
    
    // Agregar la posición inicial al principio
    const cilindrosCompletos = [configDisco.posicionActual, ...cilindros];
    const tiemposCompletos = [0, ...tiempos];
    
    const escalaX = anchoGrafico / (cilindrosCompletos.length - 1);
    const escalaY = altoGrafico / rangoCilindros;
    
    // Función auxiliar para convertir coordenadas
    const toCanvasX = (indice) => margenIzq + (indice * escalaX);
    const toCanvasY = (cilindro) => margenTop + altoGrafico - ((cilindro - minCilindro) * escalaY);
    
    // Dibujar cuadrícula horizontal (cilindros)
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    
    const numLineasH = 10;
    const stepCilindro = rangoCilindros / numLineasH;
    
    for (let i = 0; i <= numLineasH; i++) {
        const cilindro = minCilindro + (i * stepCilindro);
        const y = toCanvasY(cilindro);
        
        ctx.beginPath();
        ctx.moveTo(margenIzq, y);
        ctx.lineTo(canvas.width - margenDer, y);
        ctx.stroke();
        
        // Etiquetas del eje Y
        ctx.fillStyle = '#495057';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(cilindro), margenIzq - 10, y + 4);
    }
    
    ctx.setLineDash([]);
    
    // Dibujar ejes principales
    ctx.strokeStyle = '#495057';
    ctx.lineWidth = 2;
    
    // Eje Y
    ctx.beginPath();
    ctx.moveTo(margenIzq, margenTop);
    ctx.lineTo(margenIzq, canvas.height - margenBot);
    ctx.stroke();
    
    // Eje X
    ctx.beginPath();
    ctx.moveTo(margenIzq, canvas.height - margenBot);
    ctx.lineTo(canvas.width - margenDer, canvas.height - margenBot);
    ctx.stroke();
    
    // Etiquetas de los ejes
    ctx.fillStyle = '#212529';
    ctx.font = 'bold 14px Arial';
    
    // Etiqueta eje Y
    ctx.save();
    ctx.translate(20, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Cilindro', 0, 0);
    ctx.restore();
    
    // Etiqueta eje X
    ctx.textAlign = 'center';
    ctx.fillText('Secuencia de Peticiones', canvas.width / 2, canvas.height - 10);
    
    // Dibujar línea de movimiento con gradiente
    const gradienteLinea = ctx.createLinearGradient(margenIzq, 0, canvas.width - margenDer, 0);
    gradienteLinea.addColorStop(0, '#667eea');
    gradienteLinea.addColorStop(0.5, '#764ba2');
    gradienteLinea.addColorStop(1, '#f093fb');
    
    ctx.strokeStyle = gradienteLinea;
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(102, 126, 234, 0.4)';
    ctx.shadowBlur = 8;
    
    ctx.beginPath();
    ctx.moveTo(toCanvasX(0), toCanvasY(cilindrosCompletos[0]));
    
    for (let i = 1; i < cilindrosCompletos.length; i++) {
        ctx.lineTo(toCanvasX(i), toCanvasY(cilindrosCompletos[i]));
    }
    ctx.stroke();
    
    // Resetear sombra
    ctx.shadowBlur = 0;
    
    // Dibujar puntos en cada petición
    cilindrosCompletos.forEach((cilindro, i) => {
        const x = toCanvasX(i);
        const y = toCanvasY(cilindro);
        
        // Punto exterior (más grande)
        ctx.fillStyle = i === 0 ? '#28A745' : '#1976D2';
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Punto interior (blanco)
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Etiqueta del número de petición
        if (i % 2 === 0 || cilindrosCompletos.length <= 20) {
            ctx.fillStyle = '#495057';
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'center';
            
            // Alternar posición de etiquetas
            const offsetY = (i % 4 < 2) ? -15 : 25;
            ctx.fillText(i === 0 ? 'Inicio' : `#${i}`, x, canvas.height - margenBot + offsetY);
        }
        
        // Mostrar número de cilindro en cada punto
        ctx.fillStyle = i === 0 ? '#28A745' : '#764ba2';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'left';
        
        // Posicionar a la derecha del punto
        const offsetX = 12;
        const etiquetaY = y + 4;
        
        // Fondo blanco para mejor legibilidad
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        const textoAncho = ctx.measureText(cilindro.toString()).width;
        ctx.fillRect(x + offsetX - 2, etiquetaY - 10, textoAncho + 4, 14);
        
        // Texto del cilindro
        ctx.fillStyle = i === 0 ? '#28A745' : '#764ba2';
        ctx.fillText(cilindro, x + offsetX, etiquetaY);
    });
    
    // Leyenda
    const leyendaY = margenTop - 15;
    
    // Punto de inicio
    ctx.fillStyle = '#28A745';
    ctx.beginPath();
    ctx.arc(margenIzq + 20, leyendaY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#495057';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Posición Inicial', margenIzq + 35, leyendaY + 4);
    
    // Puntos de peticiones
    ctx.fillStyle = '#1976D2';
    ctx.beginPath();
    ctx.arc(margenIzq + 180, leyendaY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText('Peticiones', margenIzq + 195, leyendaY + 4);
    
    // Calcular y mostrar distancia total
    let distanciaTotal = 0;
    for (let i = 1; i < cilindrosCompletos.length; i++) {
        distanciaTotal += Math.abs(cilindrosCompletos[i] - cilindrosCompletos[i-1]);
    }
    
    // Mostrar métrica destacada
    ctx.fillStyle = '#764ba2';
    ctx.font = 'bold 13px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`Distancia: ${distanciaTotal} cilindros`, canvas.width - margenDer - 10, leyendaY + 4);
}

// Gráfico de barras - Distribución de tiempos
function dibujarGraficoTiempos(tiempoBusqueda, tiempoRotacion, tiempoTransferencia) {
    const canvas = document.getElementById('grafico-tiempos');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = 300;
    
    const margenTop = 40;
    const margenBottom = 75; // Más espacio para las etiquetas
    const margenLateral = 40; // Reducido para dar más espacio a las barras
    const anchoGrafico = canvas.width - (margenLateral * 2);
    const altoGrafico = canvas.height - margenTop - margenBottom;
    
    // Limpiar
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Fondo
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Datos
    const datos = [
        { label: 'Búsqueda', valor: tiempoBusqueda, color: '#667eea' },
        { label: 'Rotación', valor: tiempoRotacion, color: '#764ba2' },
        { label: 'Transferencia', valor: tiempoTransferencia, color: '#f093fb' }
    ];
    
    const maxValor = Math.max(...datos.map(d => d.valor));
    const escalaY = (altoGrafico - 30) / maxValor;
    
    // Calcular espaciado - barras anchas y bien separadas
    const numBarras = datos.length;
    const anchoBarra = 55; // Ancho fijo de 55px por barra
    const espacioEntre = 27; // 27px de separación entre barras
    const anchoTotalNecesario = (anchoBarra * numBarras) + (espacioEntre * (numBarras + 1));
    const offset = (anchoGrafico - anchoTotalNecesario) / 2; // Centrar las barras
    
    // Dibujar barras
    datos.forEach((dato, i) => {
        const x = margenLateral + offset + espacioEntre + (i * (anchoBarra + espacioEntre));
        const alturaBarra = dato.valor * escalaY;
        const y = canvas.height - margenBottom - alturaBarra;
        
        // Gradiente para la barra
        const gradiente = ctx.createLinearGradient(x, y, x, canvas.height - margenBottom);
        gradiente.addColorStop(0, dato.color);
        gradiente.addColorStop(1, dato.color + 'AA');
        
        // Barra
        ctx.fillStyle = gradiente;
        ctx.fillRect(x, y, anchoBarra, alturaBarra);
        
        // Borde de la barra
        ctx.strokeStyle = dato.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, anchoBarra, alturaBarra);
        
        // Valor encima de la barra con fondo
        const valorTexto = dato.valor.toFixed(2) + ' ms';
        ctx.font = 'bold 13px Arial';
        ctx.textAlign = 'center';
        const anchoTexto = ctx.measureText(valorTexto).width;
        
        // Fondo blanco para el texto
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillRect(x + anchoBarra / 2 - anchoTexto / 2 - 4, y - 24, anchoTexto + 8, 18);
        ctx.strokeStyle = dato.color;
        ctx.lineWidth = 1;
        ctx.strokeRect(x + anchoBarra / 2 - anchoTexto / 2 - 4, y - 24, anchoTexto + 8, 18);
        
        // Texto del valor
        ctx.fillStyle = '#212529';
        ctx.fillText(valorTexto, x + anchoBarra / 2, y - 10);
        
        // Etiqueta debajo - centrada, más grande y con más espacio
        ctx.fillStyle = '#212529';
        ctx.font = 'bold 13px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(dato.label, x + anchoBarra / 2, canvas.height - margenBottom + 35);
    });
    
    // Título del eje Y
    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#495057';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Tiempo (ms)', 0, 0);
    ctx.restore();
}

// Gráfico circular - Proporción de tiempos
function dibujarGraficoCircular(tiempoBusqueda, tiempoRotacion, tiempoTransferencia) {
    const canvas = document.getElementById('grafico-circular');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = 300;
    
    // Limpiar
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Fondo
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radio = Math.min(canvas.width, canvas.height) / 3;
    
    const total = tiempoBusqueda + tiempoRotacion + tiempoTransferencia;
    
    const datos = [
        { label: 'Búsqueda', valor: tiempoBusqueda, color: '#667eea', porcentaje: (tiempoBusqueda / total * 100) },
        { label: 'Rotación', valor: tiempoRotacion, color: '#764ba2', porcentaje: (tiempoRotacion / total * 100) },
        { label: 'Transferencia', valor: tiempoTransferencia, color: '#f093fb', porcentaje: (tiempoTransferencia / total * 100) }
    ];
    
    let anguloInicio = -Math.PI / 2;
    
    // Dibujar sectores
    datos.forEach((dato, i) => {
        const anguloFin = anguloInicio + (dato.valor / total) * Math.PI * 2;
        
        // Sector
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radio, anguloInicio, anguloFin);
        ctx.closePath();
        
        // Gradiente radial
        const gradiente = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radio);
        gradiente.addColorStop(0, dato.color + 'FF');
        gradiente.addColorStop(1, dato.color + 'AA');
        ctx.fillStyle = gradiente;
        ctx.fill();
        
        // Borde
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Porcentaje en el sector
        const anguloMedio = (anguloInicio + anguloFin) / 2;
        const textX = centerX + Math.cos(anguloMedio) * (radio * 0.7);
        const textY = centerY + Math.sin(anguloMedio) * (radio * 0.7);
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(dato.porcentaje.toFixed(1) + '%', textX, textY);
        
        anguloInicio = anguloFin;
    });
    
    // Leyenda
    const leyendaX = 20;
    let leyendaY = canvas.height - 80;
    
    datos.forEach((dato) => {
        // Cuadrado de color
        ctx.fillStyle = dato.color;
        ctx.fillRect(leyendaX, leyendaY, 15, 15);
        
        // Texto
        ctx.fillStyle = '#212529';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${dato.label}: ${dato.valor.toFixed(2)} ms`, leyendaX + 25, leyendaY + 7);
        
        leyendaY += 25;
    });
}

// Gráfico de distancias por petición
function dibujarGraficoDistancias(peticiones, posInicial) {
    const canvas = document.getElementById('grafico-distancias');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = 300;
    
    const margenIzq = 50;
    const margenDer = 20;
    const margenTop = 30;
    const margenBot = 40;
    
    const anchoGrafico = canvas.width - margenIzq - margenDer;
    const altoGrafico = canvas.height - margenTop - margenBot;
    
    // Limpiar
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Fondo
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calcular distancias
    const distancias = [];
    let posAnterior = posInicial;
    
    peticiones.forEach((p, i) => {
        const dist = Math.abs(p.cilindro - posAnterior);
        distancias.push({ indice: i + 1, distancia: dist });
        posAnterior = p.cilindro;
    });
    
    const maxDistancia = Math.max(...distancias.map(d => d.distancia));
    const escalaY = altoGrafico / maxDistancia;
    const anchoColumna = anchoGrafico / distancias.length;
    
    // Dibujar línea base
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(margenIzq, canvas.height - margenBot);
    ctx.lineTo(canvas.width - margenDer, canvas.height - margenBot);
    ctx.stroke();
    
    // Dibujar columnas
    distancias.forEach((dato, i) => {
        const x = margenIzq + (i * anchoColumna);
        const altura = dato.distancia * escalaY;
        const y = canvas.height - margenBot - altura;
        
        // Color según la magnitud
        let color;
        if (dato.distancia > maxDistancia * 0.7) {
            color = '#DC3545'; // Rojo para distancias grandes
        } else if (dato.distancia > maxDistancia * 0.4) {
            color = '#FFC107'; // Amarillo para distancias medias
        } else {
            color = '#28A745'; // Verde para distancias cortas
        }
        
        // Gradiente
        const gradiente = ctx.createLinearGradient(x, y, x, canvas.height - margenBot);
        gradiente.addColorStop(0, color);
        gradiente.addColorStop(1, color + '80');
        
        ctx.fillStyle = gradiente;
        ctx.fillRect(x + 2, y, anchoColumna - 4, altura);
        
        // Valor encima si hay espacio
        if (distancias.length <= 20 && dato.distancia > 0) {
            ctx.fillStyle = '#212529';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(dato.distancia, x + anchoColumna / 2, y - 5);
        }
        
        // Número de petición debajo (solo algunos si hay muchas)
        if (distancias.length <= 20 || i % Math.ceil(distancias.length / 15) === 0) {
            ctx.fillStyle = '#495057';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(dato.indice, x + anchoColumna / 2, canvas.height - margenBot + 15);
        }
    });
    
    // Etiqueta eje Y
    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#495057';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Distancia (cilindros)', 0, 0);
    ctx.restore();
    
    // Etiqueta eje X
    ctx.fillStyle = '#495057';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Número de Petición', canvas.width / 2, canvas.height - 5);
    
    // Leyenda de colores
    const leyendas = [
        { color: '#28A745', texto: 'Corta (≤40%)' },
        { color: '#FFC107', texto: 'Media (40-70%)' },
        { color: '#DC3545', texto: 'Larga (>70%)' }
    ];
    
    let leyendaX = canvas.width - 150;
    const leyendaY = margenTop;
    
    leyendas.forEach((leg, i) => {
        ctx.fillStyle = leg.color;
        ctx.fillRect(leyendaX, leyendaY + (i * 20), 12, 12);
        
        ctx.fillStyle = '#495057';
        ctx.font = '10px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(leg.texto, leyendaX + 18, leyendaY + (i * 20) + 10);
    });
}
