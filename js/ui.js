// Funciones de interfaz de usuario

/**
 * Muestra un error en un campo específico del formulario
 * @param {string} idCampo - ID del campo con error
 * @param {string} mensaje - Mensaje de error a mostrar
 */
export function mostrarErrorCampo(idCampo, mensaje) {
    const campo = document.getElementById(idCampo);
    if (campo) {
        campo.classList.add('campo-error');
        
        const grupoFormulario = campo.closest('.grupo-formulario');
        const mensajeAnterior = grupoFormulario.querySelector('.mensaje-error');
        if (mensajeAnterior) {
            mensajeAnterior.remove();
        }
        
        const mensajeError = document.createElement('span');
        mensajeError.className = 'mensaje-error';
        mensajeError.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${mensaje}`;
        grupoFormulario.appendChild(mensajeError);
        
        campo.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

/**
 * Muestra una notificación en la pantalla
 * @param {string} mensaje - Mensaje a mostrar
 * @param {string} tipo - Tipo de notificación (error, success, warning)
 */
export function mostrarNotificacion(mensaje, tipo = 'error') {
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion notificacion-${tipo}`;
    
    const icono = tipo === 'success' ? 'check-circle' : 
                 tipo === 'warning' ? 'exclamation-triangle' : 'times-circle';
    
    notificacion.innerHTML = `
        <i class="fas fa-${icono}"></i>
        <span>${mensaje}</span>
    `;
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => notificacion.classList.add('mostrar'), 10);
    
    setTimeout(() => {
        notificacion.classList.remove('mostrar');
        setTimeout(() => notificacion.remove(), 300);
    }, 4000);
}

/**
 * Limpia todos los errores del formulario
 */
export function limpiarErrores() {
    document.querySelectorAll('.campo-error').forEach(campo => {
        campo.classList.remove('campo-error');
    });
    document.querySelectorAll('.mensaje-error').forEach(msg => {
        msg.remove();
    });
}

/**
 * Cambia entre modo estricto y libre
 * @param {boolean} modoLibre - Si está en modo libre o no
 */
export function cambiarModoValidacion(modoLibre) {
    const modoTexto = document.getElementById('modo-texto');
    const modoDescripcion = document.getElementById('modo-descripcion');
    
    if (modoLibre) {
        modoTexto.textContent = 'Modo Libre';
        modoDescripcion.textContent = 'Valores personalizados sin restricciones';
        mostrarNotificacion('Modo Libre activado - Puedes usar cualquier valor', 'warning');
    } else {
        modoTexto.textContent = 'Modo Estricto';
        modoDescripcion.textContent = 'Valores dentro de rangos recomendados';
        mostrarNotificacion('Modo Estricto activado - Valores dentro de rangos', 'success');
    }
}

/**
 * Muestra los parámetros extra según el algoritmo seleccionado
 */
export function mostrarParamsExtra() {
    const algoritmo = document.getElementById('algoritmo').value;
    const paramsDiv = document.getElementById('algorithm-params');
    const nStepParam = document.querySelector('.n-step-param');
    
    if(algoritmo === 'nstepscan') {
        paramsDiv.classList.remove('oculto');
        nStepParam.classList.remove('oculto');
    } else {
        paramsDiv.classList.add('oculto');
        nStepParam.classList.add('oculto');
    }
}

/**
 * Genera una lista aleatoria de peticiones
 * @param {number} cantidad - Cantidad de peticiones a generar (por defecto 15)
 */
export function generarPeticionesRandom(cantidad = 15) {
    const maxCilindro = 199;
    
    const peticiones = Array.from({ length: cantidad }, 
        () => Math.floor(Math.random() * (maxCilindro + 1)));
    
    const campo = document.getElementById('requests');
    campo.value = peticiones.join(', ');
    campo.classList.remove('campo-error');
    
    const grupoFormulario = campo.closest('.grupo-formulario');
    const mensajeAnterior = grupoFormulario.querySelector('.mensaje-error');
    if (mensajeAnterior) {
        mensajeAnterior.remove();
    }
}