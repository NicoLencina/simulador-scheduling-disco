//SSTF (Shortest Seek Time First)
//este es mas inteligente q FIFO xq:
//1. mira todas las peticiones pendientes
//2. elige la q este mas cerca del cabezal
//3. asi minimiza el movimiento total
//4. pero puede hacer q algunas peticiones esperen mucho

//pros: 
//- minimiza el movimiento del cabezal
//- mejor rendimiento q FIFO en general
//contras:
//- puede causar "inanicion" (starvation) si siguen llegando peticiones cercanas
//- las peticiones lejanas pueden esperar mucho

const algoritmoSSTF = (peticiones, configDisco) => {
    //validaciones basicas
    if(!peticiones || !configDisco) {
        throw new Error('faltan parametros para SSTF!');
    }
    
    let posicionActual = configDisco.posicionActual;
    let tiempoActual = 0;
    //copio las peticiones para no modificar las originales
    const peticionesPendientes = peticiones.map(p => p.clonar());
    const peticionesProcesadas = [];

    //mientras haya peticiones sin atender
    while (peticionesPendientes.length > 0) {
        //busco la peticion q este mas cerca del cabezal
        let indiceMasCercano = 0;
        let distanciaMinima = Infinity;  //empiezo con dist infinita

        //reviso cada peticion pendiente
        peticionesPendientes.forEach((peticion, indice) => {
            //calculo q tan lejos esta del cabezal
            const distancia = Math.abs(peticion.cilindro - posicionActual);
            //si encontre una mas cercana, la guardo
            if (distancia < distanciaMinima) {
                distanciaMinima = distancia;
                indiceMasCercano = indice;
            }
        });

        //saco la peticion mas cercana d la lista d pendientes
        const peticionActual = peticionesPendientes.splice(indiceMasCercano, 1)[0];
        
        //calculo los tiempos para esta peticion:
        //- tiempo d busqueda (mover el cabezal)
        //- tiempo d rotacion (esperar al sector)
        //- tiempo d transferencia (leer/escribir)
        peticionActual.calcularTiempos(configDisco, posicionActual);
        
        //guardo cuando empece a procesarla
        peticionActual.tiempoProceso = tiempoActual;
        //sumo su tiempo total al contador
        tiempoActual += peticionActual.tiempoAccesoTotal;
        
        //muevo el cabezal a la posicion d esta peticion
        posicionActual = peticionActual.cilindro;
        
        //la agrego a la lista d peticiones ya procesadas
        peticionesProcesadas.push(peticionActual);
    }

    return peticionesProcesadas;
};

export default algoritmoSSTF;
