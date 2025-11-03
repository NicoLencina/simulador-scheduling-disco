//importo las funciones comunes
import * as utils from '../utils.js';

//N-STEP-SCAN: el mas complejo de todos!
//como funciona:
//1. agarra las peticiones y las divide en grupos de N
//2. procesa cada grupo usando SCAN
//3. cuando termina un grupo, agarra el siguiente
//4. asi hasta q no quedan grupos

//la idea es:
//- tener un poco d orden (usando SCAN en cada grupo)
//- pero sin hacer esperar tanto a las nuevas peticiones
//- el tamaño d los grupos (N) afecta mucho el resultado

const algoritmoNSTEPSCAN = (peticiones, configDisco, N = 4) => {
    //validaciones usando funcion comun
    utils.validarParametrosBase(peticiones, configDisco, 'N-STEP-SCAN');
    
    //valido q N sea un numero positivo
    N = Math.max(1, Math.floor(N));
    
    //inicializo estado usando funcion comun
    let { posicionActual, tiempoActual } = utils.inicializarEstadoBase(configDisco);
    let peticionesProcesadas = [];
    
    //copio las peticiones usando funcion comun
    const peticionesPendientes = utils.clonarPeticiones(peticiones);
    
    //funcion auxiliar para procesar un grupo con SCAN
    const procesarGrupo = (grupo) => {
        //ordeno por cilindro usando funcion comun
        grupo.sort((a, b) => a.cilindro - b.cilindro);
        
        //busco donde empezar usando funcion comun
        let indiceInicial = utils.encontrarIndiceInicial(grupo, posicionActual);
        
        //funcion para procesar en una direccion
        const procesarEnDireccion = (inicio, fin, paso) => {
            for (let i = inicio; paso > 0 ? i < fin : i >= fin; i += paso) {
                const peticionActual = grupo[i];
                
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
        
        //proceso en ambas direcciones
        procesarEnDireccion(indiceInicial, grupo.length, 1);
        procesarEnDireccion(indiceInicial - 1, 0, -1);
    };
    
    //proceso grupos de N peticiones hasta terminar
    while (peticionesPendientes.length > 0) {
        const grupoActual = peticionesPendientes.splice(0, N);
        procesarGrupo(grupoActual);
    }
    
    return peticionesProcesadas;
};

export default algoritmoNSTEPSCAN;
