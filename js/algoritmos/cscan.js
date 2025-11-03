//importo las funciones comunes
import * as utils from '../utils.js';

//C-SCAN (SCAN Circular)
//es una version mejorada d SCAN:
//1. sube atendiendo peticiones como SCAN normal
//2. pero cuando llega arriba, en vez d bajar procesando
//3. vuelve rapido al principio (sin atender nada)
//4. y empieza a subir d nuevo

//pros:
//- mas justo q SCAN xq el tiempo d espera es + parejo
//- mantiene siempre la misma direccion (mas simple)
//- evita q las peticiones bajas esperen dos pasadas
//contras:
//- puede hacer mas distancia total q SCAN
//- el retorno al inicio consume tiempo

const algoritmoCSCAN = (peticiones, configDisco) => {
    //validaciones usando funcion comun
    utils.validarParametrosBase(peticiones, configDisco, 'C-SCAN');
    
    //inicializo estado usando funcion comun
    let { posicionActual, tiempoActual } = utils.inicializarEstadoBase(configDisco);
    
    //copio las peticiones usando funcion comun
    const peticionesPendientes = utils.clonarPeticiones(peticiones);
    const peticionesProcesadas = [];
    
    //ordeno por cilindro usando funcion comun
    peticionesPendientes.sort((a, b) => a.cilindro - b.cilindro);
    
    //busco donde empezar usando funcion comun
    let indiceInicial = utils.encontrarIndiceInicial(peticionesPendientes, posicionActual);
    
    //funcion auxiliar para procesar peticiones en una direccion
    const procesarPeticionesEnRango = (inicio, fin) => {
        for (let i = inicio; i < fin; i++) {
            const peticionActual = peticionesPendientes[i];
            
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
            
            //agrego a procesadas
            peticionesProcesadas.push(peticionActual);
        }
    };
    
    //primera parte: proceso desde donde estoy hasta el final
    procesarPeticionesEnRango(indiceInicial, peticionesPendientes.length);
    
    //si quedan peticiones antes del punto inicial
    if (indiceInicial > 0) {
        //calculo y sumo el tiempo d retorno al principio
        tiempoActual += configDisco.calcularTiempoBusqueda(posicionActual, 0);
        //muevo el cabezal al principio
        posicionActual = 0;
        
        //proceso desde el principio hasta el indice inicial
        procesarPeticionesEnRango(0, indiceInicial);
    }
    
    return peticionesProcesadas;
};

export default algoritmoCSCAN;
