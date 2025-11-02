//aca pongo todas las funciones q voy a usar en varios lados
//son cosas q se repiten mucho asi q mejor tenerlas aca

//esta funcion chequea q un numero este entre min y max
//la uso para validar q los numeros q ingresa el usuario sean correctos
//devuelve true si esta bien, false si no
export const validarRango = (valor, minimo, maximo) => {
    const num = Number(valor);
    return !isNaN(num) && num >= minimo && num <= maximo;
};

/**
 * Convierte una cadena de texto en un array de numeros
 * @param {string} entrada - Cadena de texto con numeros separados por comas
 * @returns {number[]} Array de numeros
 */
export const procesarListaPeticiones = (entrada) => {
    return entrada.split(',')
        .map(num => num.trim())
        .filter(num => num !== '')
        .map(Number)
        .filter(num => !isNaN(num));
};

/**
 * Calcula estadisticas de la simulacion
 * @param {PeticionDisco[]} peticiones - Array de peticiones procesadas
 * @returns {Object} Objeto con las estadisticas calculadas
 */
export const calcularEstadisticas = (peticiones) => {
    const estadisticas = {
        tiempoBusquedaTotal: 0,
        retrasoRotacionalTotal: 0,
        tiempoTransferenciaTotal: 0,
        tiempoAccesoTotal: 0,
        distanciaTotal: 0,
        tiempoBusquedaPromedio: 0,
        tiempoAccesoPromedio: 0
    };

    let cilindroAnterior = peticiones[0]?.cilindro || 0;

    peticiones.forEach(peticion => {
        estadisticas.tiempoBusquedaTotal += peticion.tiempoBusqueda;
        estadisticas.retrasoRotacionalTotal += peticion.retrasoRotacional;
        estadisticas.tiempoTransferenciaTotal += peticion.tiempoTransferencia;
        estadisticas.tiempoAccesoTotal += peticion.tiempoAccesoTotal;
        estadisticas.distanciaTotal += Math.abs(peticion.cilindro - cilindroAnterior);
        cilindroAnterior = peticion.cilindro;
    });

    const cantidad = peticiones.length;
    if (cantidad > 0) {
        estadisticas.tiempoBusquedaPromedio = estadisticas.tiempoBusquedaTotal / cantidad;
        estadisticas.tiempoAccesoPromedio = estadisticas.tiempoAccesoTotal / cantidad;
    }

    return estadisticas;
};

/**
 * Formatea un numero a un string con 2 decimales
 * @param {number} numero - Numero a formatear
 * @returns {string} Numero formateado con 2 decimales
 */
export const formatearNumero = (numero) => {
    return Number(numero).toFixed(2);
};

/**
 * Valida la configuracion inicial del disco
 * @param {Object} configuracion - Objeto con la configuracion del disco
 * @returns {string|null} Mensaje de error o null si es valido
 */
export const validarConfiguracionInicial = (configuracion) => {
    if (!configuracion.stm || configuracion.stm <= 0) return "El multiplicador de tiempo de búsqueda debe ser mayor a 0";
    if (!configuracion.vr || configuracion.vr <= 0) return "La velocidad rotacional debe ser mayor a 0";
    if (!configuracion.tt1s || configuracion.tt1s <= 0) return "El tiempo de transferencia por sector debe ser mayor a 0";
    if (!configuracion.tb || configuracion.tb <= 0) return "Los bloques por pista deben ser mayor a 0";
    if (!configuracion.tp || configuracion.tp <= 0) return "El total de platos debe ser mayor a 0";
    if (!configuracion.pc || configuracion.pc <= 0) return "Los platos por cilindro deben ser mayor a 0";
    if (!configuracion.sc || configuracion.sc <= 0) return "Los sectores por cilindro deben ser mayor a 0";
    return null;
};
