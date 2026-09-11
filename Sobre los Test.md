# Tests

## Backend

Las pruebas de backend se ejecutan mediante el *test runner* nativo de Node.js (`node --test`) junto con `supertest`, compilando previamente el código TypeScript.

* **Autenticación y autorización:** Flujo de sesiones con JWT y control de acceso por roles en middlewares (`Admin`, `Burócrata` y `Metahumano`).
* **Lógica de dominio:** Reglas de negocio para la gestión de expedientes, aplicación de multas y asignación de poderes.
* **Infraestructura:** Validación de variables de entorno y conectividad con la base de datos.





## Frontend

Las pruebas de frontend se ejecutan con Vitest y React Testing Library sobre un entorno simulado de DOM (`jsdom`).

* **Formularios e interacción:** Renderizado y validación de entradas en el formulario de inicio de sesión.
* **Control de navegación:** Bloqueo y redirección en rutas protegidas (`ProtectedRoute`) según el estado de autenticación y rol asignado.
* **Flujos de usuario:** Simulación de navegación de extremo a extremo y verificación de respuestas reactivas en la UI.