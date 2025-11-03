//importo las funciones comunes
import * as utils from '../utils.js';

//SSTF (Shortest Seek Time First)
//este es mas inteligente q FIFO xq:
//1. mira todas las peticiones pendientes
//2. elige la q este mas cerca del cabezal
//3. asi minimiza el movimiento total
//4. pero puede hacer q algunas peticiones esperen mucho

//pros: 
//- minimiza el movimiento del cabezal
//- mejor rendimiento q FIFO en general
//contras:
//- puede causar "inanicion" (starvation) si siguen llegando peticiones cercanas
//- las peticiones lejanas pueden esperar mucho

const algoritmoSSTF = (peticiones, configDisco) => {
    //validaciones usando funcion comun
    utils.validarParametrosBase(peticiones, configDisco, 'SSTF');
    
    //inicializo estado usando funcion comun
    let { posicionActual, tiempoActual } = utils.inicializarEstadoBase(configDisco);
    
    //copio las peticiones usando funcion comun
    const peticionesPendientes = utils.clonarPeticiones(peticiones);
    const peticionesProcesadas = [];

    //mientras haya peticiones sin atender
    while (peticionesPendientes.length > 0) {
        //busco la peticion q este mas cerca del cabezal
        let indiceMasCercano = encontrarPeticionMasCercana(peticionesPendientes, posicionActual);
        
        //saco la peticion mas cercana d la lista d pendientes
        const peticionActual = peticionesPendientes.splice(indiceMasCercano, 1)[0];
        
        //proceso la peticion usando funcion comun
        const nuevoEstado = utils.procesarPeticion(
            peticionActual, 
            configDisco, 
            posicionActual, 
            tiempoActual
        );
        
        //actualizo estado
        posicionActual = nuevoEstado.nuevaPosicion;
        tiempoActual = nuevoEstado.nuevoTiempo;
        
        //la agrego a procesadas
        peticionesProcesadas.push(peticionActual);
    }
    
    return peticionesProcesadas;
};

/**
 * Encuentra la peticion mas cercana a la posicion actual
 * @param {PeticionDisco[]} peticiones - Lista de peticiones pendientes
 * @param {number} posicionActual - Posicion actual del cabezal
 * @returns {number} Indice de la peticion mas cercana
 */
const encontrarPeticionMasCercana = (peticiones, posicionActual) => {
    let indiceMasCercano = 0;
    let distanciaMinima = Infinity;

    peticiones.forEach((peticion, indice) => {
        const distancia = Math.abs(peticion.cilindro - posicionActual);
        if (distancia < distanciaMinima) {
            distanciaMinima = distancia;
            indiceMasCercano = indice;
        }
    });

    return indiceMasCercano;
};

export default algoritmoSSTF;
