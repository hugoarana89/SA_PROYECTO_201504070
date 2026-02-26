# Documentación de Requerimientos - Plataforma de Delivery (Microservicios) - Fase 2

## 1. Requerimientos Funcionales (RF)

Los requerimientos funcionales describen las interacciones entre el sistema y sus actores, definiendo las capacidades y servicios que la plataforma debe ofrecer. Esta sección incluye los requerimientos de la Fase 1, actualizados y ampliados con las nuevas funcionalidades de la Fase 2.

### Módulo: Autenticación y Usuarios (Auth-Service)

*   **RF-01: Registro de Usuario**
    El sistema debe permitir que un nuevo usuario (Cliente, Restaurante, Repartidor) se registre proporcionando un email, una contraseña y seleccionando un rol. El sistema debe validar que el email no esté registrado previamente y almacenar la contraseña de forma encriptada.
*   **RF-02: Inicio de Sesión (Login)**
    El sistema debe permitir que un usuario registrado inicie sesión proporcionando su email y contraseña. El sistema verificará las credenciales y, si son correctas, generará un token de acceso.
*   **RF-03: Generación y Validación de JWT**
    El sistema debe generar un JSON Web Token (JWT) tras un inicio de sesión exitoso, que contenga la información del usuario (ID, email, rol). Este servicio también debe ser capaz de validar cualquier JWT presentado a otros servicios para garantizar la autenticidad de la petición.

### Módulo: Catálogo de Restaurantes (Restaurant-Catalog-Service)

*   **RF-04: Gestión de Restaurantes (CRUD)**
    El sistema debe permitir a un usuario con rol de **ADMINISTRADOR** crear, leer, actualizar y eliminar restaurantes en la plataforma (nombre, dirección, horarios, contacto).
*   **RF-05: Gestión de Menús (CRUD)**
    El sistema debe permitir a un usuario con rol de **RESTAURANTE** crear, leer, actualizar y eliminar los ítems del menú de su propio restaurante (nombre del platillo, descripción, precio, disponibilidad).
*   **RF-06: Consultar Catálogo de Restaurantes**
    El sistema debe permitir a un usuario con rol de **CLIENTE** visualizar un listado de todos los restaurantes disponibles en la plataforma.
*   **RF-07: Consultar Menú de un Restaurante**
    El sistema debe permitir a un usuario con rol de **CLIENTE** visualizar el menú completo de un restaurante específico, mostrando los ítems activos con sus precios y descripciones.

### Módulo: Gestión de Pedidos (Order-Service)

*   **RF-08: Realizar un Pedido**
    El sistema debe permitir a un usuario con rol de **CLIENTE** crear una nueva orden a partir de los productos seleccionados de un restaurante. La orden se creará inicialmente con estado "CREADA".
*   **RF-09: Cancelar un Pedido (Cliente)**
    El sistema debe permitir a un usuario con rol de **CLIENTE** cancelar una orden propia que aún no haya sido aceptada por el restaurante, cambiando su estado a "CANCELADA".
*   **RF-10: Procesar Pedido (Restaurante) - (Actualizado Fase 2)**
    El sistema debe permitir a un usuario con rol de **RESTAURANTE** visualizar las nuevas órdenes provenientes de una cola de mensajería (no de una llamada síncrona). El restaurante podrá aceptarlas (cambiando el estado a "EN PROCESO") y marcarlas como "LISTAS" para su entrega una vez finalizada su preparación.
*   **RF-11: Rechazar un Pedido (Restaurante)**
    El sistema debe permitir a un usuario con rol de **RESTAURANTE** rechazar una orden entrante (por falta de stock o personal), cambiando su estado a "RECHAZADA". Esta acción deberá comunicarse de vuelta al sistema de pedidos.

### Módulo: Gestión de Pagos y Finanzas (Nuevo - Fase 2)

*   **RF-12: Procesar Pago (Simulado)**
    El sistema debe permitir a un usuario con rol de **CLIENTE** pagar por un pedido utilizando una tarjeta de crédito/débito (simulado) o con cargo a una cartera digital recargable.
*   **RF-13: Gestión de Cartera Digital**
    El sistema debe permitir a un usuario con rol de **CLIENTE** recargar su cartera digital con un monto específico y utilizarla como método de pago para sus pedidos.
