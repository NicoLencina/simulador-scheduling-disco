# Simulador de Algoritmos de Scheduling de Disco

Aplicacion web interactiva para simular y comparar diferentes algoritmos de planificacion del disco duro.

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
- Canvas API para graficos

## Como Usar

1. Clona o descarga el repositorio
2. Abre el archivo `index.html` con Live Server (VS Code)
3. Completa los parametros del disco o usa el boton "Autocompletar"
4. Ingresa las peticiones manualmente o genera aleatorias
5. Selecciona un algoritmo
6. Haz clic en "Simular"

## Estructura del Proyecto

```
SCHEDULING DE DISCO -Simulador/
│
├── index.html              # Interfaz principal
├── css/
│   └── style.css          # Estilos de la aplicacion
├── js/
│   ├── main.js            # Logica principal
│   ├── config.js          # Configuracion del disco
│   ├── request.js         # Clase de peticiones
│   ├── utils.js           # Funciones auxiliares
│   └── algoritmos/        # Algoritmos de scheduling
│       ├── fifo.js
│       ├── sstf.js
│       ├── scan.js
│       ├── cscan.js
│       ├── look.js
│       ├── clook.js
│       ├── fscan.js
│       └── nstepscan.js
├── img/                   # Imagenes y recursos
└── documentos/            # Documentacion adicional

```

## Metricas Calculadas

- **Distancia Total**: Cilindros recorridos por el cabezal
- **Tiempo de Busqueda**: Tiempo de movimiento del cabezal
- **Tiempo de Rotacion**: Tiempo de latencia rotacional
- **Tiempo de Transferencia**: Tiempo de lectura/escritura
- **Tiempo Total de Acceso**: Suma de todos los tiempos

## Requisitos

- Navegador web moderno (Chrome, Firefox, Edge)
- Live Server o servidor web local (para modulos ES6)

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

Nicko - Trabajo Integrador de Sistemas Operativos

## Licencia

Este proyecto es de uso academico.
