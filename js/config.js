//importo funciones comunes
import * as utils from './utils.js';

//aca guardo toda la config del disco duro
//son los parametros q nos pidio el profe en la consigna
//me costo entender para q sirven algunos pero bue
class ConfiguracionDisco {
    //rangos validos para los parametros
    static RANGOS = {
        STM: { min: 0.1, max: 100 },      //tiempo d busqueda x cilindro (ms)
        VR: { min: 3600, max: 15000 },     //velocidad rotacional (RPM)
        TT1S: { min: 0.1, max: 50 },      //tiempo d transferencia x sector (ms)
        TB: { min: 1, max: 1024 },         //bloques x pista
        TP: { min: 1, max: 16 },          //total d platos
        PC: { min: 1, max: 16 },          //platos x cilindro
        SC: { min: 1, max: 256 },         //sectores x cilindro
        POS: { min: 0, max: 199 }         //posicion del cabezal
    };
    
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
        //uso destructuring para mas claridad
        const { stm, vr, tt1s, tb, tp, pc, sc, posicionInicial = 0 } = parametros;
        
        //convierto a numeros y valido los rangos
        this.multiplicadorTiempoBusqueda = this._validarParametro(stm, 'STM');
        this.velocidadRotacional = this._validarParametro(vr, 'VR');
        this.tiempoTransferenciaSector = this._validarParametro(tt1s, 'TT1S');
        this.bloquesPorPista = this._validarParametro(tb, 'TB');
        this.totalPlatos = this._validarParametro(tp, 'TP');
        this.platosPorCilindro = this._validarParametro(pc, 'PC');
        this.sectoresPorCilindro = this._validarParametro(sc, 'SC');
        this.posicionActual = this._validarParametro(posicionInicial, 'POS');
        
        this.validarConfig();
    }

    /**
     * Valida un parametro usando la funcion comun validarRango
     * @param {string|number} valor - Valor a validar
     * @param {string} nombre - Nombre del parametro (para buscar su rango)
     * @returns {number} Valor validado y convertido a numero
     */
    _validarParametro(valor, nombre) {
        const num = Number(valor);
        const rango = ConfiguracionDisco.RANGOS[nombre];
        if (!utils.validarRango(num, rango.min, rango.max)) {
            throw new Error(`${nombre} debe estar entre ${rango.min} y ${rango.max}`);
        }
        return num;
    }

    /**
     * Valida que los parametros del disco sean validos
     * @throws {Error} Si algun parametro es invalido
     */
    validarConfig() {
        //valido relaciones entre parametros
        if (this.totalPlatos < this.platosPorCilindro) {
            throw new Error("El total de platos debe ser mayor o igual a los platos por cilindro");
        }
        
        if (this.bloquesPorPista * this.totalPlatos < this.sectoresPorCilindro) {
            throw new Error("La capacidad total debe ser coherente con los sectores por cilindro");
        }
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
        return this.tiempoPorRevolucion / 2;
    }
    
    /**
     * Obtiene el tiempo por revolucion en ms
     * @returns {number} Tiempo por revolucion en milisegundos
     */
    get tiempoPorRevolucion() {
        return (60 * 1000) / this.velocidadRotacional;
    }
    
    /**
     * Obtiene la capacidad total del disco en sectores
     * @returns {number} Capacidad total en sectores
     */
    get capacidadTotal() {
        return this.bloquesPorPista * this.totalPlatos;
    }
}

// Exportar la clase para su uso en otros módulos
export default ConfiguracionDisco;
