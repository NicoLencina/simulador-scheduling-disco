//importo las funciones comunes
import * as utils from '../utils.js';

//algoritmo FIFO (First In First Out)
//este es el mas facil de todos, xq:
//1. agarra las peticiones en el orden q llegaron
//2. las procesa una x una sin ordenar nada
//3. va calculando tiempos a medida q avanza

//pros: super simple y justo (el q llega primero sale primero)
//contras: no optimiza nada, puede hacer q el cabezal se mueva como loco

const algoritmoFIFO = (peticiones, configDisco) => {
    //validaciones usando funcion comun
    utils.validarParametrosBase(peticiones, configDisco, 'FIFO');
    
    //inicializo estado usando funcion comun
    let { posicionActual, tiempoActual } = utils.inicializarEstadoBase(configDisco);
    
    //proceso cada peticion en orden de llegada (FIFO no necesita ordenar)
    return peticiones.map(peticion => {
        //clono la peticion usando funcion comun
        const peticionProcesada = peticion.clonar();
        
        //proceso la peticion y actualizo estado usando funcion comun
        const nuevoEstado = utils.procesarPeticion(
            peticionProcesada, 
            configDisco, 
            posicionActual, 
            tiempoActual
        );
        
        //actualizo estado para la siguiente peticion
        posicionActual = nuevoEstado.nuevaPosicion;
        tiempoActual = nuevoEstado.nuevoTiempo;
        
        return peticionProcesada;
    });
};

export default algoritmoFIFO;
