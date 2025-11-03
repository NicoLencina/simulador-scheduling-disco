// Funciones para dibujar gráficos
export {
    dibujarGrafico,
    dibujarGraficoTiempos,
    dibujarGraficoCircular,
    dibujarGraficoDistancias
};

// Gráfico de movimiento del cabezal
function dibujarGrafico(cilindros, tiempos) {
    const canvas = document.getElementById('grafico-movimiento');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = 500;
    
    // Configuración de márgenes y escalas
    const margenIzq = 80;
    const margenDer = 40;
    const margenTop = 40;
    const margenBot = 60;
    
    const anchoGrafico = canvas.width - margenIzq - margenDer;
    const altoGrafico = canvas.height - margenTop - margenBot;
    
    // Limpiar y establecer fondo
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const gradienteFondo = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradienteFondo.addColorStop(0, '#f8f9fa');
    gradienteFondo.addColorStop(1, '#ffffff');
    ctx.fillStyle = gradienteFondo;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // ... resto del código de dibujarGrafico ...
}

// Gráfico de barras para tiempos
function dibujarGraficoTiempos(tiempoBusqueda, tiempoRotacion, tiempoTransferencia) {
    const canvas = document.getElementById('grafico-tiempos');
    if (!canvas) return;
    
    // ... código de dibujarGraficoTiempos ...
}

// Gráfico circular para proporción de tiempos
function dibujarGraficoCircular(tiempoBusqueda, tiempoRotacion, tiempoTransferencia) {
    const canvas = document.getElementById('grafico-circular');
    if (!canvas) return;
    
    // ... código de dibujarGraficoCircular ...
}

// Gráfico de distancias por petición
function dibujarGraficoDistancias(peticiones, posInicial) {
    const canvas = document.getElementById('grafico-distancias');
    if (!canvas) return;
    
    // ... código de dibujarGraficoDistancias ...
}