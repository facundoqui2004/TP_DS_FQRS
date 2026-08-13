# 💳 Guía de Configuración e Integración de Mercado Pago

Documentación completa de la configuración, integración y resolución de errores de la pasarela de pagos con **Mercado Pago** para la gestión de multas del proyecto **Super Gestor**.

---

## 📌 1. Configuración de la Cuenta del Administrador

Para que **el 100% de los fondos abonados por las multas sean acreditados directamente en la cuenta de Mercado Pago del Administrador**, la aplicación utiliza el `MP_ACCESS_TOKEN` del Administrador en todas las peticiones de cobro.

### Pasos de Configuración:
1. Iniciar sesión en el [Panel de Desarrolladores de Mercado Pago](https://www.mercadopago.com.ar/developers/panel/app) con la cuenta del Administrador.
2. Seleccionar la aplicación o crear una nueva.
3. Copiar las credenciales correspondientes:
   - **Access Token de Producción / Prueba** (`APP_USR-...` o `TEST-...`).
   - **Public Key**.
4. Configurar las variables de entorno en el archivo `Backend/.env`:

```env
PORT=3000

# 💳 Credenciales de Mercado Pago del Administrador
MP_ACCESS_TOKEN=APP_USR-TU_ACCESS_TOKEN_AQUI
MP_PUBLIC_KEY=APP_USR-TU_PUBLIC_KEY_AQUI

# URL del Frontend para redirecciones tras el pago
FRONTEND_URL=http://localhost:5173
```

---

## ⚙️ 2. Flujo de Integración y Endpoints Backend

### Endpoints Relacionados:
- **`POST /api/multas/:id/crear-preferencia-mp`**:
  - Verifica que la multa pertenezca al metahumano autenticado y se encuentre en estado `APROBADA`.
  - Construye la preferencia utilizando la API oficial de Mercado Pago (`https://api.mercadopago.com/checkout/preferences`).
  - Determina automáticamente el tipo de token:
    - **`TEST-`**: Utiliza `sandbox_init_point` (`https://sandbox.mercadopago.com.ar/...`).
    - **`APP_USR-`**: Utiliza `init_point` de producción (`https://www.mercadopago.com.ar/...`).
  - Retorna `checkoutUrl`, `preferenceId`, `monto` y `motivo`.

- **`POST /api/multas/:id/pagar`**:
  - Registra la multa como `PAGADA` con la `formaPago: 'Mercado Pago'`.
  - Si el metahumano es de tipo **Villano**, recalcula automáticamente su recompensa en función del monto total de multas no pagadas.

---

## 🚨 3. Solución al Error `COW00-BFTAFLDF0INV`

### Causa Técnica:
El código de error `COW00-BFTAFLDF0INV` es emitido por Mercado Pago al intentar abrir una preferencia creada con credenciales de prueba (`TEST-`) utilizando la URL de producción (`init_point`).

### Solución Implementada:
En `Backend/src/Multas/Multa.controller.ts`, el backend detecta el prefijo del token:
```typescript
const isTestToken = mpAccessToken.startsWith('TEST-');
const checkoutUrl = isTestToken ? sandboxInitPoint : initPoint;
```
Esto asegura que las pruebas locales en Sandbox abran el entorno de pruebas sin lanzar el error `COW00`.

---

## 🖥️ 4. Opciones de Pago en el Frontend (`carpetasMeta.jsx`)

Cuando un Metahumano presiona **"Pagar Ahora"** en una multa pendiente, se despliega un modal interactivo con dos alternativas:

1. **`💙 Abrir Mercado Pago (Checkout Pro)`**:
   - Genera la preferencia oficial de Mercado Pago y abre la pasarela en una pestaña nueva.
   - Permite abonar con Tarjeta de Crédito, Débito o Dinero en cuenta de Mercado Pago.

2. **`⚡ Confirmar Pago Directo (Sin Redirigir)`**:
   - Permite simular y validar la acreditación inmediata de la multa en entornos locales de desarrollo.

---

## 🧪 5. Tarjetas de Prueba para Mercado Pago Sandbox

Al probar con credenciales `TEST-`, se pueden utilizar las siguientes tarjetas de prueba oficial de Mercado Pago:

| Tipo | Número de Tarjeta | Vencimiento | CVC |
| :--- | :--- | :--- | :--- |
| **Visa Aprobada** | `2370 0000 0000 0000` | `11/28` | `123` |
| **Mastercard Aprobada** | `4509 9500 0000 0000` | `11/28` | `123` |

---

*Documento generado y mantenido automáticamente.*
