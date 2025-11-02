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
    //validaciones basicas
    if(!peticiones || !configDisco) {
        throw new Error('faltan parametros para SCAN!');
    }
    
    let posicionActual = configDisco.posicionActual;
    let tiempoActual = 0;
    //copio las peticiones para trabajar
    const peticionesPendientes = peticiones.map(p => p.clonar());
    const peticionesProcesadas = [];
    
    //primero ordeno todo x numero d cilindro (d menor a mayor)
    peticionesPendientes.sort((a, b) => a.cilindro - b.cilindro);
    
    //busco donde empezar segun la posicion actual del cabezal
    let indiceInicial = 0;
    //avanzo hasta encontrar el primer cilindro mayor q la pos actual
    while (indiceInicial < peticionesPendientes.length && 
           peticionesPendientes[indiceInicial].cilindro < posicionActual) {
        indiceInicial++;
    }
    
    //primera pasada: subiendo (hacia cilindros mas altos)
    for (let i = indiceInicial; i < peticionesPendientes.length; i++) {
        const peticionActual = peticionesPendientes[i];
        //calculo todos los tiempos para esta peticion
        peticionActual.calcularTiempos(configDisco, posicionActual);
        //marco cuando empece a procesarla
        peticionActual.tiempoProceso = tiempoActual;
        //actualizo el tiempo total y muevo el cabezal
        tiempoActual += peticionActual.tiempoAccesoTotal;
        posicionActual = peticionActual.cilindro;
        //la agrego a las ya procesadas
        peticionesProcesadas.push(peticionActual);
    }
    
    //segunda pasada: bajando (hacia cilindros mas bajos)
    for (let i = indiceInicial - 1; i >= 0; i--) {
        const peticionActual = peticionesPendientes[i];
        //mismo proceso q antes pero en direccion contraria
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
export default algoritmoSCAN;
