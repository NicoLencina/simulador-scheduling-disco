//importo las funciones comunes
import * as utils from '../utils.js';

//F-SCAN (SCAN con colas)
//este es un algoritmo mas complejo:
//1. divide todas las peticiones en 2 grupos
//2. procesa el primer grupo completo con SCAN
//3. despues procesa el segundo grupo con SCAN
//4. asi evita q peticiones nuevas "se cuelen"

//por ejemplo:
//peticiones: [10, 30, 50, 70, 90, 110]
//grupo1: [10, 30, 50] -> procesa con SCAN
//grupo2: [70, 90, 110] -> procesa con SCAN despues

//la idea es:
//- dar prioridad a las peticiones mas viejas
//- evitar q peticiones nuevas retrasen a las viejas
//- mantener algo del orden d SCAN dentro d cada grupo

//pros:
//- evita la inanicion d peticiones viejas
//- predecible (se sabe en q grupo vas a estar)
//- bueno para sistemas con muchas peticiones nuevas
//contras:
//- puede hacer esperar mucho a peticiones nuevas
//- menos eficiente en movimiento total
//- mas complejo d implementar

const algoritmoFSCAN = (peticiones, configDisco) => {
    //validaciones usando funcion comun
    utils.validarParametrosBase(peticiones, configDisco, 'F-SCAN');
    
    //inicializo estado usando funcion comun
    let { posicionActual, tiempoActual } = utils.inicializarEstadoBase(configDisco);
    const peticionesProcesadas = [];
    
    //divido peticiones en dos colas y las clono
    const mitad = Math.ceil(peticiones.length / 2);
    const cola1 = utils.clonarPeticiones(peticiones.slice(0, mitad));
    const cola2 = utils.clonarPeticiones(peticiones.slice(mitad));
    
    //funcion auxiliar para procesar una cola con SCAN
    const procesarCola = (cola) => {
        if (cola.length === 0) return;
        
        //ordeno por cilindro usando funcion comun
        cola.sort((a, b) => a.cilindro - b.cilindro);
        
        //busco donde empezar usando funcion comun
        let indiceInicial = utils.encontrarIndiceInicial(cola, posicionActual);
        
        //funcion para procesar en una direccion
        const procesarEnDireccion = (inicio, fin, paso) => {
            for (let i = inicio; paso > 0 ? i < fin : i >= fin; i += paso) {
                const peticionActual = cola[i];
                
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
        
        //proceso subiendo y bajando
        procesarEnDireccion(indiceInicial, cola.length, 1);
        procesarEnDireccion(indiceInicial - 1, 0, -1);
    };
    
    //proceso ambas colas en orden
    procesarCola(cola1); //primero las viejas
    procesarCola(cola2); //despues las nuevas
    
    return peticionesProcesadas;
};

export default algoritmoFSCAN;
