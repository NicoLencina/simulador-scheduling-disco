# Simulador de Algoritmos de Scheduling de Disco

Aplicacion web para simular y comparar algoritmos de planificacion de disco. Este simulador te permite entender como funcionan los diferentes algoritmos de scheduling de disco de manera visual e interactiva.

## Demo Online

[Ver Demo](https://nicolencina.github.io/simulador-scheduling-disco/)

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

1. Ve a la demo online o descarga el repositorio
2. Si lo descargaste, abre `index.html` con Live Server
3. Configura el disco:
   - Usa "Autocompletar" para valores por defecto
   - O ingresa tus propios valores
4. Agrega peticiones (se completa a 15 si lo deseas):
   - Escribe numeros separados por comas
   - O usa "Generar" para crear aleatorias
5. Elige un algoritmo de scheduling
6. Selecciona el modo:
   - Estricto: usa rangos recomendados
   - Libre: sin restricciones
7. Dale click a "Simular"
8. Revisa los resultados:
   - Movimiento del cabezal
   - Tiempos de operacion
   - Metricas detalladas
   - Orden de las peticiones

## Estructura del Proyecto

```
SCHEDULING DE DISCO -Simulador/
│
├── index.html              # Pagina principal
├── css/
│   ├── style.css          # Estilos generales
│   └── tooltip.css        # Estilos de tooltips
├── js/
│   ├── main.js            # Archivo principal
│   ├── config.js          # Configuracion del disco
│   ├── request.js         # Manejo de peticiones
│   ├── utils.js           # Funciones auxiliares
│   ├── ui.js             # Interfaz de usuario
│   ├── graficos.js        # Generacion de graficos
│   ├── calculos.js       # Calculos y metricas
│   └── algoritmos/        # Implementaciones
│       ├── fifo.js        # First In First Out
│       ├── sstf.js        # Shortest Seek Time First
│       ├── scan.js        # SCAN 
│       ├── cscan.js       # Circular SCAN
│       ├── look.js        # LOOK
│       ├── clook.js       # C-LOOK
│       ├── fscan.js       # F-SCAN
│       └── nstepscan.js   # N-Step-SCAN
├── img/                   # Imagenes
└── documentos/            # Documentacion
    └── VALORES_PARAMETROS.md  # Parametros del sistema

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

## Instalacion Local

```bash
# Clonar el repo
git clone https://github.com/NicoLencina/simulador-scheduling-disco.git

# Abrir carpeta
cd simulador-scheduling-disco

# Ejecutar con Live Server en VS Code
# Click derecho en index.html > Open with Live Server
```

## Autor

Lencina Nicolas - Trabajo Integrador de Sistemas Operativos

## Licencia

Este proyecto es de uso academico.
