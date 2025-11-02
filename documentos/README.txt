# Simulador de Algoritmos de Scheduling de Disco

## Descripcion
Este simulador permite comparar diferentes algoritmos de planificacion del disco duro, calculando y visualizando metricas importantes como tiempos de busqueda, rotacion y transferencia.

## Algoritmos Implementados
- FIFO (First In First Out)
- SSTF (Shortest Seek Time First)
- SCAN
- C-SCAN (Circular SCAN)
- LOOK
- C-LOOK (Circular LOOK)
- F-SCAN
- N-STEP-SCAN

## Parámetros de Configuración
- STM: Multiplicador de tiempo de búsqueda (0.1 - 1.0 ms/cilindro)
- VR: Velocidad rotacional (5400 - 15000 RPM)
- TT1S: Tiempo de transferencia por sector (0.1 - 1.0 ms)
- TB: Bloques por pista (100 - 1000 bloques)
- TP: Total de platos (1 - 8 platos)
- PC: Platos por cilindro (1 - TP)
- SC: Sectores por cilindro (32 - 256 sectores)
- Posición inicial del cabezal

## Funcionalidades
1. Entrada de Datos:
   - Configuración manual de parámetros
   - Autocompletado con valores recomendados
   - Generación aleatoria de peticiones
   - Mínimo 15 peticiones requeridas

2. Visualización de Resultados:
   - Distancia total recorrida
   - Tiempos totales (búsqueda, rotación, transferencia, acceso)
   - Gráfico de movimiento del cabezal
   - Tabla detallada de la secuencia de peticiones

3. Características Adicionales:
   - Casos de prueba integrados
   - Validación de entradas
   - Manejo de errores
   - Interfaz responsiva y amigable

## Cómo Usar
1. Configurar los parámetros del disco (usar autocompletar para valores recomendados)
2. Ingresar lista de peticiones o generarla aleatoriamente
3. Seleccionar el algoritmo deseado
4. Presionar "Simular" para ver los resultados

## Requisitos Técnicos
- Navegador web moderno con soporte para JavaScript ES6
- Servidor web local para ejecutar (usar Live Server en VS Code)

## Validaciones
- Todos los parámetros deben ser números positivos
- Mínimo 15 peticiones requeridas
- PC debe ser menor o igual a TP
- Valores dentro de los rangos recomendados
