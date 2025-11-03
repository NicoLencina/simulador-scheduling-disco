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
    
    //agrego boton para probar casos d prueba
    const btnTest = document.createElement('button');
    btnTest.textContent = 'Probar Casos de Prueba';
    btnTest.classList.add('boton');
    btnTest.onclick = ejecutarCasosPrueba;
    document.querySelector('.contenedor').insertBefore(btnTest, document.getElementById('seccion-resultados'));
    
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
    
    //limpio la tabla
    const tabla = document.getElementById('sequence-table').getElementsByTagName('tbody')[0];
    tabla.innerHTML = '';
    
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
    
    //muestro los cálculos detallados (por defecto distancia) usando la posición inicial del disco
    mostrarCalculoDetallado('distancia', peticiones, configDisco.posicionActual);
    
    //dibujo todos los graficos
    dibujarGrafico(cilindros, tiempos);
    dibujarGraficoTiempos(tiempoBusquedaTotal, tiempoRotacionTotal, tiempoTransferenciaTotal);
    dibujarGraficoCircular(tiempoBusquedaTotal, tiempoRotacionTotal, tiempoTransferenciaTotal);
    dibujarGraficoDistancias(peticiones, configDisco.posicionActual);
}

//funcion para probar todos los algoritmos con casos d prueba
async function ejecutarCasosPrueba() {
    const resultados = [];
    
    for(const caso of casosDePrueba) {
        console.log(`\nProbando: ${caso.nombre}`);
        
        //cargo la config del caso
        configDisco = new ConfiguracionDisco();
        configDisco.ponerConfig(caso.config);
        
        //creo las peticiones
        const peticiones = caso.peticiones.map((c, i) => new PeticionDisco(c, i));
        
        //pruebo cada algoritmo
        const algoritmos = ['fifo', 'sstf', 'scan', 'cscan', 'look', 'clook', 'fscan', 'nstepscan'];
        
        for(const alg of algoritmos) {
            try {
                console.log(`\nEjecutando ${alg.toUpperCase()}:`);
                const resultado = ejecutarAlgoritmo(alg, peticiones);
                
                //calculo metricas
                let distTotal = 0;
                let tiempoTotal = 0;
                let posAnterior = caso.posicionInicial;
                
                for(let i = 0; i < resultado.length; i++) {
                    distTotal += Math.abs(resultado[i].cilindro - posAnterior);
                    tiempoTotal += resultado[i].tiempoAccesoTotal || 0;
                    posAnterior = resultado[i].cilindro;
                }
                
                resultados.push({
                    caso: caso.nombre,
                    algoritmo: alg,
                    distancia: distTotal,
                    tiempo: tiempoTotal
                });
                
                console.log(`Distancia total: ${distTotal}`);
                console.log(`Tiempo total: ${tiempoTotal.toFixed(2)} ms`);
                
            } catch(error) {
                console.error(`Error en ${alg}: ${error}`);
            }
        }
    }
    
    //muestro comparacion
    console.log('\nComparacion de algoritmos:');
    console.table(resultados);
}