*   **RF-14: Validar y Aplicar Cupones**
    El sistema debe permitir a un usuario con rol de **CLIENTE** ingresar un código de cupón al momento del pago. El sistema (`Payment-Service`) debe validar el cupón y aplicar el descuento correspondiente al monto total del pedido.
*   **RF-15: Confirmación de Pago**
    El `Payment-Service` debe comunicarse con el `Order-Service` para confirmar el pago exitoso de un pedido, lo que actualizará su estado a "PAGADO" (o un estado equivalente que permita su preparación).

### Módulo: Conversión de Moneda (FX-Service) (Nuevo - Fase 2)

*   **RF-16: Visualización de Precios en Múltiples Monedas**
    El sistema debe permitir a un usuario con rol de **CLIENTE** visualizar los precios de los productos en una moneda de su preferencia (ej. USD, MXN, JPY), además de la moneda base (Quetzales - GTQ).
*   **RF-17: Conversión de Moneda con Caché**
    El sistema debe consumir una API externa de tipos de cambio para obtener las tasas de conversión del día. Para optimizar el rendimiento, debe implementar una caché (Redis) que almacene las tasas por un período definido (ej. 12 horas) y servir los datos desde la caché si la API externa falla.

### Módulo: Sistema de Calificaciones (Nuevo - Fase 2)

*   **RF-18: Calificar Repartidor**
    El sistema debe permitir a un usuario con rol de **CLIENTE** calificar al repartidor (1-5 estrellas) y dejar un comentario opcional una vez que su pedido ha sido entregado.
*   **RF-19: Calificar Restaurante**
    El sistema debe permitir a un usuario con rol de **CLIENTE** calificar al restaurante (1-5 estrellas) y dejar un comentario opcional una vez que su pedido ha sido entregado.
*   **RF-20: Calificar Producto**
    El sistema debe permitir a un usuario con rol de **CLIENTE** calificar un producto específico de su pedido como "Recomendado" o "No recomendado".

### Módulo: Gestión de Entregas (Delivery-Service) - (Actualizado Fase 2)

*   **RF-21: Aceptar un Pedido para Entrega**
    El sistema debe permitir a un usuario con rol de **REPARTIDOR** visualizar los pedidos que están "LISTOS" para entrega y aceptar uno, cambiando el estado del pedido a "EN CAMINO".
*   **RF-22: Actualizar Estado de Entrega con Evidencia Fotográfica (Nuevo)**
    El sistema debe permitir a un usuario con rol de **REPARTIDOR** actualizar el estado de un pedido que ha aceptado a "ENTREGADO". Para completar esta acción, el repartidor **debe obligatoriamente** subir una fotografía que sirva como prueba de entrega.

### Módulo: Notificaciones (Notification-Service)

*   **RF-23: Notificar Creación de Pedido**
    El sistema debe enviar una notificación por correo electrónico al **CLIENTE** cuando este realice un pedido, incluyendo el resumen del mismo.
*   **RF-24: Notificar Cancelación de Pedido (por Cliente)**
    El sistema debe notificar al **CLIENTE** por correo electrónico cuando este cancele exitosamente un pedido.
*   **RF-25: Notificar Pedido en Camino**
    El sistema debe notificar al **CLIENTE** por correo electrónico cuando su pedido sea aceptado por un repartidor y el estado cambie a "EN CAMINO".
*   **RF-26: Notificar Cancelación/Rechazo de Pedido**
    El sistema debe notificar al **CLIENTE** por correo electrónico cuando su pedido sea rechazado por el restaurante o cancelado por el repartidor, incluyendo el motivo de la cancelación.

---

## 2. Requerimientos No Funcionales (RNF) y Atributos de Calidad (Actualizado Fase 2)

*   **RNF-01: Seguridad**
    *   **Autenticación y Autorización:** El acceso a los microservicios debe estar protegido mediante tokens JWT válidos. El API Gateway debe validar el token y verificar los roles (CLIENTE, RESTAURANTE, REPARTIDOR, ADMIN) antes de enrutar la petición.
    *   **Confidencialidad:** Las contraseñas de los usuarios deben ser almacenadas utilizando un algoritmo de hashing seguro (ej. bcrypt). Todas las comunicaciones deben realizarse a través de canales seguros.
