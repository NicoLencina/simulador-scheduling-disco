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
    //validaciones primero
    if(!peticiones || !configDisco) {
        throw new Error('faltan parametros para LOOK!');
    }
    
    let posicionActual = configDisco.posicionActual;
    let tiempoActual = 0;
    //copio las peticiones para no modificar las originales
    const peticionesPendientes = peticiones.map(p => p.clonar());
    const peticionesProcesadas = [];
    
    //ordeno las peticiones x numero d cilindro (d menor a mayor)
    //esto es clave para poder ir en una direccion
    peticionesPendientes.sort((a, b) => a.cilindro - b.cilindro);
    
    //busco desde donde empezar segun donde esta el cabezal
    let indiceInicial = 0;
    //avanzo hasta encontrar la primera peticion mayor q la pos actual
    while (indiceInicial < peticionesPendientes.length && 
           peticionesPendientes[indiceInicial].cilindro < posicionActual) {
        indiceInicial++;
    }
    
    //primera pasada: voy subiendo hasta la ultima peticion
    //a diferencia d SCAN, no voy hasta el final del disco
    for (let i = indiceInicial; i < peticionesPendientes.length; i++) {
        const peticionActual = peticionesPendientes[i];
        //calculo todos los tiempos:
        //- busqueda (mover el cabezal)
        //- rotacion (esperar al sector)
        //- transferencia (leer/escribir)
        peticionActual.calcularTiempos(configDisco, posicionActual);
        //marco cuando empece esta peticion
        peticionActual.tiempoProceso = tiempoActual;
        //actualizo tiempo total y muevo el cabezal
        tiempoActual += peticionActual.tiempoAccesoTotal;
        posicionActual = peticionActual.cilindro;
        peticionesProcesadas.push(peticionActual);
    }
    
    //segunda pasada: bajo hasta la peticion mas baja
    //igual q antes, no voy hasta el cilindro 0
    for (let i = indiceInicial - 1; i >= 0; i--) {
        const peticionActual = peticionesPendientes[i];
        //mismos calculos q antes pero bajando
        peticionActual.calcularTiempos(configDisco, posicionActual);
        peticionActual.tiempoProceso = tiempoActual;
        tiempoActual += peticionActual.tiempoAccesoTotal;
        posicionActual = peticionActual.cilindro;
        peticionesProcesadas.push(peticionActual);
    }
    
    //devuelvo todas las peticiones ya procesadas
    return peticionesProcesadas;
};

//exporto para q lo use main.js
export default algoritmoLOOK;
