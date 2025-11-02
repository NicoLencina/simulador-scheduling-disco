//esta clase representa cada peticion q llega al disco
//guarda toda la info d la peticion y los tiempos q tarda
//despues con esto puedo hacer los calculos d tiempo total y eso
class PeticionDisco {
    //cuando creo una peticion necesito saber q cilindro pide
    //y cuando llego (este ultimo es opcional, x default es 0)
    constructor(cilindro, tiempoLlegada = 0) {
        this.cilindro = Number(cilindro);
        this.tiempoLlegada = Number(tiempoLlegada);
        this.tiempoProceso = 0; // Tiempo en que se procesa la peticion
        this.tiempoBusqueda = 0; // Tiempo de busqueda
        this.retrasoRotacional = 0; // Tiempo de retardo rotacional
        this.tiempoTransferencia = 0; // Tiempo de transferencia
        this.tiempoAccesoTotal = 0; // Tiempo total de acceso
    }

    /**
     * Calcula los tiempos de la peticion
     * @param {ConfiguracionDisco} configDisco - Configuracion del disco
     * @param {number} cilindroAnterior - Cilindro anterior
     */
    calcularTiempos(configDisco, cilindroAnterior) {
        // Calcular tiempo de busqueda
        this.tiempoBusqueda = configDisco.calcularTiempoBusqueda(cilindroAnterior, this.cilindro);
        
        // Calcular retardo rotacional
        this.retrasoRotacional = configDisco.calcularRetrasoRotacional();
        
        // Calcular tiempo de transferencia
        this.tiempoTransferencia = configDisco.tiempoTransferenciaSector;
        
        // Calcular tiempo total de acceso
        this.tiempoAccesoTotal = this.tiempoBusqueda + this.retrasoRotacional + this.tiempoTransferencia;
    }

    /**
     * Calcula la distancia entre esta peticion y otra posicion
     * @param {number} posicion - Posicion para calcular la distancia
     * @returns {number} Distancia absoluta entre las posiciones
     */
    obtenerDistanciaA(posicion) {
        return Math.abs(this.cilindro - posicion);
    }

    /**
     * Crea una copia de la peticion
     * @returns {PeticionDisco} Nueva instancia con los mismos valores
     */
    clonar() {
        const clon = new PeticionDisco(this.cilindro, this.tiempoLlegada);
        clon.tiempoProceso = this.tiempoProceso;
        clon.tiempoBusqueda = this.tiempoBusqueda;
        clon.retrasoRotacional = this.retrasoRotacional;
        clon.tiempoTransferencia = this.tiempoTransferencia;
        clon.tiempoAccesoTotal = this.tiempoAccesoTotal;
        return clon;
    }
}

// Exportar la clase para su uso en otros módulos
export default PeticionDisco;