*   **RNF-02: Rendimiento y Escalabilidad (Actualizado)**
    *   La arquitectura de microservicios orquestada por Kubernetes debe permitir el escalado horizontal automático (HPA - Horizontal Pod Autoscaler) de cada servicio según la demanda (CPU/memoria).
    *   Las consultas al catálogo de restaurantes y menús deben responder en un tiempo máximo de 500ms.
    *   La implementación de caché en Redis para el `FX-Service` debe reducir la latencia de las conversiones de moneda y minimizar las llamadas a la API externa.
*   **RNF-03: Disponibilidad y Resiliencia (Nuevo - Fase 2)**
    *   El sistema debe garantizar **Zero Downtime** durante las actualizaciones, utilizando estrategias de despliegue como Rolling Updates en Kubernetes.
    *   El sistema debe ser tolerante a fallos. La comunicación asíncrona mediante colas (RabbitMQ/Kafka) entre `Order-Service` y `Restaurant-Catalog-Service` asegura que la caída de un servicio no bloquee al otro. Los mensajes deben persistir en la cola hasta que el consumidor esté disponible.
    *   El `FX-Service` debe implementar un patrón de resiliencia (Caché/Fallback) para seguir funcionando incluso si la API externa de tipos de cambio no está disponible.
*   **RNF-04: Mantenibilidad y Despliegue (Nuevo - Fase 2)**
    *   Todo el código de la infraestructura (manifiestos de Kubernetes) debe estar versionado en el repositorio.
    *   La configuración no sensible debe estar externalizada en `ConfigMaps` y la información sensible en `Secrets` de Kubernetes.
    *   El proceso de despliegue debe ser completamente automatizado mediante un pipeline de CI/CD, reproducible y con capacidad de **Rollback** a una versión anterior en caso de fallo.
*   **RNF-05: Usabilidad**
    *   La plataforma debe ofrecer una interfaz intuitiva que guíe al usuario a través del proceso de registro, exploración de restaurantes, creación de pedidos, pago y calificación.

---

## 3. Casos de Uso (Actualizado Fase 2)

A continuación, se describen los casos de uso principales para los actores identificados.

### Actor: Cliente

*   **Caso de Uso: CU-01 - Registrarse en la Plataforma**
    *   **Actores:** Cliente (potencial)
    *   **Descripción:** El usuario crea una cuenta en el sistema.
    *   **Flujo Principal:**
        1.  El usuario accede a la opción de registro.
        2.  El sistema solicita email, contraseña y rol.
        3.  El usuario ingresa los datos y selecciona "CLIENTE".
        4.  El sistema valida que el email no exista.
        5.  El sistema encripta la contraseña y almacena el nuevo usuario.
        6.  El sistema confirma el registro exitoso.

*   **Caso de Uso: CU-02 - Iniciar Sesión**
    *   **Actores:** Cliente
    *   **Descripción:** El usuario se autentica en la plataforma.
    *   **Flujo Principal:**
        1.  El usuario accede a la opción de inicio de sesión.
        2.  El sistema solicita email y contraseña.
        3.  El usuario ingresa sus credenciales.
        4.  El sistema valida las credenciales.
        5.  El sistema genera un JWT y lo devuelve al usuario.

*   **Caso de Uso: CU-03 - Explorar Restaurantes y Menús**
    *   **Actores:** Cliente (Autenticado)
    *   **Descripción:** El usuario navega por la lista de restaurantes y consulta sus menús.
    *   **Flujo Principal:**
        1.  El usuario solicita ver el listado de restaurantes.
        2.  El sistema muestra los restaurantes disponibles.
        3.  El usuario selecciona un restaurante.
        4.  El sistema muestra el menú completo de ese restaurante, con precios en la moneda preferida del usuario (GTQ, USD, etc.) gracias al `FX-Service`.

*   **Caso de Uso: CU-04 - Realizar un Pedido (Actualizado Fase 2)**
    *   **Actores:** Cliente (Autenticado)
    *   **Descripción:** El usuario selecciona productos, aplica un cupón (opcional), paga y genera un pedido.
    *   **Flujo Principal:**
        1.  El usuario añade productos del menú al carrito.
        2.  El usuario procede al pago. Puede ingresar un código de cupón.
        3.  El `Payment-Service` valida el cupón (si existe) y procesa el pago (simulado) con tarjeta o cartera digital.
        4.  El pago es exitoso. El `Payment-Service` confirma el pago al `Order-Service`.
        5.  El `Order-Service` crea el pedido con estado "PAGADO" y publica el evento "Nuevo Pedido" en una cola de mensajes (RabbitMQ/Kafka).
        6.  El `Notification-Service` envía un email de confirmación al cliente.

