//importo las funciones comunes
import * as utils from '../utils.js';

//C-LOOK (LOOK Circular)
//es la combinacion perfecta:
//1. usa la idea d LOOK d no ir hasta los extremos
//2. usa la idea d C-SCAN d volver al principio rapido
//3. resultado: lo mejor d los dos mundos!

//ejemplo practico:
//peticiones: [20, 45, 90, 120, 180] y estoy en 85
//1. subo atendiendo [90, 120, 180]
//2. vuelvo rapido al principio
//3. sigo con [20, 45]
//4. asi todas las peticiones esperan casi lo mismo

//pros:
//- combina las ventajas d LOOK y C-SCAN
//- tiempo d espera muy parejo para todos
//- evita viajes innecesarios a los extremos
//contras:
//- un poco mas complejo d programar
//- el retorno consume algo d tiempo

const algoritmoCLOOK = (peticiones, configDisco) => {
    //validaciones usando funcion comun
    utils.validarParametrosBase(peticiones, configDisco, 'C-LOOK');
    
    //inicializo estado usando funcion comun
    let { posicionActual, tiempoActual } = utils.inicializarEstadoBase(configDisco);
    
    //copio las peticiones usando funcion comun
    const peticionesPendientes = utils.clonarPeticiones(peticiones);
    const peticionesProcesadas = [];
    
    //ordeno por cilindro usando funcion comun
    peticionesPendientes.sort((a, b) => a.cilindro - b.cilindro);
    
    //busco donde empezar usando funcion comun
    let indiceInicial = utils.encontrarIndiceInicial(peticionesPendientes, posicionActual);
    
    //funcion auxiliar para procesar peticiones en un rango
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
    
    //primera parte: proceso desde donde estoy hacia arriba
    procesarPeticionesEnRango(indiceInicial, peticionesPendientes.length);
    
    //si quedan peticiones antes del punto inicial
    if (indiceInicial > 0) {
        //calculo tiempo d volver a la primera peticion
        //ojo! no vuelvo al cilindro 0 como CSCAN
        //voy directo a la primera peticion pendiente
        const tiempoRetorno = configDisco.calcularTiempoBusqueda(
            posicionActual, 
            peticionesPendientes[0].cilindro
        );
        
        //actualizo estado por el retorno
        tiempoActual += tiempoRetorno;
        posicionActual = peticionesPendientes[0].cilindro;
        
        //proceso las peticiones restantes desde el inicio
        procesarPeticionesEnRango(0, indiceInicial);
    }
    
    return peticionesProcesadas;
};

export default algoritmoCLOOK;
