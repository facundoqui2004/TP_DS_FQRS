# 📝 Registro General de Cambios - El Súper Gestor

**Fecha de Actualización:** 6 de Julio de 2026  
**Autor:** Antigravity (AI Pair Programmer)

Este documento detalla las modificaciones técnicas, corrección de bugs y nuevas reglas de negocio aplicadas al sistema de expedientes y trámites de metahumanos.

---

## 📅 Cambios Implementados - 5 de Julio de 2026

### 1. 🛡️ Control de Duplicados en Registro de Multas
* **Objetivo:** Evitar la creación accidental de cargos idénticos repetidos para una misma evidencia.
* **Solución Técnica:**
  * **Backend:** En [Multa.controller.ts](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Backend/src/Multas/Multa.controller.ts#L57-L67), añadimos una verificación con `em.findOne` antes del guardado. Si ya existe una multa con el mismo `motivoMulta` y `montoMulta` asociada a la misma `evidenciaId`, se devuelve un estado HTTP `400 Bad Request` con el mensaje: *"Ya existe una multa registrada con el mismo motivo y monto para esta evidencia"*.
  * **Frontend:** Actualizamos la función de creación en [CarpetaDetalle.jsx](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Front/src/pages/burocrata/CarpetaDetalle.jsx#L167-L171) para interceptar y mostrar por pantalla la respuesta exacta de error devuelta por el servidor.

---

### 2. 🐛 Reparación de Aprobación de Multas (Módulo Admin)
* **Objetivo:** Resolver el error `401 Unauthorized` / CORS al aprobar o rechazar multas desde el panel de administración.
* **Solución Técnica:**
  * Se eliminaron las peticiones manuales con `fetch` nativo que tenían la URL base cableada e ignoraban los interceptores de sesión.
  * En [gestionar-multas.jsx](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Front/src/pages/admin/tramites/gestionar-multas.jsx#L45-L71), importamos y aplicamos la función [updateMultaRequest](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Front/src/api/multas.js#L16).
  * Ahora, las solicitudes de aprobación y rechazo viajan con Axios a través de [client.js](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Front/src/api/client.js), enviando la cookie de sesión de manera automática y segura.

---

### 3. 💰 Cálculo Dinámico de Recompensa para Villanos Deudores
* **Objetivo:** Si un metahumano con deudas decide llevar un estilo de vida de **Villano**, su recompensa por captura (bounty) debe calcularse automáticamente en base a sus multas y no poder definirla él mismo.
* **Solución Técnica:**
  * En la función [definirEstiloVida](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Backend/src/metahumano/metahumano.controller.ts#L290) en [metahumano.controller.ts](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Backend/src/metahumano/metahumano.controller.ts), añadimos una consulta que filtra todas las multas del metahumano que están en estado diferente a `'PAGADA'`.
  * Si el usuario tiene **al menos una multa impaga** o **2 o más multas vencidas** (`fechaVencimiento < fechaActual` y estado no pagada), se ignora el monto de recompensa enviado por el cliente.
  * La recompensa del villano se establece automáticamente como la sumatoria acumulada de todas sus multas pendientes.

---

### 4. ⚔️ Aceptación Obligatoria de Archienemigos por parte de los Villanos
* **Objetivo:** Permitir que los Héroes propongan archienemigos a los Villanos, pero haciendo obligatorio que el Villano acepte la rivalidad antes de registrarse como aprobada.
* **Solución Técnica:**
  * **Base de Datos:** Se agregó la propiedad `targetVillanoId` en la entidad [Carpeta](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Backend/src/carpeta/carpeta.entity.ts#L19-L20) para registrar la referencia al villano objetivo de la solicitud.
  * **Flujo del Héroe:** Cuando un Héroe ejecuta la solicitud de enemigo en [heroe.controller.ts](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Backend/src/heroe/heroe.controller.ts#L35), la carpeta se inicializa con el estado `'PENDIENTE_VILLANO'` en lugar de `'PENDIENTE'`.
  * **Endpoints del Villano:** Agregamos dos nuevos servicios al backend en [villano.controller.ts](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Backend/src/villano/villano.controller.ts) y mapeados en [villano.routes.ts](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Backend/src/villano/villano.routes.ts):
    * `GET /solicitudes-enemigo`: Obtiene todas las solicitudes de enemigo pendientes dirigidas a un villano específico.
    * `POST /solicitudes-enemigo/:carpetaId/responder`: Permite al villano responder `{ respuesta: 'ACEPTAR' | 'RECHAZAR' }`, cambiando el estado de la carpeta a `'APROBADA'` o `'RECHAZADA'` respectivamente.
  * **Frontend del Villano:** Añadimos un nuevo módulo de visualización y respuesta interactiva en [TramitesMetaHumano.jsx](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Front/src/pages/meta/TramitesMetaHumano.jsx#L851) que carga las solicitudes entrantes en tiempo real y ofrece botones de acción directa para Aceptar/Rechazar.

---

### 5. 🗺️ Integración de Mapa de Argentina (IGN) para Bases e Incidentes de Destrucción
* **Objetivo:** Permitir a los metahumanos fijar geográficamente sus bases de operaciones e incidentes de destrucción masiva colateral, mostrándolos en tiempo real en un mapa nacional interactivo.
* **Solución Técnica:**
  * **Base de Datos:** Añadimos las propiedades de precisión decimal `latitud` y `longitud` a las entidades [Metahumano](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Backend/src/metahumano/metahumano.entity.ts#L32-L37) y [Carpeta](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Backend/src/carpeta/carpeta.entity.ts#L21-L26) para registrar coordenadas geográficas.
  * **Backend (Controladores):**
    * Se actualizó `sanitizeMetahumanoInput` y `crearPerfilMetahumano` en [metahumano.controller.ts](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Backend/src/metahumano/metahumano.controller.ts#L15) para capturar y persistir coordenadas.
    * Se actualizó `solicitarPermisoDestruccion` en [villano.controller.ts](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Backend/src/villano/villano.controller.ts#L160) para asociar coordenadas de siniestro a los trámites.
  * **Frontend (Mi Perfil):** Añadimos en [PerfilMeta.jsx](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Front/src/pages/meta/PerfilMeta.jsx#L10) un mapa interactivo de Argentina consumiendo la capa base oficial de **OpenStreetMap** vía Leaflet. Los metahumanos pueden hacer clic en el mapa para marcar su base de operaciones y guardar su latitud/longitud.
  * **Frontend (Trámites e Incidencias):**
    * En el formulario de *Permiso de Destrucción* de [TramitesMetaHumano.jsx](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Front/src/pages/meta/TramitesMetaHumano.jsx#L1226) se añadió un mapa táctico interactivo que permite registrar la ubicación del siniestro proyectado.
    * En el panel principal se implementó un **Mapa General de Eventos** que despliega visualmente los metahumanos activos (🦸‍♂️ Héroes / 🦹 Villanos) y las zonas críticas de daño colateral (💥), con popups informativos de estado y motivo.

---

### 6. 📍 Acceso Rápido a Ubicación desde el Inicio del Portal Metahumano
* **Objetivo:** Facilitar la configuración rápida de la ubicación base directamente desde el dashboard inicial del portal metahumano, sin necesidad de navegar al perfil.
* **Solución Técnica:**
  * **Frontend (Inicio):** En [homeMeta.jsx](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Front/src/pages/meta/homeMeta.jsx#L88), añadimos un botón tipo tarjeta de color naranja/rojo llamativo con el texto *"📍 Establecer mi ubicación"*.
  * **Mapa Modal:** Al hacer clic, abre un modal superpuesto con el mapa de la República Argentina (OpenStreetMap layer). Permite al usuario marcar con precisión su ubicación metahumana (actualizando latitud y longitud) y guardar directamente los datos a través del servicio de actualización del backend.
  * **Reinicio de Base de Datos:** Se realizó un vaciado del esquema de la base de datos (Drop Schema) y un re-sembrado (Seed) para asegurar que todos los datos de prueba cuenten con la nueva estructura de columnas listas para su inicialización y geolocalización.

---

### 7. 🏗️ Arquitectura de Mapa y Carga Dinámica GeoJSON
* **Objetivo:** Cumplir con los estándares de diseño y consumo geográfico para la UTN, integrando visualizaciones de temas y capas vectoriales GeoJSON.
* **Solución Técnica:**
  * **Inicialización:** El mapa principal en [TramitesMetaHumano.jsx](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Front/src/pages/meta/TramitesMetaHumano.jsx#L127) arranca centrado en Rosario (latitud `-32.9468`, longitud `-60.6393`) con zoom inicial de `15`.
  * **Control de Temas:** Añadimos un botón flotante estilizado en la esquina superior derecha del mapa. Permite alternar dinámicamente entre *Modo Claro* (capa base oficial de **OpenStreetMap**) y *Modo Oscuro* (capa base **CartoDB Dark Matter**), actualizando su interfaz en caliente.
  * **Carga de GeoJSON (Puntos de Prueba):** Se renderiza una colección GeoJSON con 3 puntos locales en el centro de la ciudad ("UTN FRRo", "TEKNE 3D" y "Punto de Entrega").
  * **Estilos Dinámicos (L.circleMarker):** Los marcadores se dibujan como círculos con radio de `9px`, borde negro e interactividad. Su color de relleno se asigna mediante un switch leyendo el atributo `clase`: Comercial = Verde, Residencial = Rojo, Educacion = Azul.
  * **Documentación de Reemplazo:** Agregamos comentarios detallados en español en el código del mapa indicando exactamente cómo y dónde sustituir la colección estática de GeoJSON por una consulta dinámica con `fetch('mis_datos.geojson')` para cargarlos de una API en el futuro.

---

### 8. 🗺️ Consolidación de Mapas en una Página a Pantalla Completa
* **Objetivo:** Simplificar las páginas existentes removiendo los mapas empotrados y exportándolos a una vista única e inmersiva a pantalla completa en [vigilarMundoMeta.jsx](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Front/src/pages/meta/vigilarMundoMeta.jsx).
* **Solución Técnica:**
  * **Página de Visualización Global:** Creamos la nueva pantalla **[vigilarMundoMeta.jsx](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Front/src/pages/meta/vigilarMundoMeta.jsx)** que renderiza un mapa interactivo de OpenStreetMap que ocupa el 100% del área de visualización disponible de la pantalla.
  * **Consolidación de Datos:** En este mapa full-screen se integraron todos los datos previamente distribuidos: bases de operaciones de metahumanos (🦸‍♂️/🦹), zonas de destrucción activa (💥) y los 3 puntos de prueba del GeoJSON con estilos dinámicos.
  * **Remoción de Mapas Ad-hoc:** Se removieron por completo las dependencias, contenedores y scripts de Leaflet en las páginas:
    * **[PerfilMeta.jsx](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Front/src/pages/meta/PerfilMeta.jsx)**: Volvió a su formato original limpio de perfil de usuario sin el mapa de base de operaciones.
    * **[homeMeta.jsx](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Front/src/pages/meta/homeMeta.jsx)**: Se eliminó el modal de mapa y se reconfiguró la tarjeta de geolocalización para que navegue directamente al visor global (`/metahumano/vigilar-mundo`).
    * **[TramitesMetaHumano.jsx](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Front/src/pages/meta/TramitesMetaHumano.jsx)**: Se eliminaron el mapa general del final de la página y el mapa de coordenadas del formulario de solicitud de destrucción.
  * **Robustez en Inicialización (React useRef):** Se implementó una referencia mutable (`useRef`) para controlar la instancia del mapa Leaflet en [vigilarMundoMeta.jsx](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Front/src/pages/meta/vigilarMundoMeta.jsx), previniendo el error runtime *"Map container is already initialized"* al cambiar de tema u actualizar datos en React.
  * **Soporte de Navegación en el Sidebar:** Se alineó el botón de *"Vigilar el Mundo"* en el sidebar de metahumanos **[SidebarMetaHum.jsx](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Front/src/components/shared/SidebarMetaHum.jsx#L105)** aplicando las clases del sistema de diseño para asegurar transiciones y efectos hover perfectos.

---

### 9. 📍 Geolocalización para Burócratas y Registro de Evidencias
* **Objetivo:** Permitir que los burócratas tengan una ubicación física registrada y asociar geolocalización a las evidencias recolectadas para los metahumanos.
* **Solución Técnica:**
  * **Base de Datos (Burocrata y Evidencia):** Añadimos las propiedades decimales de precisión `latitud` y `longitud` (tipo `double`) a las entidades **[Burocrata.entity.ts](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Backend/src/Burocratas/Burocrata.entity.ts#L17)** y **[evidencia.entity.ts](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Backend/src/evidencia/evidencia.entity.ts#L17)**.
  * **Sanitizadores y Controladores (Backend):**
    * Actualizamos `sanitizeBurocrataInput` y `crearPerfilBurocrata` en **[Burocrata.controller.ts](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Backend/src/Burocratas/Burocrata.controller.ts#L9)** para recibir y guardar las coordenadas geográficas de las oficinas burócratas.
    * Actualizamos `sanitizeEvidenciaInput` en **[evidencia.controller.ts](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Backend/src/evidencia/evidencia.controller.ts#L7)** para recibir, validar y guardar la geolocalización de las evidencias.
    * **Consultas Agrupadas (Evidencias de Metahumanos):** Modificamos la función `findAll` en el controlador de evidencias para poblar jerárquicamente la relación `carpeta.metahumano` (`populate: ['carpeta.metahumano', 'multas']`), permitiendo consultar todas las evidencias registradas en el sistema vinculadas a sus respectivos perfiles metahumanos.
  * **Portal Burócrata (Frontend):**
    * **[HomeBurocrata.jsx](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Front/src/pages/burocrata/HomeBurocrata.jsx#L7)**: Añadimos un botón tipo tarjeta de geolocalización *"📍 Establecer mi ubicación"*. Al hacer clic, abre un modal Leaflet con el mapa interactivo de OpenStreetMap para marcar, confirmar y guardar las coordenadas físicas de la oficina del burócrata.
    * **[CarpetaDetalle.jsx](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Front/src/pages/burocrata/CarpetaDetalle.jsx#L93)**:
      * Dentro del formulario *"Nueva Evidencia"* se integró un mapa de selección rápida que permite fijar las coordenadas de la recolección física del indicio.
      * En el listado de evidencias se muestra un tag visual descriptivo con las coordenadas del siniestro (`📍 Ubicación de la Evidencia: Lat, Lng`) para cada registro.

---

### 10. 🐛 Corrección de Pantalla en Blanco en Detalle de Carpeta
* **Objetivo:** Solucionar el bloqueo de renderizado (pantalla en blanco) al abrir el detalle de una carpeta desde el portal burócrata.
* **Solución Técnica:**
  * **Solución:** Reubicamos la declaración de `isReadOnly` a la línea 55 (antes del `useEffect` de inicialización del mapa Leaflet). De esta forma, el hook puede leer el estado de solo lectura de forma segura al montarse, evitando el cuelgue de renderizado.

---

### 11. 📋 Habilitación de Consulta y Aprobación de Evidencias en Trámites (Admin)
* **Objetivo:** Permitir al administrador visualizar detalladamente las evidencias y multas asociadas al resolver/aprobar los trámites y corregir un conflicto en las rutas del backend.
* **Solución Técnica:**
  * **Visualización en el Panel de Administración (Frontend):** 
    * Modificamos la interfaz **[AprobarTramites.jsx](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Front/src/pages/admin/tramites/AprobarTramites.jsx#L208)** para renderizar la lista completa de evidencias y multas adjuntas a cada carpeta que requiere resolución.
    * Cada evidencia muestra ahora su descripción, fecha de recolección formateada, coordenadas geográficas (`📍 Lat, Lng`), imagen adjunta (con previsualización en miniatura que abre a tamaño completo) y las multas asociadas con su respectivo monto.
  * **Corrección de Conflicto de Rutas (Backend):**
    * **Solución:** Reordenamos las rutas específicas colocándolas al inicio del router y añadimos el alias `/metahumano/:idMetahumano` para que coincida exactamente con la llamada de red de la aplicación frontend.

---

### 12. 💳 Corrección y Tolerancia en Aprobación de Multas y Sincronización de Recompensa (Admin)
* **Objetivo:** Resolver el problema por el cual el administrador no podía aprobar multas debido a diferencias de mayúsculas/minúsculas en el estado de la base de datos o por bloqueos de CORS originados por variaciones de puerto en el frontend, y mantener la recompensa del villano sincronizada.
* **Solución Técnica:**
  * **Tolerancia Case-Insensitive (Frontend):**
    * Actualizamos **[gestionar-multas.jsx](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Front/src/pages/admin/tramites/gestionar-multas.jsx)** para realizar comprobaciones de estado insensibles a mayúsculas y minúsculas (usando `.toUpperCase()`) en filtros, contadores y renderizado condicional de botones. Esto soluciona bloqueos de renderizado si la base de datos almacena el estado en formato mixto o minúscula.
  * **Parche de Puertos en CORS (Backend):**
    * En **[app.ts](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Backend/src/app.ts#L33)**, reemplazamos el array estático de orígenes de CORS por una función de coincidencia por expresiones regulares (`/^http:\/\/localhost:\d+$/`). Esto permite que el frontend acceda a la API sin importar en qué puerto local se levante (ej. 5173, 5174, etc.), evitando rechazos en peticiones de escritura (`PUT` para aprobación de multas).
  * **Sincronización de Recompensa del Villano (Backend):**
    * Modificamos **[Multa.controller.ts](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Backend/src/Multas/Multa.controller.ts#L83)** para que la recompensa (bounty) de los metahumanos de tipo `villano` se recalcule automáticamente cuando una multa es aprobada/rechazada (`update`), eliminada (`remove`) o abonada (`pagarMulta`). Así, el total de recompensa siempre refleja el acumulado exacto de sus multas vigentes aprobadas y no pagadas.

---

### 13. ⚡ Aprobaciones y Resoluciones Instantáneas (Frontend)
* **Objetivo:** Optimizar la experiencia de usuario del administrador al aprobar trámites o multas, eliminando los diálogos de éxito bloqueantes (`alert()`) y logrando actualizaciones de pantalla inmediatas.
* **Solución Técnica:**
  * **Actualización de Estado Optimista:**
    * Modificamos **[AprobarTramites.jsx](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Front/src/pages/admin/tramites/AprobarTramites.jsx#L35)** (`handleResolverTramite`) para que, una vez que la promesa del backend se resuelve, actualice inmediatamente el estado de React local (`setCarpetas`), reflejando instantáneamente el cambio de estado en la UI sin esperar confirmaciones bloqueantes.
    * Realizamos el mismo cambio en **[gestionar-multas.jsx](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Front/src/pages/admin/tramites/gestionar-multas.jsx#L45)** para los manejadores `handleAprobarMulta` y `handleRechazarMulta`, logrando que las multas aprobadas/rechazadas actualicen sus tags y acciones instantáneamente en el dashboard de administración.
  * **Eliminación de Alerts de Éxito:** Reemplazamos los bloqueos por `alert` de éxito por flujos asíncronos limpios, agilizando el flujo de trabajo continuo del administrador. En caso de fallar, se captura el error y se ejecuta una recarga de seguridad (`cargarCarpetas`/`cargarMultas`).

---

## 📅 Cambios Implementados - 6 de Julio de 2026

### 1. ⚙️ Solución de Error de Parseo de Source Maps de DevTools (React DevTools)
* **Objetivo:** Evitar que los navegadores (como Firefox o Chrome) emiten un error de análisis de JSON (`JSON.parse: unexpected character...`) en la consola al intentar cargar mapas de origen de herramientas de desarrollo (`installHook.js.map`).
* **Solución Técnica:**
  * En **[vite.config.js](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Front/vite.config.js#L10)**, agregamos un middleware de desarrollo que intercepta las solicitudes de `installHook.js.map` y responde con un código de estado `404 Not Found` en lugar de permitir que caigan en la redirección por defecto de Vite SPA (que devolvía `index.html` con código de estado `200 OK`).

---

### 2. 🔄 Botón de Actualización Manual en el Visor del Mundo
* **Objetivo:** Proveer una forma directa y atractiva para que los metahumanos refresquen los datos del mapa táctico (bases, evidencias, burócratas) en tiempo real.
* **Solución Técnica:**
  * **Corrección de Error de Referencia:** En **[vigilarMundoMeta.jsx](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Front/src/pages/meta/vigilarMundoMeta.jsx#L11)**, añadimos el hook de estado `const [burocratasList, setBurocratasList] = useState([]);` que faltaba por declarar, resolviendo el error fatal `ReferenceError` que ocurría al cargar la pantalla.
  * **Interfaz de Recarga:** Diseñamos un botón flotante de recarga (`🔄 Actualizar`) en la esquina superior derecha del mapa. Se introdujo un estado `loading` para deshabilitar el botón durante la recarga, mitigar peticiones cruzadas concurrentes y animar de manera fluida el icono (`animate-spin`).

---

### 3. 💼 Geolocalización y Habilitación de Burócratas en el Mapa de Vigilancia
* **Objetivo:** Mostrar la presencia y ubicación física de las oficinas de los burócratas oficiales en el mapa táctico de los metahumanos.
* **Solución Técnica:**
  * **Acceso y Roles (Backend):** En **[Burocrata.routes.ts](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Backend/src/Burocratas/Burocrata.routes.ts#L7)**, permitimos a los usuarios con rol `METAHUMANO` consultar la lista de burócratas (`GET /` y `GET /:id`), resolviendo un bloqueo de tipo `403 Forbidden`.
  * **Coordenadas de Prueba (Seeder):** Modificamos **[seeder.ts](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Backend/src/shared/db/seeder.ts#L75)** para inyectar coordenadas de geolocalización realistas a los burócratas de prueba y diseñamos una lógica de migración automática que actualiza la base de datos existente en caliente al reiniciar el servidor backend.

---

### 4. 🧬 Exposición y Visualización de Estilo de Vida (Héroe / Villano / Neutral)
* **Objetivo:** Diferenciar visualmente a los metahumanos en el mapa basándose en su alineación moral y estado de vida, evitando que se visualicen erróneamente todos como villanos.
* **Solución Técnica:**
  * **Serialización de Propiedad Virtual (Backend):** En **[metahumano.entity.ts](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Backend/src/metahumano/metahumano.entity.ts#L62)**, decoramos el getter `tipoMeta` con la propiedad `@Property({ persist: false })`. Esto permite a Mikro-ORM incluir automáticamente el resultado del getter (la clase de constructor de subclase en minúsculas) en las respuestas JSON del backend.
  * **Visualización Dinámica (Frontend):** En **[vigilarMundoMeta.jsx](file:///C:/Users/Facuq/OneDrive/Desktop/DSW/Front/src/pages/meta/vigilarMundoMeta.jsx#L134)**, refinamos la estructuración del pop-up del marcador metahumano para pintar con precisión tres estados y colores: Héroe (Azul, `🦸‍♂️ HÉROE`), Villano (Rojo, `🦹 VILLANO`) y Sin Definir (Verde, `👤 SIN DEFINIR`).