*   **Caso de Uso: CU-05 - Cancelar un Pedido**
    *   **Actores:** Cliente (Autenticado)
    *   **Descripción:** El usuario cancela un pedido que aún no ha sido aceptado por el restaurante.
    *   **Flujo Principal:**
        1.  El usuario consulta sus pedidos activos.
        2.  El sistema muestra los pedidos en estado "PAGADO" (no procesados aún).
        3.  El usuario selecciona "Cancelar".
        4.  El sistema cambia el estado del pedido a "CANCELADA" (y potencialmente gestiona un reembolso).
        5.  El sistema envía un email de cancelación al cliente.

*   **Caso de Uso: CU-06 - Calificar una Orden (Nuevo - Fase 2)**
    *   **Actores:** Cliente (Autenticado)
    *   **Descripción:** Una vez entregado el pedido, el cliente califica su experiencia con el repartidor, el restaurante y los productos.
    *   **Flujo Principal:**
        1.  El usuario accede a un pedido ya entregado.
        2.  El sistema presenta opciones para calificar (1-5 estrellas + comentario) al repartidor y al restaurante.
        3.  El sistema presenta la lista de productos para marcarlos como "Recomendado" o "No recomendado".
        4.  El usuario envía sus calificaciones.
        5.  El sistema almacena la retroalimentación.

### Actor: Restaurante

*   **Caso de Uso: CU-07 - Gestionar Menú**
    *   **Actores:** Restaurante (Autenticado)
    *   **Descripción:** El restaurante actualiza los platillos de su menú.
    *   **Flujo Principal:**
        1.  El restaurante accede a su panel de gestión.
        2.  El sistema muestra los ítems actuales.
        3.  El restaurante añade, modifica o elimina un ítem.
        4.  El sistema guarda los cambios.

*   **Caso de Uso: CU-08 - Procesar Pedido (Actualizado - Fase 2)**
    *   **Actores:** Restaurante (Autenticado)
    *   **Descripción:** El restaurante consulta los pedidos (a través de la cola de mensajes) y los procesa.
    *   **Flujo Principal (Aceptar Pedido):**
        1.  El restaurante accede a su listado de pedidos entrantes (consumidos de la cola).
        2.  El sistema muestra los nuevos pedidos en estado "PAGADO".
        3.  El restaurante selecciona un pedido y lo acepta.
        4.  El sistema cambia el estado del pedido a "EN PROCESO".
    *   **Flujo Alternativo (Rechazar Pedido):**
        1.  El restaurante selecciona un pedido y elige "Rechazar".
        2.  El sistema solicita una razón.
        3.  El restaurante ingresa el motivo.
        4.  El sistema cambia el estado del pedido a "RECHAZADA" y notifica al cliente.

### Actor: Repartidor

*   **Caso de Uso: CU-09 - Entregar un Pedido con Evidencia (Nuevo - Fase 2)**
    *   **Actores:** Repartidor (Autenticado)
    *   **Descripción:** El repartidor toma un pedido, lo entrega y sube una foto como comprobante.
    *   **Flujo Principal:**
        1.  El repartidor consulta los pedidos disponibles (estado "LISTA") y acepta uno. El estado del pedido cambia a "EN CAMINO".
        2.  El repartidor llega al destino y marca el pedido para entregar.
        3.  El sistema le solicita una fotografía como evidencia de la entrega.
        4.  El repartidor toma o sube la foto y confirma la entrega.
        5.  El sistema cambia el estado del pedido a "ENTREGADO".

---

## 4. Requerimientos de Infraestructura y Despliegue (Nuevo - Fase 2)

### 4.1 Orquestación con Kubernetes

El sistema debe desplegarse y gestionarse en un clúster de Kubernetes. Los manifiestos (YAML) deben estar versionados en el repositorio.

