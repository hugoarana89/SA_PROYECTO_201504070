# Alamacenamiento utilizado

## Justificación Técnica: Almacenamiento en Base64

El uso de Base64 consiste en convertir un archivo binario (la imagen) en una cadena de texto ASCII. Esta cadena se guarda en un campo de tipo `TEXT` o `BLOB` en la base de datos. Las razones principales para elegir este método son:

### 1. Portabilidad y Autocontención del Dato

Al guardar la imagen en Base64, el registro de la base de datos es **atómico**. Esto significa que toda la información necesaria está en un solo lugar.

* **Facilidad de Migración:** No tienes que preocuparte por mover carpetas de archivos o configurar permisos en un servidor de almacenamiento externo al migrar la base de datos.
* **Integridad Referencial:** Evitas el problema de los "enlaces rotos". En un sistema de archivos, si alguien borra la imagen manualmente, la base de datos queda apuntando a la nada. Aquí, si el registro existe, la imagen existe.

### 2. Reducción de Latencia en Peticiones HTTP

Normalmente, una web carga el HTML y luego hace peticiones `GET` adicionales por cada imagen.

* **Menos Round-trips:** Al enviar la imagen embebida en el JSON de una API, el cliente recibe el texto y la imagen en un solo viaje de datos.
* **Ideal para UI/UX:** Es extremadamente útil para iconos pequeños, avatares de usuario o miniaturas (thumbnails) que deben aparecer instantáneamente junto con el texto.

### 3. Seguridad y Control de Acceso

Si las imágenes son sensibles (por ejemplo, documentos de identidad o recibos médicos), almacenarlas en el sistema de archivos de un servidor web puede ser riesgoso si no se configuran bien los permisos.

* **Protección por Capas:** La imagen hereda automáticamente los niveles de seguridad, roles y encriptación de la base de datos.
* **Sin Acceso Público:** No hay una URL pública directa que alguien pueda adivinar para ver la imagen.

### 4. Simplicidad en el Desarrollo (MVP)

Para proyectos pequeños o prototipos, configurar un bucket de S3 (AWS) o un servidor de archivos añade complejidad innecesaria.

* **Backup Unificado:** Cuando haces un backup de la base de datos, estás respaldando automáticamente todos los recursos multimedia sin procesos adicionales.

---

### Comparativa Rápida

| Característica | Base64 en DB | Enlace a Sistema de Archivos |
| --- | --- | --- |
| **Portabilidad** | Alta (Todo en un archivo SQL) | Baja (Depende de rutas externas) |
| **Rendimiento** | Menor en archivos grandes | Mayor (Carga asíncrona) |
| **Seguridad** | Alta (Integrada en la DB) | Media (Requiere gestión de permisos) |
| **Backup** | Simple (Un solo paso) | Complejo (Sincronizar DB + Archivos) |

> **Nota Importante:** Recuerda que el Base64 aumenta el tamaño del archivo aproximadamente un **33%** respecto al binario original. Se recomienda su uso principalmente para archivos pequeños (menores a 500 KB) para no penalizar el rendimiento de la base de datos.

---

# Flujo de reembolso
Esta documentación técnica describe el proceso de reembolso de un pedido en una arquitectura de microservicios para un restaurante. El objetivo es garantizar la consistencia de los datos entre los servicios de Pedidos, Pagos, Inventario y Notificaciones.

---

## 1. Arquitectura del Flujo (Saga Pattern)

Dado que cada microservicio tiene su propia base de datos, utilizamos el patrón **Saga Basado en Coreografía** para gestionar la transacción distribuida. Esto asegura que si un paso falla, se puedan ejecutar acciones compensatorias.

### Microservicios Involucrados:

1. **API Gateway:** Punto de entrada para la solicitud del cliente o administrador.
2. **Order Service (Servicio de Pedidos):** Gestiona el estado del pedido (`REFUND_PENDING`, `REFUNDED`).
3. **Payment Service (Servicio de Pagos):** Se comunica con la pasarela de pagos (Stripe, PayPal, etc.).
4. **Inventory Service (Servicio de Inventario):** Reintegra los insumos o productos al stock si aplica.
5. **Notification Service (Servicio de Notificaciones):** Informa al cliente sobre el estado de su dinero.

---

## 2. Diagrama de Secuencia Técnica

El flujo estándar sigue la lógica de "mensajería asíncrona" a través de un Broker (como RabbitMQ o Kafka):

1. **Solicitud:** El usuario solicita el reembolso. El **Order Service** valida que el pedido sea elegible y cambia su estado a `REFUND_INITIATED`.
2. **Evento de Pago:** Se emite un evento `OrderRefundRequested`. El **Payment Service** lo escucha y procesa la devolución con el proveedor externo.
3. **Actualización de Stock:** Si el pago es exitoso, el **Inventory Service** escucha el evento `PaymentRefunded` y actualiza las existencias.
4. **Finalización:** El **Order Service** marca el pedido como `COMPLETED_REFUND`.
5. **Notificación:** El **Notification Service** envía un correo/push al usuario.

---

