# Guía de Estilo y Buenas Prácticas

## 1. Estilo de Comentarios

### Comentarios en CSS
- Usar lenguaje natural pero profesional
- Explicar el propósito y no solo describir
- Incluir el "por qué" además del "qué"
- Usar abreviaturas comunes (q → que, x → por)
- Mantener coherencia en el formato

Ejemplo:
```css
/* contenedor principal q mantiene todo centrado */
.contenedor {
    max-width: 1200px;  /* ancho maximo para pantallas grandes */
    margin: 0 auto;     /* esto lo centra en la pantalla */
    padding: 20px;      /* espacio interno para q no quede todo pegado */
}
```

### Comentarios en JavaScript
- Explicar la lógica del código
- Usar lenguaje conversacional pero claro
- Incluir ejemplos cuando sea necesario
- Marcar secciones importantes

Ejemplo:
```javascript
// funcion q procesa los datos y los valida
function procesarDatos(datos) {
    // primero limpio espacios en blanco
    datos = datos.trim();
    
    // si esta vacio tiro error
    if (!datos) {
        throw new Error('no me mandaste datos!');
    }
    
    // convierto a numero y verifico
    return Number(datos);
}
```

## 2. Nomenclatura

### Nombres de Clases CSS
- Usar español
- Separar palabras con guiones
- Descriptivos pero concisos
- Seguir una jerarquía lógica

Ejemplos:
- ✅ `.contenedor-principal`
- ✅ `.boton-primario`
- ✅ `.tarjeta-usuario`

### Variables y Funciones JavaScript
- Usar camelCase
- Nombres descriptivos
- Verbos para funciones
- Sustantivos para variables

Ejemplos:
- ✅ `calcularPromedio()`
- ✅ `obtenerDatosUsuario()`
- ✅ `listaPeticiones`

## 3. Estructura del Código

### HTML
- Indentar correctamente
- Usar secciones semánticas
- Comentar secciones principales
- Mantener orden lógico

### CSS
- Agrupar estilos relacionados
- Ordenar propiedades consistentemente
- Usar variables CSS para valores reusables
- Mantener especificidad controlada

### JavaScript
- Separar lógica en funciones
- Manejar errores apropiadamente
- Evitar código repetido
- Usar módulos cuando sea posible

## 4. Responsive Design
- Mobile-first cuando sea posible
- Breakpoints estándar
- Diseño fluido
- Testing en múltiples dispositivos

## 5. Optimización
- Minimizar anidamiento CSS
- Evitar selectores innecesariamente específicos
- Mantener el JavaScript modular
- Comentar solo lo necesario

## 6. Buenas Prácticas Generales
- Mantener el código DRY (Don't Repeat Yourself)
- Nombres claros y descriptivos
- Consistencia en el estilo
- Documentar decisiones importantes

## 7. Tips para que el Código Parezca más Natural
- Incluir pequeños comentarios explicativos
- Usar nombres de variables descriptivos
- No hacer el código demasiado "perfecto"
- Mantener un balance entre profesionalismo y naturalidad

## 8. Proceso de Trabajo
1. Revisar esta guía antes de empezar
2. Planificar la estructura
3. Implementar siguiendo las convenciones
4. Revisar y ajustar según necesidad
5. Documentar decisiones importantes

## 9. Ejemplos de Código Natural

### CSS Natural:
```css
/* colors q uso en toda la app */
:root {
    --color-principal: #2196F3;    /* azul para destacar cosas */
    --color-texto: #333;           /* casi negro, mejor q negro puro */
    --sombra: 0 2px 4px rgba(0,0,0,0.1);  /* sombritas sutiles */
}
```

### JavaScript Natural:
```javascript
// funcion para validar datos
function validarDatos(datos) {
    // si no hay datos, no sigo
    if (!datos) return false;
    
    // limpio espacios de mas
    datos = datos.trim();
    
    // devuelvo true si paso todo
    return datos.length > 0;
}
```

## 10. Mantenimiento
- Revisar y actualizar esta guía regularmente
- Agregar nuevos ejemplos según sea necesario
- Mantener la coherencia en todo el proyecto
- Documentar cambios importantes