*   **K8s-01: Deployments:** Debe existir un Deployment para cada microservicio (Auth, Catalog, Order, Payment, FX, Delivery, Notification, Frontend, API Gateway) que defina la estrategia de actualización (ej. `RollingUpdate`).
*   **K8s-02: Services:** Cada Deployment debe ser expuesto internamente mediante un objeto Service para permitir el descubrimiento de servicios y la comunicación estable entre ellos.
*   **K8s-03: Ingress:** Se debe configurar uno o varios recursos Ingress para exponer el Frontend y el API Gateway al tráfico externo, definiendo las reglas de enrutamiento.
*   **K8s-04: ConfigMaps:** La configuración no sensible (URLs de servicios internos, timeouts, flags de características, URL de API externa de FX) debe gestionarse mediante ConfigMaps e inyectarse en los Pods como variables de entorno.
*   **K8s-05: Secrets:** La información sensible (secretos JWT, credenciales de bases de datos, credenciales de registro de contenedores) debe gestionarse mediante Secrets de Kubernetes.

### 4.2 Integración y Despliegue Continuo (CI/CD)

El pipeline de CI/CD debe automatizar el proceso desde el commit hasta el despliegue en Kubernetes.

*   **CI/CD-01: Build:** El pipeline debe construir imágenes Docker para los servicios modificados, usando una convención de tags clara (ej. `servicio:v1.2.3-<commit-hash>`).
*   **CI/CD-02: Test:** El pipeline debe ejecutar un conjunto de pruebas automáticas (unitarias, de integración) y detener el flujo si alguna falla.
*   **CI/CD-03: Publish:** Las imágenes construidas deben ser publicadas de forma segura en un registro de contenedores (ej. Docker Hub, Google Container Registry) usando credenciales inyectadas como secretos en el sistema de CI/CD.
*   **CI/CD-04: Deploy:** El pipeline debe aplicar los manifiestos de Kubernetes del repositorio (`kubectl apply -f k8s/`) para desplegar la nueva versión en el clúster, dejando evidencia en los logs del proceso.
*   **CI/CD-05: Rollback:** El pipeline (o un proceso asociado) debe soportar una estrategia de **Rollback** para revertir rápidamente a una versión estable en caso de detectar errores en el despliegue.

## 4. Diagramas

### Diagrama entidad relación

<div align="center">
  <img src="Diagramas/modelo-entidad-relación.png" alt="ERD" width="500">
  <p><i>Figura 1: Diagrama entidad relación</i></p>
</div>

### Diagrama de Arquitectura de alto nivel

<div align="center">
  <img src="Diagramas/diagrama-de-arquitectura.jpg" alt="ERD" width="1000">
  <p><i>Figura 2: Diagrama de arquitectura de alto nivel</i></p>
</div>

### Diagrama de despliegue

<div align="center">
  <img src="Diagramas/diagrama-de-despliegue.png" alt="ERD" width="1000">
  <p><i>Figura 3: Diagrama de despliegue</i></p>
</div>

### Diagrama de actividades

<div align="center">
  <img src="Diagramas/diagrama-de-actividades.png" alt="ERD" width="1000">
  <p><i>Figura 4: Diagrama de actividades</i></p>
</div>

---

## 5. Justificación de la Elección de Frameworks

### Elección del Framework para el Frontend: React

Se eligió **React** como framework principal para el desarrollo del frontend debido a su enfoque en la creación de interfaces de usuario dinámicas, escalables y reutilizables, características fundamentales para una plataforma orientada a pequeños comercios y emprendedores que busca crecer y evolucionar en el tiempo.

React permite construir aplicaciones basadas en componentes, lo que facilita la reutilización de código y el mantenimiento del sistema conforme se agregan nuevas funcionalidades, como módulos adicionales para pedidos, inventarios o entregas. Esta arquitectura es especialmente adecuada para una plataforma modular, donde la interfaz puede ampliarse sin necesidad de rehacer completamente el frontend existente.

Además, React ofrece un excelente rendimiento gracias a su uso del **Virtual DOM**, lo que optimiza la actualización de la interfaz ante cambios frecuentes en los datos, como estados de pedidos, autenticación de usuarios o validación de sesiones. Esto mejora la experiencia del usuario final y reduce errores visuales o inconsistencias.

Otro factor clave es su amplia comunidad y ecosistema, que proporciona librerías maduras para el manejo de autenticación con JWT, consumo de APIs REST, manejo de estados y enrutamiento. Esto permite integrar de forma eficiente el frontend con el **API Gateway**, manteniendo una comunicación clara y segura entre cliente y servidor.

Finalmente, React es una tecnología ampliamente utilizada en la industria, lo que garantiza soporte a largo plazo, buenas prácticas documentadas y facilidad para que nuevos desarrolladores puedan integrarse al proyecto.

---

