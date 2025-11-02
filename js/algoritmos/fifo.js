//algoritmo FIFO (First In First Out)
//este es el mas facil de todos, xq:
//1. agarra las peticiones en el orden q llegaron
//2. las procesa una x una sin ordenar nada
//3. va calculando tiempos a medida q avanza

//pros: super simple y justo (el q llega primero sale primero)
//contras: no optimiza nada, puede hacer q el cabezal se mueva como loco

const algoritmoFIFO = (peticiones, configDisco) => {
    //validar q me pasen los params necesarios
    if(!peticiones || !configDisco) {
        throw new Error('faltan parametros para FIFO!');
    }
    
    let posicionActual = configDisco.posicionActual; //guardo donde empieza el cabezal
    let tiempoActual = 0;   //para ir sumando los tiempos d cada peticion
    
    // proceso cada peticion en orden d llegada
    return peticiones.map(peticion => {
        //hago una copia para no modificar la original
        const peticionProcesada = peticion.clonar();
        
        //calculo cuanto tarda en:
        //1. mover el cabezal hasta el cilindro (tiempo d busqueda)
        //2. esperar q el sector este abajo del cabezal (tiempo d rotacion)
        //3. leer/escribir los datos (tiempo d transferencia)
        peticionProcesada.calcularTiempos(configDisco, posicionActual);
        
        //guardo en q momento del tiempo total empece a procesar esta peticion
        peticionProcesada.tiempoProceso = tiempoActual;
        //sumo el tiempo q me tomo procesarla al total
        tiempoActual += peticionProcesada.tiempoAccesoTotal;
        
        //actualizo donde quedo el cabezal para la siguiente
        posicionActual = peticionProcesada.cilindro;
        
        return peticionProcesada;
    });
};

export default algoritmoFIFO;
