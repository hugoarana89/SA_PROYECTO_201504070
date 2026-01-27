# Food Delivery Platform - Arquitectura de Microservicios

Este proyecto consiste en el desarrollo de una plataforma integral de entrega de alimentos (tipo delivery) diseñada bajo una arquitectura moderna de microservicios. La solución permite conectar clientes, restaurantes y repartidores de manera eficiente, segura y escalable.

## 🏗️ Arquitectura del Sistema

La plataforma utiliza un enfoque de servicios independientes que se comunican de forma híbrida: **REST** para la exposición externa y **gRPC** para la comunicación interna de alta eficiencia.

---

## 🚀 Competencias y Aprendizaje

El desarrollo de este proyecto consolida conocimientos avanzados en:

* **Sistemas Distribuidos:** Diseño y despliegue de servicios independientes coordinados.
* **Comunicación Eficiente:** Implementación de contratos mediante gRPC y APIs REST.
* **Seguridad:** Gestión de identidad con JWT, encriptación de credenciales y control de acceso basado en roles (RBAC).
* **Infraestructura Moderna:** Contenedorización con Docker/Docker-Compose y despliegue en Google Cloud Platform (GCP).

---

## 📦 Microservicios del Proyecto

| Servicio | Responsabilidad | Protocolo Principal |
| --- | --- | --- |
| **API Gateway / BFF** | Punto de entrada único, validación de JWT y enrutamiento. | REST (Externo) / gRPC (Interno) |
| **Auth-Service** | Gestión de usuarios, login, registro y emisión de tokens. | gRPC |
| **Restaurant-Service** | Gestión de catálogos, menús y disponibilidad de comercios. | gRPC |
| **Order-Service** | Ciclo de vida del pedido (Creación, cancelación, seguimiento). | gRPC |
| **Delivery-Service** | Gestión de logística para repartidores y estados de envío. | gRPC |
| **Notification-Service** | Alertas por correo electrónico al cliente (Event-driven/Direct). | gRPC |

---

## 🛠️ Detalle de Funcionalidades

### 🔐 Auth-Service (Seguridad)

Gestiona los roles: `CLIENTE`, `RESTAURANTE`, `REPARTIDOR` y `ADMINISTRADOR`.

* Registro con validación de duplicados.
* Hash de contraseñas para almacenamiento seguro.
* Generación y validación de **JSON Web Tokens (JWT)**.

### 🍴 Restaurant-Catalog-Service

* **Admin:** CRUD completo de restaurantes.
* **Restaurante:** Gestión de ítems del menú (precios, descripción, stock).
* **Cliente:** Consulta de catálogo y menús disponibles.

### 📝 Order-Service

* Flujo de pedidos: `CREADA` -> `EN PROCESO` -> `FINALIZADA`.
* Capacidad de cancelación por parte del cliente y rechazo por parte del restaurante.

### 🚚 Delivery-Service

* Asignación de pedidos a repartidores.
* Actualización de estados en tiempo real: `EN CAMINO` y `ENTREGADO`.

### 📧 Notification-Service

Sistema de alertas automáticas vía email para informar al cliente sobre:

* Resumen de pedido creado.
* Confirmación de envío (con datos del repartidor).
* Notificaciones de cancelación o rechazo.

---

## 🛠️ Tecnologías Utilizadas

* **Lenguaje:** [Python]
* **Comunicación:** gRPC (Protocol Buffers) y REST.
* **Autenticación:** JWT (JSON Web Tokens).
* **Base de Datos:** Relacional (MySQL) independientes por servicio.
* **Infraestructura:** Docker, Docker-Compose.
* **Cloud:** Google Cloud Platform (GCP).

---

## 🔧 Instalación y Despliegue

### Requisitos previos

* Docker y Docker Compose instalado.
* SDK de Google Cloud (si se despliega en la nube).

### Ejecución Local

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/SA_PRACTICAS_201504070.git

# Levantar todos los servicios
docker-compose up --build

```

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---