### Elección del Framework para el Backend: NestJS

Para el backend se utilizó **NestJS**, un framework basado en Node.js que adopta una arquitectura modular y orientada a microservicios, alineándose directamente con los requerimientos del proyecto y su enfoque distribuido.

NestJS fue seleccionado para implementar el **API Gateway**, el cual expone endpoints REST al frontend, valida tokens JWT, gestiona autorización básica por roles y enruta las solicitudes hacia otros microservicios mediante **gRPC**. Su estructura basada en módulos, controladores y servicios permite separar responsabilidades de forma clara, facilitando el mantenimiento y la escalabilidad del sistema.

Una de las principales ventajas de NestJS es su **soporte nativo para microservicios y gRPC**, lo que lo convierte en una opción ideal para la comunicación eficiente entre el API Gateway y el **Auth-Service**. El uso de gRPC mejora el rendimiento y reduce la latencia en la comunicación interna, aspecto crítico en arquitecturas distribuidas.

NestJS también integra de manera sencilla mecanismos de **seguridad**, como la validación de JWT, guards para control de acceso por roles y middlewares para autenticación, lo que es fundamental para proteger los recursos de la plataforma y asegurar que solo usuarios autorizados puedan acceder a las funcionalidades correspondientes.

El **Auth-Service**, desarrollado igualmente con NestJS, centraliza la gestión de usuarios y autenticación, permitiendo registrar usuarios, validar credenciales, generar y validar tokens JWT. Esta separación en microservicios independientes mejora la seguridad, ya que el manejo de credenciales queda aislado, y facilita futuras ampliaciones, como integración con otros servicios o proveedores de autenticación.

Finalmente, NestJS utiliza **TypeScript**, lo que aporta tipado fuerte, mayor robustez del código y detección temprana de errores, aumentando la calidad del software y reduciendo problemas en entornos productivos.

---

## 6. Aplicación de los Principios SOLID

El desarrollo del proyecto se realizó siguiendo los **principios SOLID**, con el objetivo de construir una plataforma modular, mantenible, escalable y alineada con una arquitectura de microservicios. Estos principios fueron aplicados principalmente en el backend utilizando **NestJS**, apoyándose en la documentación oficial de autenticación de NestJS, y complementados en el frontend desarrollado con **React**.

---

### 1. Single Responsibility Principle (SRP)

El **Principio de Responsabilidad Única** establece que cada módulo o clase debe tener una única razón para cambiar. Este principio se aplicó de manera clara en la arquitectura del backend y frontend.

#### **Backend (NestJS):**

En el **Auth-Service**, las responsabilidades están claramente separadas:

* **UsersService**
  Se encarga exclusivamente de las operaciones CRUD relacionadas con los usuarios y el acceso a la base de datos (`user.entity.ts`, `refresh-token.entity.ts`).
  No contiene lógica de negocio relacionada con autenticación ni validaciones complejas.

* **AuthService**
  Centraliza toda la lógica de autenticación, como:

  * Encriptación de contraseñas
  * Validación de credenciales
  * Generación y validación de Access Token y Refresh Token
  * Manejo de JWT

  Esto permite que cualquier cambio en las reglas de autenticación no afecte directamente al acceso a datos.

* **Auth gRPC Controller**
  Se encarga únicamente de exponer los métodos definidos en el archivo `.proto` para que puedan ser consumidos por el API Gateway, sin incluir lógica de negocio adicional.

En el **API Gateway**, la responsabilidad también está bien definida:

* **Controllers** reciben las peticiones HTTP.
* **Guards** (`jwt-auth.guard.ts`, `roles.guard.ts`) se encargan exclusivamente de la validación de JWT y autorización por roles.
* **Decorators** (`roles.decorator.ts`) definen metadatos de autorización sin acoplar lógica adicional.
* La comunicación con otros servicios se realiza únicamente vía **gRPC**, evitando mezclar responsabilidades.

---

### 2. Open/Closed Principle (OCP)

El **Principio Abierto/Cerrado** establece que las entidades deben estar abiertas a extensión pero cerradas a modificación.

#### **Backend:**

La arquitectura basada en módulos de NestJS permite extender funcionalidades sin modificar código existente:

