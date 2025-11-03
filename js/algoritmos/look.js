//importo las funciones comunes
import * as utils from '../utils.js';

//LOOK (version mejorada d SCAN)
//la idea es simple pero efectiva:
//1. es igual q SCAN pero con un truco
//2. en vez d ir hasta el final del disco
//3. solo va hasta la ultima peticion q encuentra
//4. despues vuelve, ahorrando movimientos al pedo

//por ejemplo:
//si las peticiones son [50, 80, 120] y estoy en 90
//SCAN iria hasta el final (199) y volveria
//LOOK solo va hasta 120 y vuelve, mas eficiente!

//pros:
//- mas eficiente q SCAN (menos movimiento)
//- mantiene la justicia d SCAN
//- evita viajes innecesarios
//contras:
//- un poco mas complejo d implementar
//- puede hacer q algunas peticiones esperen mas

const algoritmoLOOK = (peticiones, configDisco) => {
    //validaciones usando funcion comun
    utils.validarParametrosBase(peticiones, configDisco, 'LOOK');
    
    //inicializo estado usando funcion comun
    let { posicionActual, tiempoActual } = utils.inicializarEstadoBase(configDisco);
    
    //copio las peticiones usando funcion comun
    const peticionesPendientes = utils.clonarPeticiones(peticiones);
    const peticionesProcesadas = [];
    
    //ordeno por cilindro usando funcion comun
    peticionesPendientes.sort((a, b) => a.cilindro - b.cilindro);
    
    //busco donde empezar usando funcion comun
    let indiceInicial = utils.encontrarIndiceInicial(peticionesPendientes, posicionActual);
    
    //proceso en ambas direcciones
    const procesarPeticionesEnDireccion = (inicio, fin, paso) => {
        for (let i = inicio; paso > 0 ? i < fin : i >= fin; i += paso) {
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
    
    //primera pasada: subiendo hasta la ultima peticion
    procesarPeticionesEnDireccion(indiceInicial, peticionesPendientes.length, 1);
    
    //segunda pasada: bajando hasta la primera peticion
    procesarPeticionesEnDireccion(indiceInicial - 1, 0, -1);
    
    return peticionesProcesadas;
};

export default algoritmoLOOK;
