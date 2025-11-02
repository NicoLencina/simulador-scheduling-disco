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
    //validaciones primero
    if(!peticiones || !configDisco) {
        throw new Error('faltan parametros para F-SCAN!');
    }
    
    let posicionActual = configDisco.posicionActual;
    let tiempoActual = 0;
    const peticionesProcesadas = [];
    
    //divido las peticiones en dos grupos iguales
    const mitad = Math.ceil(peticiones.length / 2);
    //grupo1: primeras peticiones (mas viejas)
    const cola1 = peticiones.slice(0, mitad).map(p => p.clonar());
    //grupo2: ultimas peticiones (mas nuevas)
    const cola2 = peticiones.slice(mitad).map(p => p.clonar());
    
    //funcion auxiliar para procesar una cola con SCAN
    const procesarCola = (cola) => {
        //si la cola esta vacia no hay nada q hacer
        if (cola.length === 0) return;
        
        //ordeno x numero d cilindro para hacer SCAN
        cola.sort((a, b) => a.cilindro - b.cilindro);
        
        //busco donde empezar en esta cola
        let indiceInicial = 0;
        //avanzo hasta encontrar la primera peticion mayor
        while (indiceInicial < cola.length && 
               cola[indiceInicial].cilindro < posicionActual) {
            indiceInicial++;
        }
        
        //primera pasada: subiendo (como SCAN)
        for (let i = indiceInicial; i < cola.length; i++) {
            const peticionActual = cola[i];
            //calculo tiempos normales
            peticionActual.calcularTiempos(configDisco, posicionActual);
            //marco cuando empece
            peticionActual.tiempoProceso = tiempoActual;
            //actualizo tiempo y posicion
            tiempoActual += peticionActual.tiempoAccesoTotal;
            posicionActual = peticionActual.cilindro;
            peticionesProcesadas.push(peticionActual);
        }
        
        //segunda pasada: bajando
        for (let i = indiceInicial - 1; i >= 0; i--) {
            const peticionActual = cola[i];
            //mismo proceso pero bajando
            peticionActual.calcularTiempos(configDisco, posicionActual);
            peticionActual.tiempoProceso = tiempoActual;
            tiempoActual += peticionActual.tiempoAccesoTotal;
            posicionActual = peticionActual.cilindro;
            peticionesProcesadas.push(peticionActual);
        }
    };
    
    //proceso primero la cola1 (peticiones viejas)
    procesarCola(cola1);
    //despues la cola2 (peticiones nuevas)
    procesarCola(cola2);
    
    //devuelvo todas las peticiones ya procesadas
    return peticionesProcesadas;
};

//exporto para q lo use main.js
export default algoritmoFSCAN;