// Función para mostrar los cálculos detallados
function mostrarCalculoDetallado(tipoCalculo, peticiones, posicionInicialParam = null) {
    const detalleDiv = document.getElementById('detalle-calculo');
    const posInicial = posicionInicialParam !== null ? posicionInicialParam : configDisco.posicionActual;
    let html = '';
    
    switch(tipoCalculo) {
        case 'distancia':
            html = '<span class="formula-titulo"><i class="fas fa-route"></i> Cálculo de Distancia Total</span>';
            html += '<div class="paso"><span class="paso-numero">Fórmula:</span> Distancia = Σ |Cilindro<sub>actual</sub> - Cilindro<sub>anterior</sub>|</div>';
            
            let posAnterior = posInicial;
            let suma = '';
            let distTotal = 0;
            
            peticiones.forEach((p, i) => {
                const dist = Math.abs(p.cilindro - posAnterior);
                distTotal += dist;
                html += `<div class="paso">`;
                html += `<span class="paso-numero">Paso ${i + 1}:</span> `;
                html += `De cilindro <span class="valor">${posAnterior}</span> `;
                html += `→ <span class="valor">${p.cilindro}</span> `;
                html += `= |${p.cilindro} - ${posAnterior}| = <span class="valor">${dist}</span> cilindros`;
                html += `</div>`;
                suma += (i > 0 ? ' + ' : '') + dist;
                posAnterior = p.cilindro;
            });
            
            html += `<div class="paso"><span class="paso-numero">Total:</span> ${suma} = <span class="valor">${distTotal}</span> cilindros</div>`;
            html += `<div class="resultado-final"><i class="fas fa-check-circle"></i> Distancia Total Recorrida: ${distTotal} cilindros</div>`;
            break;
            
        case 'busqueda':
            html = '<span class="formula-titulo"><i class="fas fa-search"></i> Cálculo de Tiempo de Búsqueda</span>';
            html += '<div class="paso"><span class="paso-numero">Fórmula:</span> Tiempo Búsqueda = Distancia × STM</div>';
            html += `<div class="paso"><span class="paso-numero">STM:</span> <span class="valor">${configDisco.multiplicadorTiempoBusqueda}</span> ms/cilindro</div>`;
            
            let totalBusqueda = 0;
            let posAnt = posInicial;
            
            peticiones.forEach((p, i) => {
                const dist = Math.abs(p.cilindro - posAnt);
                const tiempo = dist * configDisco.multiplicadorTiempoBusqueda;
                totalBusqueda += tiempo;
                
                html += `<div class="paso">`;
                html += `<span class="paso-numero">Petición ${i + 1}:</span> `;
                html += `${dist} cilindros × ${configDisco.multiplicadorTiempoBusqueda} ms = <span class="valor">${tiempo.toFixed(2)}</span> ms`;
                html += `</div>`;
                posAnt = p.cilindro;
            });
            
            html += `<div class="resultado-final"><i class="fas fa-clock"></i> Tiempo Total de Búsqueda: ${totalBusqueda.toFixed(2)} ms</div>`;
            break;
            
        case 'rotacion':
            html = '<span class="formula-titulo"><i class="fas fa-sync"></i> Cálculo de Tiempo de Rotación</span>';
            html += '<div class="paso"><span class="paso-numero">Fórmula:</span> Latencia Rotacional = (60,000 ms / RPM) / 2</div>';
            html += `<div class="paso"><span class="paso-numero">Velocidad:</span> <span class="valor">${configDisco.velocidadRotacional}</span> RPM</div>`;
            
            const msPerRev = (60 * 1000) / configDisco.velocidadRotacional;
            const latencia = msPerRev / 2;
            
            html += `<div class="paso"><span class="paso-numero">Cálculo:</span> (60,000 / ${configDisco.velocidadRotacional}) / 2 = <span class="valor">${latencia.toFixed(2)}</span> ms por petición</div>`;
            html += `<div class="paso"><span class="paso-numero">Cantidad de peticiones:</span> <span class="valor">${peticiones.length}</span></div>`;
            
            const totalRotacion = latencia * peticiones.length;
            
            html += `<div class="paso"><span class="paso-numero">Total:</span> ${latencia.toFixed(2)} ms × ${peticiones.length} = <span class="valor">${totalRotacion.toFixed(2)}</span> ms</div>`;
            html += `<div class="resultado-final"><i class="fas fa-sync"></i> Tiempo Total de Rotación: ${totalRotacion.toFixed(2)} ms</div>`;
            break;
            
        case 'transferencia':
            html = '<span class="formula-titulo"><i class="fas fa-exchange-alt"></i> Cálculo de Tiempo de Transferencia</span>';
            html += '<div class="paso"><span class="paso-numero">Fórmula:</span> Tiempo Transferencia = TT1S × Cantidad de Peticiones</div>';
            html += `<div class="paso"><span class="paso-numero">TT1S:</span> <span class="valor">${configDisco.tiempoTransferenciaSector}</span> ms/sector</div>`;
            html += `<div class="paso"><span class="paso-numero">Cantidad de peticiones:</span> <span class="valor">${peticiones.length}</span></div>`;
            
            const totalTransf = configDisco.tiempoTransferenciaSector * peticiones.length;
            
            html += `<div class="paso"><span class="paso-numero">Total:</span> ${configDisco.tiempoTransferenciaSector} ms × ${peticiones.length} = <span class="valor">${totalTransf.toFixed(2)}</span> ms</div>`;
            html += `<div class="resultado-final"><i class="fas fa-exchange-alt"></i> Tiempo Total de Transferencia: ${totalTransf.toFixed(2)} ms</div>`;
            break;
            
        case 'total':
            html = '<span class="formula-titulo"><i class="fas fa-calculator"></i> Cálculo de Tiempo Total de Acceso</span>';
            html += '<div class="paso"><span class="paso-numero">Fórmula:</span> Tiempo Total = Tiempo Búsqueda + Tiempo Rotación + Tiempo Transferencia</div>';
            
            let tBusqueda = 0, tRotacion = 0, tTransf = 0;
            let posA = posInicial;
            
            peticiones.forEach((p) => {
                const dist = Math.abs(p.cilindro - posA);
                tBusqueda += dist * configDisco.multiplicadorTiempoBusqueda;
                tRotacion += ((60 * 1000) / configDisco.velocidadRotacional) / 2;
                tTransf += configDisco.tiempoTransferenciaSector;
                posA = p.cilindro;
            });
            
            html += `<div class="paso"><span class="paso-numero">Tiempo de Búsqueda:</span> <span class="valor">${tBusqueda.toFixed(2)}</span> ms</div>`;
            html += `<div class="paso"><span class="paso-numero">Tiempo de Rotación:</span> <span class="valor">${tRotacion.toFixed(2)}</span> ms</div>`;
            html += `<div class="paso"><span class="paso-numero">Tiempo de Transferencia:</span> <span class="valor">${tTransf.toFixed(2)}</span> ms</div>`;
            
            const total = tBusqueda + tRotacion + tTransf;
            
            html += `<div class="paso"><span class="paso-numero">Suma:</span> ${tBusqueda.toFixed(2)} + ${tRotacion.toFixed(2)} + ${tTransf.toFixed(2)} = <span class="valor">${total.toFixed(2)}</span> ms</div>`;
            html += `<div class="resultado-final"><i class="fas fa-hourglass-end"></i> Tiempo Total de Acceso: ${total.toFixed(2)} ms</div>`;
            break;
    }
    
    detalleDiv.innerHTML = html;
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
    
    const margen = 60;
    const anchoGrafico = canvas.width - (margen * 2);
    const altoGrafico = canvas.height - (margen * 2);
    
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
    const escalaY = altoGrafico / maxValor;
    const anchoBarra = anchoGrafico / (datos.length * 2);
    
    // Dibujar barras
    datos.forEach((dato, i) => {
        const x = margen + (i * anchoBarra * 2) + anchoBarra / 2;
        const alturaBarra = dato.valor * escalaY;
        const y = canvas.height - margen - alturaBarra;
        
        // Gradiente para la barra
        const gradiente = ctx.createLinearGradient(x, y, x, canvas.height - margen);
        gradiente.addColorStop(0, dato.color);
        gradiente.addColorStop(1, dato.color + 'AA');
        
        // Barra
        ctx.fillStyle = gradiente;
        ctx.fillRect(x, y, anchoBarra, alturaBarra);
        
        // Borde de la barra
        ctx.strokeStyle = dato.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, anchoBarra, alturaBarra);
        
        // Valor encima de la barra
        ctx.fillStyle = '#212529';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(dato.valor.toFixed(2) + ' ms', x + anchoBarra / 2, y - 10);
        
        // Etiqueta debajo
        ctx.fillStyle = '#495057';
        ctx.font = '12px Arial';
        ctx.fillText(dato.label, x + anchoBarra / 2, canvas.height - margen + 25);
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