* Es posible agregar nuevos microservicios (por ejemplo, restaurante o delivery servicio) sin alterar el **Auth-Service**.
* Los **roles** están definidos mediante enums (`role.enum.ts`), lo que permite agregar nuevos roles sin modificar la lógica central de autenticación.
* Los **guards** pueden extenderse o reutilizarse para aplicar nuevas reglas de autorización sin modificar los controladores existentes.
* La definición de contratos mediante archivos `.proto` garantiza que la comunicación gRPC pueda extenderse manteniendo compatibilidad.

Además, cada microservicio posee su propia base de datos, lo que permite extender el sistema sin afectar la persistencia de otros servicios.

#### **Frontend:**

En React, el uso de componentes y páginas separadas por rol permite:

* Agregar nuevas vistas o roles sin modificar las páginas existentes.
* Extender rutas protegidas mediante `PrivateRoute` sin alterar el sistema de autenticación global.

---

### 3. Liskov Substitution Principle (LSP)

El **Principio de Sustitución de Liskov** indica que los objetos derivados deben poder sustituir a sus clases base sin alterar el comportamiento del sistema.

#### **Backend:**

Este principio se aplica mediante:

* El uso de **interfaces gRPC** (`auth.grpc.interface.ts`) que definen contratos claros entre el API Gateway y el Auth-Service.
* Los servicios cumplen exactamente con los contratos definidos en los archivos `.proto`, garantizando que cualquier implementación futura pueda sustituirse sin romper la comunicación.
* Los guards de autenticación y autorización siguen la misma estructura y pueden intercambiarse o ampliarse sin afectar el flujo del sistema.

---

### 4. Interface Segregation Principle (ISP)

El **Principio de Segregación de Interfaces** establece que los clientes no deben depender de interfaces que no utilizan.

#### **Backend:**

* El archivo `.proto` define métodos específicos para autenticación (login, registro, validación de tokens), evitando exponer operaciones innecesarias.
* El API Gateway solo consume los métodos que requiere del Auth-Service, sin depender de lógica interna del servicio.
* Los DTOs (`login.dto.ts`, `register.dto.ts`, `token.dto.ts`) están separados y contienen únicamente los datos necesarios para cada operación.

Esto reduce el acoplamiento entre servicios y mejora la claridad de la comunicación.

#### **Frontend:**

* Las rutas públicas y privadas están claramente separadas (`PublicRoute`, `PrivateRoute`).
* Cada página consume únicamente la información que necesita según el rol del usuario, utilizando el token JWT como fuente de autorización.

---

### 5. Dependency Inversion Principle (DIP)

El **Principio de Inversión de Dependencias** establece que los módulos de alto nivel no deben depender de módulos de bajo nivel, sino de abstracciones.

#### **Backend:**

NestJS facilita este principio mediante su sistema de **inyección de dependencias**:

* `AuthService` depende de `UsersService` a través de inyección, no de implementaciones concretas.
* Los controladores no instancian directamente servicios ni clases de base de datos.
* La lógica de autenticación depende de contratos (interfaces y DTOs), no de detalles de persistencia.
* El API Gateway no conoce la implementación interna del Auth-Service, solo interactúa con él mediante gRPC.

Esto permite cambiar la implementación interna de un servicio sin afectar a los consumidores.

#### **Frontend:**

* La lógica de navegación y control de acceso depende del **token JWT**, no de una implementación específica del backend.
* Las páginas y rutas dependen de una abstracción de autenticación basada en roles, lo que permite cambiar la lógica interna sin reestructurar toda la aplicación.

---

## 7. Explicación del manejo de uso de JWT

El manejo de autenticación y autorización en el proyecto se implementó utilizando **JSON Web Tokens (JWT)** bajo una arquitectura de microservicios, con el objetivo de garantizar **seguridad, escalabilidad y desacoplamiento** entre el frontend, el API Gateway y el Auth-Service. La implementación sigue las buenas prácticas recomendadas en la documentación oficial de NestJS para autenticación y se apoya en el uso combinado de **Access Tokens** y **Refresh Tokens**.

---

### 1. Diseño de la Persistencia de Refresh Tokens

Para reforzar la seguridad del sistema, se decidió **no confiar únicamente en tokens auto-contenidos**, sino implementar un mecanismo de **Refresh Tokens persistidos en base de datos**. Para ello, se creó una tabla específica:

```sql
CREATE TABLE refresh_tokens (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_refresh_user
      FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE CASCADE,

    INDEX idx_user_id (user_id),
    INDEX idx_token_hash (token_hash),
    INDEX idx_expires_at (expires_at)
);
```

