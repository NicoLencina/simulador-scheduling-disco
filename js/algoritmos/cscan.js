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
    //validaciones primero
    if(!peticiones || !configDisco) {
        throw new Error('faltan parametros para C-SCAN!');
    }
    
    let posicionActual = configDisco.posicionActual;
    let tiempoActual = 0;
    //copio las peticiones para no tocar las originales
    const peticionesPendientes = peticiones.map(p => p.clonar());
    const peticionesProcesadas = [];
    
    //ordeno las peticiones x numero d cilindro
    peticionesPendientes.sort((a, b) => a.cilindro - b.cilindro);
    
    //busco donde tengo q empezar segun donde esta el cabezal
    let indiceInicial = 0;
    while (indiceInicial < peticionesPendientes.length && 
           peticionesPendientes[indiceInicial].cilindro < posicionActual) {
        indiceInicial++;
    }
    
    //primera parte: proceso desde donde estoy hasta el final
    for (let i = indiceInicial; i < peticionesPendientes.length; i++) {
        const peticionActual = peticionesPendientes[i];
        //calculo todos los tiempos para esta peticion
        peticionActual.calcularTiempos(configDisco, posicionActual);
        peticionActual.tiempoProceso = tiempoActual;
        //actualizo tiempo total y posicion
        tiempoActual += peticionActual.tiempoAccesoTotal;
        posicionActual = peticionActual.cilindro;
        peticionesProcesadas.push(peticionActual);
    }
    
    //si quedaron peticiones antes del punto inicial
    //hay q volver al principio y procesarlas
    if (indiceInicial > 0) {
        //calculo cuanto tarda en volver al principio
        const tiempoRetorno = configDisco.calcularTiempoBusqueda(posicionActual, 0);
        //sumo ese tiempo al total (el viaje d vuelta)
        tiempoActual += tiempoRetorno;
        //muevo el cabezal al principio
        posicionActual = 0;
        
        //proceso desde el principio hasta donde habia empezado
        for (let i = 0; i < indiceInicial; i++) {
            const peticionActual = peticionesPendientes[i];
            //calculo tiempos como siempre
            peticionActual.calcularTiempos(configDisco, posicionActual);
            peticionActual.tiempoProceso = tiempoActual;
            tiempoActual += peticionActual.tiempoAccesoTotal;
            posicionActual = peticionActual.cilindro;
            peticionesProcesadas.push(peticionActual);
        }
    }
    
    //devuelvo todas las peticiones ya procesadas
    return peticionesProcesadas;
};

//exporto para q lo use main.js
export default algoritmoCSCAN;
