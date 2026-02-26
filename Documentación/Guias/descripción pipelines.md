# **Descripción del Pipeline CI/CD**

En la Fase 2 del proyecto *Delivereats* se implementará un pipeline de Integración Continua y Despliegue Continuo (CI/CD) utilizando **GitHub Actions** como herramienta de automatización, Docker para la generación de imágenes y Kubernetes como plataforma de orquestación en producción.

El objetivo principal del pipeline es garantizar que cada cambio realizado en el repositorio pase por un proceso automatizado de construcción, validación, publicación y despliegue, asegurando calidad, trazabilidad y disponibilidad del sistema.

## **Etapas del Pipeline**

El pipeline se compone de cuatro etapas principales:

### 1. Build (Construcción de Imágenes)

En esta etapa se construyen las imágenes Docker correspondientes a cada microservicio (Auth-Service, Restaurant-Service, Order-Service, Delivery-Service, Notification-Service, Payment-Service, etc.) y al frontend desarrollado en React.

Durante el proceso:

* Se instalan las dependencias del proyecto.
* Se ejecuta el proceso de compilación (build).
* Se construyen las imágenes Docker.
* Se etiquetan las imágenes con una convención de versionado que incluye:

  * Versión semántica (cuando aplique).
  * Hash del commit (SHA).
  * Tag `latest` para la rama principal.

Esto permite identificar exactamente qué versión del código fue desplegada en el clúster.

---

### 2. Test (Validación Automatizada)

Antes de publicar cualquier imagen, el pipeline ejecuta pruebas automatizadas utilizando **Jest** en los servicios core del sistema.

El pipeline está configurado para:

* Ejecutar pruebas unitarias.
* Verificar que la cobertura mínima sea del 70%.
* Detener el proceso si alguna prueba falla.

De esta manera se garantiza que únicamente versiones estables y validadas continúen hacia producción.

---

### 3. Publicación en Registry

Una vez superadas las pruebas, las imágenes Docker son publicadas en un Container Registry (Google Container Registry o Artifact Registry).

El acceso al registry se realiza mediante credenciales almacenadas como secretos del sistema CI/CD, evitando exponer información sensible en el repositorio.

La convención de nombres de imagen sigue el formato:

```
<registry>/<proyecto>/<servicio>:<version>
```

Esto asegura consistencia y trazabilidad entre versiones desplegadas.

---

### 4. Despliegue Automatizado a Kubernetes

En la etapa final, el pipeline ejecuta comandos para aplicar los manifiestos almacenados en el directorio `k8s/` del repositorio:

```
kubectl apply -f k8s/
```

Kubernetes gestiona la actualización mediante estrategia **Rolling Update**, lo que permite:

* Actualizaciones sin tiempo de inactividad (Zero Downtime).
* Sustitución progresiva de pods.
* Posibilidad de realizar Rollback automático o manual ante fallos.

En caso de error, se puede ejecutar:

```
kubectl rollout undo deployment/<servicio>
```

El pipeline deja registro en los logs del entorno desplegado, versión aplicada y resultado del despliegue.

---

# **Gestión de Variables y Secrets**

En Fase 1 las configuraciones eran gestionadas mediante archivos `.env`.
En Fase 2, por razones de seguridad y buenas prácticas DevOps, se separan en:

## 1. ConfigMaps (Configuración No Sensible)

Incluyen:

* Hosts y puertos de bases de datos.
* URLs internas de microservicios.
* Variables de entorno generales (NODE_ENV).
* Puertos gRPC.
* URLs públicas del frontend.
* Timeouts y flags de configuración.

Estas variables no contienen información crítica y pueden almacenarse en los manifiestos de Kubernetes.

---

## 2. Secrets (Información Sensible)

Incluyen:

* JWT_SECRET (clave de firma de tokens).
* Credenciales de bases de datos (passwords).
* SENDGRID_API_KEY.
* Credenciales del Container Registry.
* Claves de Service Account de Google Cloud.

Estos valores:

* No se almacenan en el repositorio.
* Se gestionan mediante GitHub Secrets.
* Se inyectan en el clúster como Kubernetes Secrets.
* Se consumen en los Deployments mediante variables de entorno.

Esto garantiza confidencialidad y cumplimiento de buenas prácticas de seguridad.

---

# **Descripción del Flujo JWT**

El sistema utiliza autenticación basada en **JSON Web Tokens (JWT)** para proteger los endpoints expuestos por el API Gateway y los microservicios internos.

## 1. Registro y Login

Cuando un usuario se registra o inicia sesión:

1. El cliente envía sus credenciales al API Gateway.
2. El Gateway redirige la solicitud al Auth-Service.
3. El Auth-Service valida:

   * Existencia del usuario.
   * Coincidencia del password (comparando hash).
4. Si las credenciales son válidas, se genera un JWT firmado con la clave secreta del sistema.

El token contiene:

* ID del usuario.
* Email.
* Rol (CLIENTE, RESTAURANTE, REPARTIDOR, ADMINISTRADOR).
* Fecha de expiración.

---

## 2. Uso del Token

Una vez emitido, el JWT es enviado al cliente y almacenado en el frontend (generalmente en memoria o almacenamiento seguro).

En cada petición protegida:

1. El frontend envía el token en el header:

```
Authorization: Bearer <token>
```

2. El API Gateway:

   * Verifica la firma del JWT.
   * Valida expiración.
   * Extrae el rol del usuario.
   * Autoriza o rechaza la solicitud según el rol.

Si el token es válido, la solicitud se reenvía al microservicio correspondiente mediante gRPC.

---

## 3. Validación Interna

En caso necesario, los microservicios también pueden validar el token o confiar en el Gateway como punto único de autenticación.

Esto permite:

* Centralizar la seguridad.
* Reducir lógica duplicada.
* Mantener coherencia en autorización basada en roles.

---

## 4. Seguridad del JWT

La clave de firma (JWT_SECRET):

* Se almacena como Kubernetes Secret.
* No está presente en el repositorio.
* Se inyecta como variable de entorno en el Auth-Service y API Gateway.

El tiempo de expiración del token es configurable y forma parte de la política de seguridad del sistema.

---

# **Conclusión**

Con la implementación del pipeline CI/CD y el flujo de autenticación basado en JWT, el sistema evoluciona hacia una arquitectura profesional que cumple con estándares de la industria:

* Automatización completa del ciclo de vida del software.
* Seguridad mediante gestión adecuada de secretos.
* Trazabilidad de versiones desplegadas.
* Actualizaciones sin tiempo de inactividad.
* Autenticación robusta y autorización basada en roles.

---