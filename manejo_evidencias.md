# Control y Manejo de Evidencias - El Súper Gestor

Este documento registra los procesos, la arquitectura técnica y el historial de cambios del sistema de evidencias y poderes de la plataforma **"El Súper Gestor"**.

---

## 📋 Resumen de la Arquitectura de Evidencias

El módulo de evidencias vincula las carpetas delictivas o administrativas de los metahumanos con pruebas tangibles recopiladas por los burócratas. Cada evidencia puede contener:
- Descripción detallada del acontecimiento.
- Fecha de recolección de la prueba.
- Archivo adjunto (Imagen en formato PNG, JPG o JPEG).
- Una o más multas asociadas por daños colaterales.

---

## 🚀 Historial de Cambios y Bitácora de Desarrollo

### 📅 Fecha: 4 de Julio de 2026

#### 1. Carga de Semilla de Poderes Metahumanos (Seeder)
* **Objetivo**: Poblar la base de datos con al menos 15 poderes metahumanos generales para evitar tener una base de datos vacía al iniciar el servidor.
* **Solución**:
  * Diseñamos una lista de **16 poderes generales** clasificados en 7 categorías (`SENSORIAL`, `FISICO`, `DIMENSIONAL`, `OPTICO`, `PSIQUICO`, `BIOLOGICO`, `ELEMENTAL`).
  * Cada poder cuenta con nombre único, descripción de poder, debilidad, descripción de debilidad y costo de multa estimado.
  * Modificamos el archivo de semilla para insertar los registros automáticamente de manera controlada para no duplicar datos si ya existen.
* **Archivos Modificados**:
  * [seeder.ts](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Backend/src/shared/db/seeder.ts) - Integración de la semilla de poderes.
  * [poderes_generales.md](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/poderes_generales.md) - Documento de referencia de la lista de poderes creados.

#### 2. Carga y Visualización de Archivos Adjuntos (JPG/PNG) en Evidencias
* **Objetivo**: Permitir a los burócratas adjuntar capturas, fotografías o documentos en formato JPG/PNG como parte de la evidencia.
* **Solución técnica (Base64)**: 
  * Se optó por una estrategia de conversión a Base64 en el cliente. Esto elimina la necesidad de almacenamiento físico en carpetas del servidor y simplifica el despliegue.
  * Añadimos una columna `imagen` de tipo `longtext` en la tabla `evidencia` en la base de datos.
  * Ampliamos el límite de tamaño de petición JSON a `50mb` en el servidor de Express para soportar payloads grandes de imágenes.
  * Se implementó un campo de carga de archivo en el frontend con previsualización en tiempo real y opción de descarte.
  * En la lista de evidencias se añadió un visualizador integrado que permite abrir la imagen en tamaño completo al hacer clic sobre ella.
* **Archivos Modificados**:
  * [evidencia.entity.ts](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Backend/src/evidencia/evidencia.entity.ts) - Agregada la propiedad `imagen`.
  * [evidencia.controller.ts](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Backend/src/evidencia/evidencia.controller.ts) - Sanitización del campo `imagen` en peticiones entrantes.
  * [app.ts](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Backend/src/app.ts) - Incrementado el límite a `50mb` en los parsers de Express.
  * [CarpetaDetalle.jsx](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Front/src/pages/burocrata/CarpetaDetalle.jsx) - Agregado input de archivos, conversión a Base64, preview y visualización.

#### 3. Depuración y Robustez en el Flujo de Evidencias (Bug Fixes)
* **Objetivo**: Resolver problemas en los que el guardado de evidencias fallaba silenciosamente o arrojaba errores 400 injustificados en el uso cotidiano.
* **Soluciones aplicadas**:
  * **Timezone & Clock Skew**: La validación previa de fechas futuras comparaba contra la hora exacta del servidor en el milisegundo actual (`nuevaEvidencia.fechaRecoleccion > new Date()`). Cualquier mínima diferencia de reloj local/servidor provocaba un rechazo automático. Modificamos el límite para que permita cualquier hora del día actual y bloquee solo a partir del día siguiente (`mañana a las 00:00:00`).
  * **Invalid Date Crash**: Agregamos un control en el backend para detectar si el formato de fecha proporcionado es inválido (`isNaN(fecha.getTime())`), arrojando un error `400` en lugar de dejar que el sistema crasheara con un error `500` en la base de datos.
  * **Alertas Visuales en Frontend**: Modificamos el frontend para interceptar los errores de red de Axios y presentárselos al usuario por pantalla mediante un `alert()` en lugar de registrarlos únicamente por consola.
  * **Defensa de Carga en Carpeta**: Evitamos consultas de metahumanos nulos (`/api/metahumanos/undefined`) cuando una carpeta no tiene metahumano asignado.
* **Archivos Modificados**:
  * [evidencia.controller.ts](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Backend/src/evidencia/evidencia.controller.ts) - Ajuste del límite de fecha y control de fechas inválidas en creación (`add`) y actualización (`update`).
  * [CarpetaDetalle.jsx](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Front/src/pages/burocrata/CarpetaDetalle.jsx) - Validación defensiva de metahumano y retroalimentación mediante `alert` en errores de red.

#### 4. Sincronización de Aprobaciones y Visualización de Evidencias en el Panel del Metahumano
* **Objetivo**: Corregir la desconexión del flujo de aprobación donde el metahumano no visualizaba las evidencias ni las imágenes adjuntas presentadas en su contra, y además no podía pagar multas una vez que el administrador las aprobaba.
* **Solución**:
  * **Visualización de Evidencias**: Modificamos el panel del metahumano para renderizar la lista de evidencias y adjuntos (incluyendo sus imágenes JPG/PNG) bajo cada carpeta. Ahora el metahumano tiene acceso total a las pruebas de su expediente.
  * **Habilitación de Pago de Multas**: Anteriormente, el botón "💳 Pagar Multa" del metahumano solo aparecía si la multa estaba en estado `PENDIENTE` (lo cual es incorrecto, ya que no se pueden pagar multas que no han sido aprobadas por el administrador). Cambiamos esta condición para que el botón de pago sea visible únicamente cuando la multa pasa al estado `APROBADA`.
  * **Soporte de Estados en Mayúsculas**: Ajustamos el renderizado de etiquetas en la vista del metahumano para procesar de forma case-insensitive los estados devueltos en mayúsculas por el backend (`APROBADA`, `RECHAZADA`, `ACTIVA`, `PENDIENTE`, `CERRADA`).
* **Archivos Modificados**:
  * [carpetasMeta.jsx](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Front/src/pages/meta/carpetasMeta.jsx) - Implementado el listado de evidencias con adjuntos, corrección de condiciones de pago de multas y lógica de visualización de estados en mayúsculas.

---

## 📈 Próximos Pasos y Roadmap

1. **Compresión de Imágenes**: Implementar un pre-procesador en el Frontend para reducir la resolución y calidad de las imágenes pesadas antes de convertirlas a Base64, optimizando el consumo de ancho de banda y almacenamiento de la base de datos.
2. **Historial de Modificaciones**: Añadir una tabla de auditoría para registrar qué burócrata modificó o cargó cada archivo de evidencia.
