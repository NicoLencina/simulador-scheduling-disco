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
    //validaciones iniciales
    if(!peticiones || !configDisco) {
        throw new Error('faltan parametros para C-LOOK!');
    }
    
    let posicionActual = configDisco.posicionActual;
    let tiempoActual = 0;
    //copio las peticiones para trabajar
    const peticionesPendientes = peticiones.map(p => p.clonar());
    const peticionesProcesadas = [];
    
    //ordeno las peticiones x numero d cilindro
    //esto es importante para el recorrido circular
    peticionesPendientes.sort((a, b) => a.cilindro - b.cilindro);
    
    //busco desde donde empezar segun la pos actual
    let indiceInicial = 0;
    //avanzo hasta encontrar la primera peticion mayor
    while (indiceInicial < peticionesPendientes.length && 
           peticionesPendientes[indiceInicial].cilindro < posicionActual) {
        indiceInicial++;
    }
    
    //primera parte: proceso desde donde estoy hacia arriba
    //pero solo hasta la ultima peticion (como LOOK)
    for (let i = indiceInicial; i < peticionesPendientes.length; i++) {
        const peticionActual = peticionesPendientes[i];
        //calculo todos los tiempos normales
        peticionActual.calcularTiempos(configDisco, posicionActual);
        //guardo cuando empece esta peticion
        peticionActual.tiempoProceso = tiempoActual;
        //actualizo tiempo y posicion
        tiempoActual += peticionActual.tiempoAccesoTotal;
        posicionActual = peticionActual.cilindro;
        peticionesProcesadas.push(peticionActual);
    }
    
    //si quedan peticiones antes del punto inicial
    if (indiceInicial > 0) {
        //calculo tiempo d volver a la primera peticion
        //ojo! no vuelvo al cilindro 0 como CSCAN
        //voy directo a la primera peticion pendiente
        const tiempoRetorno = configDisco.calcularTiempoBusqueda(
            posicionActual, 
            peticionesPendientes[0].cilindro
        );
        //sumo el tiempo d viaje
        tiempoActual += tiempoRetorno;
        //muevo el cabezal a la primera peticion
        posicionActual = peticionesPendientes[0].cilindro;
        
        //proceso las peticiones q quedaron pendientes
        for (let i = 0; i < indiceInicial; i++) {
            const peticionActual = peticionesPendientes[i];
            //mismo proceso d siempre
            peticionActual.calcularTiempos(configDisco, posicionActual);
            peticionActual.tiempoProceso = tiempoActual;
            tiempoActual += peticionActual.tiempoAccesoTotal;
            posicionActual = peticionActual.cilindro;
            peticionesProcesadas.push(peticionActual);
        }
    }
    
    //devuelvo todas las peticiones procesadas
    return peticionesProcesadas;
};

//exporto para q lo use main.js
export default algoritmoCLOOK;
