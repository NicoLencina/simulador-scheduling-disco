//aca guardo toda la config del disco duro
//son los parametros q nos pidio el profe en la consigna
//me costo entender para q sirven algunos pero bue
class ConfiguracionDisco {
    constructor() {
        this.multiplicadorTiempoBusqueda = 0;   //STM: esto multiplica x la distancia recorrida
        this.velocidadRotacional = 0;           //VR: q tan rapido gira el disco (en RPM)
        this.tiempoTransferenciaSector = 0;     //TT1S: lo q tarda en pasar la data de 1 sector
        this.bloquesPorPista = 0;               //TB: cuantos bloques entran en una pista
        this.totalPlatos = 0;                   //TP: cant d platos q tiene el disco
        this.platosPorCilindro = 0;             //PC: platos q hay x cilindro
        this.sectoresPorCilindro = 0;           //SC: sectores en c/cilindro
        this.posicionActual = 0;                //donde esta parado el cabezal ahora
    }

    /**
     * Establece los parametros de configuracion del disco
     * @param {Object} parametros - Objeto con los parametros del disco
     */
    establecerConfig(parametros) {
        this.multiplicadorTiempoBusqueda = Number(parametros.stm);
        this.velocidadRotacional = Number(parametros.vr);
        this.tiempoTransferenciaSector = Number(parametros.tt1s);
        this.bloquesPorPista = Number(parametros.tb);
        this.totalPlatos = Number(parametros.tp);
        this.platosPorCilindro = Number(parametros.pc);
        this.sectoresPorCilindro = Number(parametros.sc);
        this.posicionActual = Number(parametros.posicionInicial || 0);
        
        this.validarConfig();
    }

    /**
     * Valida que los parametros del disco sean validos
     * @throws {Error} Si algun parametro es invalido
     */
    validarConfig() {
        if (this.multiplicadorTiempoBusqueda <= 0) throw new Error("El multiplicador de tiempo de busqueda debe ser mayor a 0");
        if (this.velocidadRotacional <= 0) throw new Error("La velocidad rotacional debe ser mayor a 0");
        if (this.tiempoTransferenciaSector <= 0) throw new Error("El tiempo de transferencia por sector debe ser mayor a 0");
        if (this.bloquesPorPista <= 0) throw new Error("Los bloques por pista deben ser mayor a 0");
        if (this.totalPlatos <= 0) throw new Error("El total de platos debe ser mayor a 0");
        if (this.platosPorCilindro <= 0) throw new Error("Los platos por cilindro deben ser mayor a 0");
        if (this.sectoresPorCilindro <= 0) throw new Error("Los sectores por cilindro deben ser mayor a 0");
    }

    /**
     * Calcula el tiempo de busqueda entre dos posiciones
     * @param {number} desde - Posicion inicial
     * @param {number} hasta - Posicion final
     * @returns {number} Tiempo de busqueda en milisegundos
     */
    calcularTiempoBusqueda(desde, hasta) {
        const distancia = Math.abs(hasta - desde);
        return distancia * this.multiplicadorTiempoBusqueda;
    }

    /**
     * Calcula el tiempo de rotacion
     * @returns {number} Tiempo de rotacion en milisegundos
     */
    calcularRetrasoRotacional() {
        // Convertir RPM a milisegundos por revolucion
        const msPerRevolucion = (60 * 1000) / this.velocidadRotacional;
        // En promedio, se necesita media revolucion
        return msPerRevolucion / 2;
    }
}

// Exportar la clase para su uso en otros módulos
export default ConfiguracionDisco;
