# Simulador de Algoritmos de Scheduling de Disco

Aplicacion web interactiva para simular y comparar diferentes algoritmos de planificacion del disco duro.

## Demo en Vivo

🌐 [Ver Demo en GitHub Pages](https://nicolencina.github.io/simulador-scheduling-disco/)

---

## Algoritmos Implementados

- **FIFO** (First In First Out)
- **SSTF** (Shortest Seek Time First)
- **SCAN** (Algoritmo del Ascensor)
- **C-SCAN** (Circular SCAN)
- **LOOK** (SCAN mejorado)
- **C-LOOK** (Circular LOOK)
- **F-SCAN** (Frozen SCAN)
- **N-STEP-SCAN** (SCAN por grupos)

## Características

- Interface visual intuitiva
- Autocompletado de valores recomendados
- Generacion aleatoria de peticiones
- Visualizacion grafica del movimiento del cabezal
- Calculo de metricas de rendimiento
- Comparacion entre algoritmos
- Responsive design

## Tecnologias Utilizadas

- HTML5
- CSS3
- JavaScript Vanilla (ES6+)
- Chart.js para gráficos interactivos
- Sistema de módulos ES6
- FontAwesome para iconos

## Como Usar

1. Clona o descarga el repositorio
2. Abre el archivo `index.html` con Live Server (VS Code)
3. Completa los parámetros del disco:
   - Usa el botón "Autocompletar" para valores predeterminados
   - O ingresa manualmente siguiendo los rangos recomendados
4. Ingresa las peticiones (mínimo 15):
   - Manualmente: números separados por comas
   - O usa el botón "Generar" para crear aleatorias
5. Selecciona un algoritmo de scheduling
6. Ajusta el modo de operación:
   - Modo Estricto: valores dentro de rangos recomendados
   - Modo Libre: sin restricciones de valores
7. Haz clic en "Simular"
8. Analiza los resultados:
   - Gráfico de movimiento del cabezal
   - Distribución de tiempos
   - Estadísticas detalladas
   - Secuencia de peticiones

## Estructura del Proyecto

```
SCHEDULING DE DISCO -Simulador/
│
├── index.html              # Interfaz principal
├── css/
│   ├── style.css          # Estilos principales
│   └── tooltip.css        # Estilos para tooltips
├── js/
│   ├── main.js            # Punto de entrada y configuración global
│   ├── config.js          # Clase ConfiguracionDisco
│   ├── request.js         # Clase PeticionDisco
│   ├── utils.js           # Funciones comunes
│   ├── eventos.js         # Manejadores de eventos UI
│   ├── graficos.js        # Visualización con Chart.js
│   ├── simulacion.js      # Lógica de simulación
│   └── algoritmos/        # Implementación de algoritmos
│       ├── fifo.js        # First In First Out
│       ├── sstf.js        # Shortest Seek Time First
│       ├── scan.js        # SCAN (Elevator)
│       ├── cscan.js       # Circular SCAN
│       ├── look.js        # LOOK
│       ├── clook.js       # Circular LOOK
│       ├── fscan.js       # Frozen SCAN
│       └── nstepscan.js   # N-Step-SCAN
├── img/                   # Imágenes y recursos
└── documentos/            # Documentación adicional
    ├── guia_estilo.md     # Guía de estilo del código
    └── VALORES_PARAMETROS.md  # Documentación de parámetros

```

## Métricas y Visualizaciones

### Métricas Calculadas
- **Distancia Total**: Cantidad total de cilindros recorridos por el cabezal
- **Tiempo de Búsqueda**: Tiempo acumulado de movimiento del cabezal
- **Tiempo de Rotación**: Tiempo total de latencia rotacional
- **Tiempo de Transferencia**: Tiempo total de lectura/escritura
- **Tiempo Total de Acceso**: Suma de todos los tiempos anteriores

### Visualizaciones
- **Gráfico de Movimiento**: Muestra el recorrido del cabezal
- **Gráfico de Barras**: Distribución de los diferentes tiempos
- **Gráfico Circular**: Proporción de cada tipo de tiempo
- **Gráfico de Distancias**: Distancia recorrida por petición
- **Tabla de Secuencia**: Detalles de cada petición procesada

## Requisitos

- Navegador web moderno (Chrome, Firefox, Edge)
- Live Server o servidor web local (para módulos ES6)
- Resolución mínima recomendada: 1024x768
- JavaScript habilitado
- Conexión a Internet (para CDN de Chart.js y FontAwesome)

## Instalacion

```bash
# Clonar el repositorio
git clone https://github.com/TU-USUARIO/simulador-scheduling-disco.git

# Abrir con VS Code
cd simulador-scheduling-disco
code .

# Usar Live Server para ejecutar
# Click derecho en index.html > Open with Live Server
```

## Autor

Lencina Nicolas - Trabajo Integrador de Sistemas Operativos

## Licencia

Este proyecto es de uso academico.