Este diseño permite:

* Asociar múltiples refresh tokens a un usuario.
* Invalidar tokens individualmente mediante el campo `revoked`.
* Implementar expiración controlada.
* Revocar automáticamente los tokens al eliminar un usuario.
* Evitar almacenar el token en texto plano mediante el uso de **hash**.

Esta estrategia facilita la implementación de **logout seguro**, rotación de tokens y protección ante robo de credenciales.

---

### 2. Separación de Responsabilidades en el Auth-Service

En el **Auth-Service** se aplicó una clara separación de responsabilidades:

* **UsersService**
  Se encarga exclusivamente de interactuar con la base de datos:

  * Crear usuarios
  * Obtener usuarios
  * Guardar y revocar refresh tokens

  No contiene lógica de autenticación ni validaciones de seguridad.

* **AuthService**
  Centraliza toda la lógica de seguridad y autenticación:

  * Encriptación de contraseñas
  * Validación de credenciales durante el login
  * Generación de Access Token y Refresh Token
  * Validación de tokens
  * Manejo de expiración
  * Revocación de refresh tokens en logout

Este enfoque mantiene el código limpio, desacoplado y alineado con el principio de **Single Responsibility**, además de facilitar cambios futuros en las reglas de seguridad.

---

### 3. Comunicación Segura mediante gRPC

Una vez implementada la lógica de autenticación en el Auth-Service, se definió un **archivo `.proto`** que expone únicamente las operaciones necesarias:

* Login
* Registro
* Validación de token
* Refresh de token
* Logout

El **API Gateway** consume estos métodos vía **gRPC**, lo que permite una comunicación eficiente y segura entre microservicios, sin exponer la lógica interna de autenticación al exterior.

---

### 4. Validación de JWT en el API Gateway

El **API Gateway** es responsable de proteger los endpoints expuestos al frontend. Para ello, se implementaron **Guards personalizados**.

#### JwtAuthGuard

El `JwtAuthGuard` se ejecuta antes de que la petición llegue al controlador:

* Extrae el token del header `Authorization`
* Valida el token llamando al Auth-Service vía gRPC
* Bloquea la petición si el token es inválido o inexistente
* Inyecta la información del usuario validado en el objeto `request`

Esto permite que el API Gateway actúe como un **filtro de seguridad centralizado**, sin duplicar lógica de autenticación.

---

### 5. Autorización por Roles

Además de la autenticación, se implementó **autorización basada en roles**:

* Los roles se definen en un `enum`
* Se utiliza un decorador `@Roles()` para declarar permisos
* El `RolesGuard` valida que el rol contenido en el JWT tenga acceso al endpoint solicitado

Ejemplo:

```ts
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMINISTRADOR)
@Post('register/admin')
```

Esto asegura que un usuario no pueda acceder a funcionalidades que no le corresponden, incluso si posee un token válido.

---

### 6. Flujo de Autenticación desde el Frontend

Al realizar el **login**, el sistema genera:

* **Access Token** (corta duración)
* **Refresh Token** (larga duración)

Ambos tokens son enviados al frontend y almacenados en `localStorage` mediante el módulo `authStorage`.

El Access Token contiene en su payload:

* Id del usuario
* Email
* Rol

Esto permite al frontend:

* Controlar el acceso a rutas según el rol
* Redirigir al usuario a las vistas correspondientes
* Ocultar o mostrar funcionalidades dinámicamente

---

### 7. Uso del Token en las Peticiones HTTP

En cada petición protegida que realiza el frontend al backend:

* El **Access Token** se envía en el header `Authorization` con el esquema `Bearer`
* El API Gateway valida el token antes de procesar la solicitud

Si el token ha expirado:

1. Se realiza automáticamente una petición al endpoint `/auth/refresh`
2. Se obtiene un nuevo Access Token y Refresh Token
3. Se repite la petición original de forma transparente para el usuario

Este mecanismo sigue el principio de **“no molestar al usuario”**, evitando cierres de sesión innecesarios.

---

### 8. Logout Seguro

El logout se implementó de forma segura y distribuida:

* El frontend envía el refresh token al backend
* El Auth-Service marca el token como `revoked`
* El frontend limpia completamente el `localStorage`

Incluso si la llamada al backend falla, el frontend asegura que la sesión local se invalide, evitando accesos no autorizados.

---