## 3. Especificación de la API (Endpoint)

### Iniciar Reembolso

`POST /api/v1/orders/{orderId}/refund`

**Cuerpo de la petición (JSON):**

```json
{
  "reason": "PRODUCT_UNAVAILABLE",
  "details": "El cliente no recibió el postre solicitado",
  "amount": 15.50,
  "refund_method": "ORIGINAL_PAYMENT"
}

```

**Respuestas:**

* **202 Accepted:** La solicitud ha sido recibida y está en proceso de procesamiento asíncrono.
* **400 Bad Request:** El pedido no cumple con las reglas de negocio para reembolso (ej. ya pasaron 48 horas).
* **404 Not Found:** El ID del pedido no existe.

---

## 4. Gestión de Errores y Transacciones Compensatorias

En un sistema distribuido, las cosas pueden fallar. Si el **Payment Service** no puede procesar la devolución, debe emitirse un evento de fallo:

* **Evento:** `RefundFailed`
* **Acción Compensatoria:** El **Order Service** debe revertir el estado del pedido de `REFUND_PENDING` a `PAYMENT_CONFIRMED` y registrar un log de error para intervención manual de soporte técnico.

---

## 5. Consideraciones de Seguridad

* **Idempotencia:** Cada solicitud de reembolso debe incluir un `idempotency-key` para evitar que un reintento de red procese dos veces el mismo reembolso.
* **Autorización:** Solo usuarios con el rol `ADMIN` o `MANAGER` pueden aprobar reembolsos superiores a un umbral definido.

----

# Documentación técnica y guía de implementación de FX service

Esta documentación técnica describe el **FX-Service**, un microservicio diseñado para proporcionar tipos de cambio de divisas en tiempo real, optimizando el rendimiento y la disponibilidad mediante una estrategia de caché con **Redis**.

---

## 1. Arquitectura del Servicio

El servicio actúa como un intermediario (Proxy/Adapter) entre los microservicios internos del restaurante (ej. Menú, Pagos) y un proveedor externo de divisas (como Fixer.io o ExchangeRate-API).

### Componentes Clave:

* **External API Client:** Módulo encargado de la comunicación con el proveedor de tasas de cambio.
* **Redis Cache:** Almacena temporalmente las tasas de cambio para evitar llamadas excesivas a la API externa y reducir la latencia.
* **Fallback Strategy:** Lógica que permite servir datos desde el caché si la API externa no está disponible o ha superado el límite de peticiones.

---

## 2. Flujo de Datos (Lógica de Negocio)

El servicio sigue el patrón **Cache-Aside** para garantizar que siempre haya una respuesta rápida.

1. **Consulta:** El cliente solicita el cambio de `USD` a `MXN`.
2. **Hit de Caché:** El servicio busca la llave `fx:USD_MXN` en Redis. Si existe, la retorna en milisegundos.
3. **Miss de Caché / Fallback:** Si no está en Redis:
* Consulta la **External API**.
* Si la API responde, actualiza Redis con un **TTL (Time To Live)** de 1 hora.
* Si la API falla, se intenta recuperar el último valor conocido (Stale Data) de Redis para evitar la caída del servicio.

---

## 3. Especificación Técnica de Redis

### Estructura de Llaves

Las llaves se almacenan con un prefijo de espacio de nombres para evitar colisiones:

* **Formato:** `fx_rate:{base_currency}:{target_currency}`
* **Ejemplo:** `fx_rate:USD:EUR`

### Configuración de Expiración

* **TTL Estándar:** 3600 segundos (1 hora).
* **Estrategia de Evicción:** `allkeys-lru` (para mantener en memoria las tasas más consultadas).

---

## 4. Endpoints de la API

### Obtener Conversión

`GET /api/v1/convert`

**Parámetros de consulta:**

* `from`: Moneda base (ej. USD)
* `to`: Moneda destino (ej. MXN)
* `amount`: Cantidad a convertir.

**Respuesta de ejemplo (JSON):**

```json
{
  "status": "success",
  "data": {
    "from": "USD",
    "to": "MXN",
    "rate": 20.45,
    "converted_amount": 204.50,
    "source": "cache",
    "last_updated": "2026-03-07T14:30:00Z"
  }
}

```

---

## 5. Implementación del Fallback (Resiliencia)

Para evitar que una falla en el proveedor externo detenga las ventas del restaurante, se implementa un **Circuit Breaker**:

1. **Estado Cerrado:** Todo funciona normal, se consulta la API y se refresca el caché.
2. **Estado Abierto:** Si la API falla 5 veces consecutivas, el servicio deja de intentar llamar a la API y sirve **exclusivamente** del caché de Redis (aunque el TTL haya expirado, usando una copia persistente si es posible).
3. **Estado Medio-Abierto:** Después de un tiempo de espera, se intenta una sola petición a la API para verificar si el proveedor se ha recuperado.

---

## 6. Configuración de Variables de Entorno

```bash
FX_API_KEY=tu_api_key_aqui
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
CACHE_TTL_SECONDS=3600
CIRCUIT_BREAKER_THRESHOLD=5

```
---