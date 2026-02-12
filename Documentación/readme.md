## 1. Requerimientos Funcionales (RF)

### A. Gestión de Usuarios y Autenticación (Auth-Service)

* El sistema debe permitir el registro de nuevos usuarios con email, contraseña y rol (Cliente, Restaurante, Repartidor, Administrador).
* El sistema debe validar que el correo electrónico no esté duplicado en la base de datos.
* El sistema debe permitir el inicio de sesión (Login) validando credenciales encriptadas.
* El sistema debe generar un token JWT tras una autenticación exitosa.
* El sistema debe permitir la validación de tokens y permisos según el rol del usuario para proteger los endpoints.

### B. Catálogo de Restaurantes (Restaurant-Catalog-Service)

* El Administrador debe poder realizar el CRUD (Crear, Leer, Actualizar, Eliminar) de restaurantes.
* El usuario con rol Restaurante debe poder gestionar el CRUD de su propio menú (platos, descripción, precio y disponibilidad).
* El Cliente debe poder listar y visualizar los restaurantes disponibles.
* El Cliente debe poder consultar el menú detallado de un restaurante específico.

### C. Gestión de Pedidos (Order-Service)

* El Cliente debe poder realizar una orden con los productos seleccionados.
* El Cliente debe poder cancelar una orden (cambiando el estado a CANCELADO).
* El Restaurante debe poder visualizar las órdenes recibidas y marcarlas como "EN PROCESO" o "FINALIZADO".
* El Restaurante debe poder rechazar una orden por falta de stock o personal.

### D. Logística y Entrega (Delivery-Service)

* El Repartidor debe poder visualizar las órdenes con estado "LISTA" y aceptarlas.
* El sistema debe cambiar el estado a "EN CAMINO" cuando un repartidor acepta el pedido.
* El Repartidor debe poder marcar una orden como "ENTREGADA" o "CANCELADA" (en caso de percance).

### E. Notificaciones (Notification-Service)

* El sistema debe enviar un correo automático al Cliente al:
* Crear un pedido (Resumen y monto).
* Cancelar un pedido (Confirmación de cancelación).
* Asignar un repartidor (Nombre del repartidor y estado en camino).
* Rechazar un pedido (Razón y estado).

---

## 2. Requerimientos No Funcionales (RNF)

### A. Arquitectura y Comunicación

* **Arquitectura:** El sistema debe estar diseñado bajo una arquitectura de microservicios independientes.
* **Comunicación Externa:** La comunicación entre el frontend y el backend debe realizarse mediante una **API Gateway** utilizando **REST**.
* **Comunicación Interna:** La comunicación entre microservicios internos debe realizarse mediante **gRPC** para optimizar el rendimiento.
* **Persistencia:** Cada microservicio debe tener su propia base de datos relacional independiente (aislamiento de datos).

### B. Seguridad

* **Autenticación:** El acceso a los servicios debe estar protegido mediante tokens **JWT**.
* **Integridad de Datos:** Las contraseñas de los usuarios deben almacenarse utilizando algoritmos de encriptación o hashing seguros.

### C. Despliegue e Infraestructura

* **Contenedorización:** Cada microservicio debe estar empaquetado en una imagen de **Docker**.
* **Orquestación Local:** El sistema debe poder levantarse íntegramente mediante **Docker-Compose**.
* **Cloud:** La aplicación debe ser desplegable en la infraestructura de **Google Cloud Platform (GCP)**.

### D. Calidad y Mantenibilidad

* **Escalabilidad:** Los microservicios deben ser capaces de escalar de forma independiente según la carga.
* **Documentación:** Se debe documentar la arquitectura, diagramas de componentes, contratos gRPC y endpoints de la API.
* **Disponibilidad:** El diseño debe permitir que la caída de un servicio (ej. Notificaciones) no detenga el flujo crítico de otros servicios.

---

## 3. Diagramas

### Diagrama entidad relación

<div align="center">
  <img src="Diagramas/modelo-entidad-relación.png" alt="ERD" width="500">
  <p><i>Figura 1: Diagrama entidad relación</i></p>
</div>

### Diagrama de Arquitectura de alto nivel

<div align="center">
  <img src="Diagramas/diagrama-de-arquitectura.jpg" alt="ERD" width="500">
  <p><i>Figura 2: Diagrama de arquitectura de alto nivel</i></p>
</div>

### Diagrama de despliegue

<div align="center">
  <img src="Diagramas/diagrama-de-despliegue.png" alt="ERD" width="500">
  <p><i>Figura 3: Diagrama de despliegue</i></p>
</div>

### Diagrama de actividades

<div align="center">
  <img src="Diagramas/diagrama-de-actividades.png" alt="ERD" width="500">
  <p><i>Figura 4: Diagrama de actividades</i></p>
</div>

---

## 4. Justificación de la Elección de Frameworks

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

## 5. Aplicación de los Principios SOLID

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

## 6. Explicación del manejo de uso de JWT

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