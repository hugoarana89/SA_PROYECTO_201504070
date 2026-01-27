### 1. Requerimientos Funcionales (RF)

#### **A. Gestión de Usuarios y Autenticación (Auth-Service)**

* El sistema debe permitir el registro de nuevos usuarios con email, contraseña y rol (Cliente, Restaurante, Repartidor, Administrador).
* El sistema debe validar que el correo electrónico no esté duplicado en la base de datos.
* El sistema debe permitir el inicio de sesión (Login) validando credenciales encriptadas.
* El sistema debe generar un token JWT tras una autenticación exitosa.
* El sistema debe permitir la validación de tokens y permisos según el rol del usuario para proteger los endpoints.

#### **B. Catálogo de Restaurantes (Restaurant-Catalog-Service)**

* El Administrador debe poder realizar el CRUD (Crear, Leer, Actualizar, Eliminar) de restaurantes.
* El usuario con rol Restaurante debe poder gestionar el CRUD de su propio menú (platos, descripción, precio y disponibilidad).
* El Cliente debe poder listar y visualizar los restaurantes disponibles.
* El Cliente debe poder consultar el menú detallado de un restaurante específico.

#### **C. Gestión de Pedidos (Order-Service)**

* El Cliente debe poder realizar una orden con los productos seleccionados.
* El Cliente debe poder cancelar una orden (cambiando el estado a CANCELADO).
* El Restaurante debe poder visualizar las órdenes recibidas y marcarlas como "EN PROCESO" o "FINALIZADO".
* El Restaurante debe poder rechazar una orden por falta de stock o personal.

#### **D. Logística y Entrega (Delivery-Service)**

* El Repartidor debe poder visualizar las órdenes con estado "LISTA" y aceptarlas.
* El sistema debe cambiar el estado a "EN CAMINO" cuando un repartidor acepta el pedido.
* El Repartidor debe poder marcar una orden como "ENTREGADA" o "CANCELADA" (en caso de percance).

#### **E. Notificaciones (Notification-Service)**

* El sistema debe enviar un correo automático al Cliente al:
* Crear un pedido (Resumen y monto).
* Cancelar un pedido (Confirmación de cancelación).
* Asignar un repartidor (Nombre del repartidor y estado en camino).
* Rechazar un pedido (Razón y estado).

---

### 2. Requerimientos No Funcionales (RNF)

#### **A. Arquitectura y Comunicación**

* **Arquitectura:** El sistema debe estar diseñado bajo una arquitectura de microservicios independientes.
* **Comunicación Externa:** La comunicación entre el frontend y el backend debe realizarse mediante una **API Gateway** utilizando **REST**.
* **Comunicación Interna:** La comunicación entre microservicios internos debe realizarse mediante **gRPC** para optimizar el rendimiento.
* **Persistencia:** Cada microservicio debe tener su propia base de datos relacional independiente (aislamiento de datos).

#### **B. Seguridad**

* **Autenticación:** El acceso a los servicios debe estar protegido mediante tokens **JWT**.
* **Integridad de Datos:** Las contraseñas de los usuarios deben almacenarse utilizando algoritmos de encriptación o hashing seguros.

#### **C. Despliegue e Infraestructura**

* **Contenedorización:** Cada microservicio debe estar empaquetado en una imagen de **Docker**.
* **Orquestación Local:** El sistema debe poder levantarse íntegramente mediante **Docker-Compose**.
* **Cloud:** La aplicación debe ser desplegable en la infraestructura de **Google Cloud Platform (GCP)**.

#### **D. Calidad y Mantenibilidad**

* **Escalabilidad:** Los microservicios deben ser capaces de escalar de forma independiente según la carga.
* **Documentación:** Se debe documentar la arquitectura, diagramas de componentes, contratos gRPC y endpoints de la API.
* **Disponibilidad:** El diseño debe permitir que la caída de un servicio (ej. Notificaciones) no detenga el flujo crítico de otros servicios.