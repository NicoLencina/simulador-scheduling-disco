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
    // Valores recomendados
    const valoresRecomendados = {
        stm: 0.1,
        vr: 7200,
        tt1s: 0.02,
        tb: 64,
        tp: 4,
        pc: 2,
        sc: 32,
        'initial-position': 50,
        requests: '0, 45, 20, 88, 15, 92, 150, 5, 35, 78, 98, 120, 44, 65, 25'
    };

    // Autocompletar cada campo
    for (const [id, valor] of Object.entries(valoresRecomendados)) {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.value = valor;
        }
    }
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
    
    //agrego boton para probar casos d prueba
    const btnTest = document.createElement('button');
    btnTest.textContent = 'Probar Casos de Prueba';
    btnTest.classList.add('boton');
    btnTest.onclick = ejecutarCasosPrueba;
    document.querySelector('.contenedor').insertBefore(btnTest, document.getElementById('seccion-resultados'));
    
    // Ya se inicializó configDisco arriba
    console.log('Configuración inicial creada:', configDisco);
});

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
        
    } catch(error) {
        //si hay error lo muestro
        alert('Error: ' + error);
    }
}

//levanta todos los valores d los inputs
function obtenerParametros() {
    return {
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
}

//convierte el string d peticiones en objetos PeticionDisco
function procesarPeticiones(requestsStr) {
    if (!requestsStr) {
        throw 'No se han ingresado peticiones';
    }

    //separo x comas y limpio espacios
    const numeros = requestsStr.split(',')
        .map(n => n.trim())
        .filter(n => n !== '')
        .map(n => {
            const num = Number(n);
            if (isNaN(num)) {
                throw `Valor inválido encontrado: "${n}". Todos los valores deben ser números.`;
            }
            return num;
        });
        
    if(numeros.length < 15) {
        throw 'Necesito mínimo 15 peticiones!';
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
