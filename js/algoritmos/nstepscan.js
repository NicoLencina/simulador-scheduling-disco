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
    //validaciones
    if(!peticiones || !configDisco) {
        throw new Error('faltan parametros para N-STEP-SCAN!');
    }
    
    //valido q N sea un numero positivo
    N = Math.max(1, Math.floor(N));
    
    let posicionActual = configDisco.posicionActual;
    let tiempoActual = 0;
    let peticionesProcesadas = [];
    
    //hago una copia d las peticiones para no modificar el original
    const peticionesPendientes = peticiones.map(p => p.clonar());
    
    //mientras queden peticiones sin procesar
    while (peticionesPendientes.length > 0) {
        //agarro las siguientes N peticiones (o menos si no quedan N)
        const grupoActual = peticionesPendientes.splice(0, N);
        
        //las ordeno x numero d cilindro (como SCAN)
        //asi el cabezal se mueve en una direccion
        grupoActual.sort((a, b) => a.cilindro - b.cilindro);
        
        //busco donde tengo q empezar en este grupo
        //depende d donde este el cabezal ahora
        let indiceInicial = 0;
        while (indiceInicial < grupoActual.length && 
               grupoActual[indiceInicial].cilindro < posicionActual) {
            indiceInicial++;
        }
        
        //proceso primero hacia arriba (cilindros mas altos)
        for (let i = indiceInicial; i < grupoActual.length; i++) {
            const peticionActual = grupoActual[i];
            //calculo todos los tiempos (busqueda, rotacion, transferencia)
            peticionActual.calcularTiempos(configDisco, posicionActual);
            //guardo cuando empece a procesar esta peticion
            peticionActual.tiempoProceso = tiempoActual;
            //actualizo tiempo total y posicion del cabezal
            tiempoActual += peticionActual.tiempoAccesoTotal;
            posicionActual = peticionActual.cilindro;
            peticionesProcesadas.push(peticionActual);
        }
        
        //ahora proceso hacia abajo (cilindros mas bajos)
        for (let i = indiceInicial - 1; i >= 0; i--) {
            const peticionActual = grupoActual[i];
            //mismo proceso q antes pero en la otra direccion
            peticionActual.calcularTiempos(configDisco, posicionActual);
            peticionActual.tiempoProceso = tiempoActual;
            tiempoActual += peticionActual.tiempoAccesoTotal;
            posicionActual = peticionActual.cilindro;
            peticionesProcesadas.push(peticionActual);
        }
    }
    
    //devuelvo todas las peticiones ya procesadas en orden
    return peticionesProcesadas;
};

//exporto la funcion para q la use main.js
export default algoritmoNSTEPSCAN;
