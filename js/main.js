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
        
        //calculo distancia con la anterior
        if(i > 0) {
            distanciaTotal += Math.abs(p.cilindro - peticiones[i-1].cilindro);
        }
        
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
    
    //dibujo el grafico
    dibujarGrafico(cilindros, tiempos);
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
                
                for(let i = 1; i < resultado.length; i++) {
                    distTotal += Math.abs(resultado[i].cilindro - resultado[i-1].cilindro);
                    tiempoTotal += resultado[i].tiempoTotal;
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

//dibuja el grafico d movimiento del cabezal
function dibujarGrafico(cilindros, tiempos) {
    const canvas = document.getElementById('grafico-movimiento');
    const ctx = canvas.getContext('2d');
    
    //limpio el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    //calculo escalas
    const maxCilindro = Math.max(...cilindros);
    const maxTiempo = Math.max(...tiempos);
    
    const escalaX = (canvas.width - 40) / maxTiempo;
    const escalaY = (canvas.height - 40) / maxCilindro;
    
    //dibujo ejes
    ctx.beginPath();
    ctx.moveTo(20, 20);
    ctx.lineTo(20, canvas.height - 20);
    ctx.lineTo(canvas.width - 20, canvas.height - 20);
    ctx.stroke();
    
    //dibujo linea d movimiento
    ctx.beginPath();
    ctx.moveTo(20, canvas.height - 20 - (cilindros[0] * escalaY));
    
    for(let i = 1; i < cilindros.length; i++) {
        const x = 20 + (tiempos[i] * escalaX);
        const y = canvas.height - 20 - (cilindros[i] * escalaY);
        ctx.lineTo(x, y);
    }
    
    ctx.stroke();
}
