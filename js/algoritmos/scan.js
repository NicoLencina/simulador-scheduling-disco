//importo las funciones comunes
import * as utils from '../utils.js';

//SCAN (tambien conocido como el algoritmo del ascensor)
//funciona asi:
//1. ordena todas las peticiones x numero d cilindro
//2. mueve el cabezal en una direccion (como subiendo)
//3. atiende todas las peticiones q encuentra en el camino
//4. cuando llega al final, baja haciendo lo mismo
//5. y asi sucesivamente

//pros:
//- evita la inanicion (nadie espera demasiado)
//- mas justo q SSTF
//- predecible (se sabe + o - cuando te va a tocar)
//contras:
//- puede hacer viajes innecesarios hasta el final
//- no tan eficiente como SSTF en distancia total

const algoritmoSCAN = (peticiones, configDisco) => {
    //validaciones usando funcion comun
    utils.validarParametrosBase(peticiones, configDisco, 'SCAN');
    
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
    
    //primera pasada: subiendo
    procesarPeticionesEnDireccion(indiceInicial, peticionesPendientes.length, 1);
    
    //segunda pasada: bajando
    procesarPeticionesEnDireccion(indiceInicial - 1, 0, -1);
    
    return peticionesProcesadas;
};

export default algoritmoSCAN;
