# Guía de Despliegue en Kubernetes y Estrategias de Rollout/Rollback

## 📋 Tabla de Contenidos
1. [Prerrequisitos](#prerrequisitos)
2. [Estructura de Archivos K8s](#estructura-de-archivos-k8s)
3. [ConfigMaps y Secrets](#configmaps-y-secrets)
4. [Despliegue de Microservicios](#despliegue-de-microservicios)
5. [Servicios y Networking](#servicios-y-networking)
6. [Ingress Controller](#ingress-controller)
7. [Bases de Datos en K8s](#bases-de-datos-en-k8s)
8. [Estrategias de Rollout](#estrategias-de-rollout)
9. [Estrategias de Rollback](#estrategias-de-rollback)
10. [Monitoreo del Despliegue](#monitoreo-del-despliegue)
11. [Troubleshooting Común](#troubleshooting-común)

---

## Prerrequisitos

### Herramientas necesarias:
```bash
# Instalar kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/

# Instalar kind (para pruebas locales)
brew install kind  # macOS
# o
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind

# Instalar Helm (opcional, para charts)
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Verificar instalación
kubectl version --client
kind version
```

### Crear cluster local para pruebas:
```bash
# kind-config.yaml
cat <<EOF | kind create cluster --config=-
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
- role: worker
- role: worker
EOF

# Verificar nodos
kubectl get nodes
```

---

## Estructura de Archivos K8s

```
k8s/
├── namespace.yaml
├── configmaps/
│   ├── auth-config.yaml
│   ├── gateway-config.yaml
│   ├── order-config.yaml
│   └── restaurant-config.yaml
├── secrets/
│   ├── db-secrets.yaml
│   ├── jwt-secrets.yaml
│   └── registry-secrets.yaml
├── deployments/
│   ├── auth-deployment.yaml
│   ├── gateway-deployment.yaml
│   ├── order-deployment.yaml
│   ├── restaurant-deployment.yaml
│   ├── delivery-deployment.yaml
│   ├── notification-deployment.yaml
│   ├── payment-deployment.yaml
│   ├── fx-deployment.yaml
│   ├── ratings-deployment.yaml
│   ├── rabbitmq-deployment.yaml
│   └── redis-deployment.yaml
├── services/
│   ├── auth-service.yaml
│   ├── gateway-service.yaml
│   ├── order-service.yaml
│   └── ... (todos los services)
├── ingress.yaml
├── storage/
│   ├── pv-claims.yaml
│   └── storage-class.yaml
└── hpa/
    └── autoscaling.yaml
```

---

## ConfigMaps y Secrets

### 1. Namespace
```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: delivereats
---
# Cambiar contexto al namespace
kubectl config set-context --current --namespace=delivereats
```

### 2. ConfigMaps
```yaml
# configmaps/gateway-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: gateway-config
  namespace: delivereats
data:
  NODE_ENV: "production"
  PORT: "3000"
  AUTH_SERVICE_URL: "auth-service:50051"
  RESTAURANT_SERVICE_URL: "restaurant-service:50052"
  ORDER_SERVICE_URL: "order-service:50053"
  DELIVERY_SERVICE_URL: "delivery-service:50054"
  NOTIFICATION_SERVICE_URL: "notification-service:50055"
  PAYMENT_SERVICE_URL: "payment-service:50056"
  FX_SERVICE_URL: "fx-service:50057"
  RATINGS_SERVICE_URL: "ratings-service:50058"
  LOG_LEVEL: "info"
  CORS_ORIGIN: "https://delivereats.com"
  RATE_LIMIT_WINDOW: "900000"  # 15 minutos en ms
  RATE_LIMIT_MAX: "100"
```

```yaml
# configmaps/order-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: order-config
  namespace: delivereats
data:
  DATABASE_HOST: "postgres-order"
  DATABASE_PORT: "5432"
  DATABASE_NAME: "order_db"
  RABBITMQ_URL: "amqp://rabbitmq:5672"
  RABBITMQ_QUEUE: "orders"
  PAYMENT_SERVICE_URL: "payment-service:50056"
  DELIVERY_SERVICE_URL: "delivery-service:50054"
  NOTIFICATION_SERVICE_URL: "notification-service:50055"
  REDIS_URL: "redis://redis-service:6379"
  ORDER_TIMEOUT_MINUTES: "30"
  MAX_ORDER_QUANTITY: "50"
```

### 3. Secrets (nunca committear en texto plano)
```yaml
# secrets/db-secrets.yaml (version para desarrollo - BASE64)
apiVersion: v1
kind: Secret
metadata:
  name: db-secrets
  namespace: delivereats
type: Opaque
data:
  # echo -n "postgres" | base64
  POSTGRES_USER: cG9zdGdyZXM=
  # echo -n "StrongPassword123!" | base64
  POSTGRES_PASSWORD: U3Ryb25nUGFzc3dvcmQxMjMh
  # echo -n "jwt-secret-key-here" | base64
  JWT_SECRET: and0LXNlY3JldC1rZXktaGVyZQ==
  # echo -n "sendgrid-api-key" | base64
  SENDGRID_API_KEY: c2VuZGdyaWQtYXBpLWtleQ==
```

```bash
# Comandos para generar secrets
echo -n "postgres" | base64
echo -n "StrongPassword123!" | base64
echo -n "jwt-secret-key-here" | base64

# Aplicar secrets
kubectl apply -f secrets/db-secrets.yaml
```

---

## Despliegue de Microservicios

### 1. Auth Service Deployment
```yaml
# deployments/auth-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
  namespace: delivereats
  labels:
    app: auth-service
    version: v1
    tier: backend
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
        version: v1
    spec:
      containers:
      - name: auth-service
        image: gcr.io/delivereats/auth-service:v1.2.3
        imagePullPolicy: Always
        ports:
        - containerPort: 50051
          name: grpc
        - containerPort: 8080
          name: health
        env:
        - name: DB_HOST
          valueFrom:
            configMapKeyRef:
              name: auth-config
              key: DATABASE_HOST
        - name: DB_USER
          valueFrom:
            secretKeyRef:
              name: db-secrets
              key: POSTGRES_USER
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-secrets
              key: POSTGRES_PASSWORD
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: db-secrets
              key: JWT_SECRET
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          grpc:
            port: 50051
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          grpc:
            port: 50051
          initialDelaySeconds: 5
          periodSeconds: 5
        volumeMounts:
        - name: config
          mountPath: /app/config
      volumes:
      - name: config
        configMap:
          name: auth-config
      imagePullSecrets:
      - name: gcr-secret
```

### 2. RabbitMQ Deployment
```yaml
# deployments/rabbitmq-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rabbitmq
  namespace: delivereats
spec:
  replicas: 1
  strategy:
    type: Recreate
  selector:
    matchLabels:
      app: rabbitmq
  template:
    metadata:
      labels:
        app: rabbitmq
    spec:
      containers:
      - name: rabbitmq
        image: rabbitmq:3.12-management-alpine
        ports:
        - containerPort: 5672
          name: amqp
        - containerPort: 15672
          name: management
        env:
        - name: RABBITMQ_DEFAULT_USER
          valueFrom:
            secretKeyRef:
              name: rabbitmq-secrets
              key: RABBITMQ_USER
        - name: RABBITMQ_DEFAULT_PASS
          valueFrom:
            secretKeyRef:
              name: rabbitmq-secrets
              key: RABBITMQ_PASSWORD
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        volumeMounts:
        - name: rabbitmq-data
          mountPath: /var/lib/rabbitmq
      volumes:
      - name: rabbitmq-data
        persistentVolumeClaim:
          claimName: rabbitmq-pvc
```

### 3. Redis Deployment
```yaml
# deployments/redis-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: delivereats
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        ports:
        - containerPort: 6379
        args: ["--requirepass", "$(REDIS_PASSWORD)"]
        env:
        - name: REDIS_PASSWORD
          valueFrom:
            secretKeyRef:
              name: redis-secrets
              key: REDIS_PASSWORD
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "200m"
        volumeMounts:
        - name: redis-data
          mountPath: /data
      volumes:
      - name: redis-data
        persistentVolumeClaim:
          claimName: redis-pvc
```

---

## Servicios y Networking

### 1. Service para Auth
```yaml
# services/auth-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: auth-service
  namespace: delivereats
  labels:
    app: auth-service
spec:
  selector:
    app: auth-service
  ports:
  - name: grpc
    port: 50051
    targetPort: 50051
  - name: health
    port: 8080
    targetPort: 8080
  type: ClusterIP
```

### 2. Service para Gateway (público)
```yaml
# services/gateway-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: gateway-service
  namespace: delivereats
spec:
  selector:
    app: gateway-service
  ports:
  - name: http
    port: 80
    targetPort: 3000
  - name: https
    port: 443
    targetPort: 3000
  type: ClusterIP  # Será expuesto via Ingress
```

### 3. Service para RabbitMQ Management
```yaml
# services/rabbitmq-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: rabbitmq
  namespace: delivereats
spec:
  selector:
    app: rabbitmq
  ports:
  - name: amqp
    port: 5672
    targetPort: 5672
  - name: management
    port: 15672
    targetPort: 15672
  type: ClusterIP
```

---

## Ingress Controller

### 1. Instalar Nginx Ingress Controller
```bash
# Para kind
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

# Para GKE
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
```

### 2. Ingress Resource
```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: delivereats-ingress
  namespace: delivereats
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "10m"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "60"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - api.delivereats.com
    - www.delivereats.com
    secretName: delivereats-tls
  rules:
  - host: api.delivereats.com
    http:
      paths:
      - path: /auth
        pathType: Prefix
        backend:
          service:
            name: gateway-service
            port:
              number: 80
      - path: /orders
        pathType: Prefix
        backend:
          service:
            name: gateway-service
            port:
              number: 80
      - path: /restaurants
        pathType: Prefix
        backend:
          service:
            name: gateway-service
            port:
              number: 80
  - host: www.delivereats.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
```

---

## Bases de Datos en K8s

### 1. Persistent Volume Claim para PostgreSQL
```yaml
# storage/postgres-pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-auth-pvc
  namespace: delivereats
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
  storageClassName: standard
```

### 2. StatefulSet para PostgreSQL (mejor que Deployment)
```yaml
# statefulsets/postgres-auth.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres-auth
  namespace: delivereats
spec:
  serviceName: postgres-auth
  replicas: 1
  selector:
    matchLabels:
      app: postgres-auth
  template:
    metadata:
      labels:
        app: postgres-auth
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_DB
          value: "auth_db"
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: db-secrets
              key: POSTGRES_USER
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-secrets
              key: POSTGRES_PASSWORD
        volumeMounts:
        - name: postgres-data
          mountPath: /var/lib/postgresql/data
      volumes:
      - name: postgres-data
        persistentVolumeClaim:
          claimName: postgres-auth-pvc
```

---

## Estrategias de Rollout

### 1. RollingUpdate (Estrategia por defecto)
```yaml
# deployments/order-deployment.yaml (con estrategia rolling update)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service
spec:
  replicas: 5
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1        # Máximo de pods adicionales durante actualización
      maxUnavailable: 0  # Máximo de pods no disponibles durante actualización
  selector:
    matchLabels:
      app: order-service
  template:
    metadata:
      labels:
        app: order-service
        version: v2
    spec:
      containers:
      - name: order-service
        image: gcr.io/delivereats/order-service:v2.0.0
        # ... resto de configuración
```

### 2. Blue/Green Deployment
```yaml
# blue-green/order-blue.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service-blue
  labels:
    app: order-service
    version: blue
spec:
  replicas: 3
  selector:
    matchLabels:
      app: order-service
      version: blue
  template:
    metadata:
      labels:
        app: order-service
        version: blue
    spec:
      containers:
      - name: order-service
        image: gcr.io/delivereats/order-service:v1.0.0
```

```yaml
# blue-green/order-green.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service-green
  labels:
    app: order-service
    version: green
spec:
  replicas: 3
  selector:
    matchLabels:
      app: order-service
      version: green
  template:
    metadata:
      labels:
        app: order-service
        version: green
    spec:
      containers:
      - name: order-service
        image: gcr.io/delivereats/order-service:v2.0.0
```

```yaml
# blue-green/order-service.yaml (Service que apunta a blue o green)
apiVersion: v1
kind: Service
metadata:
  name: order-service
spec:
  selector:
    app: order-service
    version: blue  # Cambiar a green para switch
  ports:
  - port: 50053
    targetPort: 50053
```

### 3. Canary Deployment
```yaml
# canary/order-canary.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service-canary
  labels:
    app: order-service
    track: canary
spec:
  replicas: 1  # 10% del tráfico (si main tiene 9 réplicas)
  selector:
    matchLabels:
      app: order-service
      track: canary
  template:
    metadata:
      labels:
        app: order-service
        track: canary
    spec:
      containers:
      - name: order-service
        image: gcr.io/delivereats/order-service:v2.0.0-canary
```

```yaml
# canary/order-service.yaml (Service con balanceo por track)
apiVersion: v1
kind: Service
metadata:
  name: order-service
spec:
  selector:
    app: order-service
  ports:
  - port: 50053
    targetPort: 50053
  # Usar header para dirigir tráfico específico a canary
```

### 4. A/B Testing con Istio (opcional)
```yaml
# istio/virtual-service.yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: order-service
spec:
  hosts:
  - order-service
  http:
  - match:
    - headers:
        user-agent:
          regex: ".*Mobile.*"
    route:
    - destination:
        host: order-service
        subset: v2
  - route:
    - destination:
        host: order-service
        subset: v1
      weight: 90
    - destination:
        host: order-service
        subset: v2
      weight: 10
```

---

## Estrategias de Rollback

### 1. Rollback con kubectl
```bash
# Ver historial de despliegues
kubectl rollout history deployment/order-service -n delivereats

# Ver detalles de una revisión específica
kubectl rollout history deployment/order-service --revision=3 -n delivereats

# Rollback a revisión anterior
kubectl rollout undo deployment/order-service -n delivereats

# Rollback a revisión específica
kubectl rollout undo deployment/order-service --to-revision=2 -n delivereats

# Ver estado del rollback
kubectl rollout status deployment/order-service -n delivereats
```

### 2. Rollback automático con liveness/readiness probes
```yaml
# Configuración en el deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service
spec:
  template:
    spec:
      containers:
      - name: order-service
        # ... image config
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
          failureThreshold: 3  # Después de 3 fallos, reinicia
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
          failureThreshold: 1  # Si falla, no recibe tráfico
```

### 3. Rollback con Helm
```bash
# Instalar con Helm
helm install order-service ./charts/order-service --namespace delivereats

# Actualizar
helm upgrade order-service ./charts/order-service --set image.tag=v2.0.0

# Ver historial
helm history order-service -n delivereats

# Rollback
helm rollback order-service 1 -n delivereats
```

### 4. Estrategia de Rollback en CI/CD
```yaml
# .github/workflows/rollback.yml
name: Automatic Rollback

on:
  workflow_dispatch:
    inputs:
      service:
        description: 'Service to rollback'
        required: true
      revision:
        description: 'Revision number'
        required: true

jobs:
  rollback:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Configure kubectl
      uses: azure/setup-kubectl@v3
      with:
        version: 'latest'
    
    - name: Rollback deployment
      run: |
        kubectl rollout undo deployment/${{ github.event.inputs.service }} \
          --to-revision=${{ github.event.inputs.revision }} \
          -n delivereats
    
    - name: Verify rollback
      run: |
        kubectl rollout status deployment/${{ github.event.inputs.service }} \
          -n delivereats --timeout=5m
```

---

## Monitoreo del Despliegue

### 1. Verificar estado del despliegue
```bash
# Ver todos los recursos
kubectl get all -n delivereats

# Ver pods con detalles
kubectl get pods -n delivereats -o wide

# Ver deployments
kubectl get deployments -n delivereats

# Ver services
kubectl get services -n delivereats

# Ver ingress
kubectl get ingress -n delivereats
```

### 2. Monitoreo durante rollout
```bash
# Watchear el rollout
kubectl rollout status deployment/order-service -n delivereats --watch

# Ver logs de un pod específico
kubectl logs -f deployment/order-service -n delivereats

# Ver eventos recientes
kubectl get events -n delivereats --sort-by='.lastTimestamp'

# Describir deployment
kubectl describe deployment order-service -n delivereats
```

### 3. Health Checks avanzados
```yaml
# Crear un pod temporal para pruebas
apiVersion: v1
kind: Pod
metadata:
  name: test-pod
spec:
  containers:
  - name: curl
    image: curlimages/curl
    command: ["sleep", "3600"]
```

```bash
# Probar conectividad interna
kubectl exec -it test-pod -- curl http://order-service:8080/health
kubectl exec -it test-pod -- nslookup auth-service
```

### 4. Dashboard de monitoreo
```bash
# Instalar Metrics Server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Ver métricas
kubectl top pods -n delivereats
kubectl top nodes

# Instalar Kubernetes Dashboard
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml

# Acceder al dashboard
kubectl proxy
# Abrir: http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/
```

---

## Troubleshooting Común

### 1. Pod no inicia
```bash
# Ver estado del pod
kubectl describe pod <pod-name> -n delivereats

# Ver logs
kubectl logs <pod-name> -n delivereats

# Ver eventos
kubectl get events -n delivereats | grep <pod-name>
```

### 2. Imagen no se descarga
```bash
# Verificar secret del registry
kubectl get secrets -n delivereats

# Verificar política de imagePull
# Asegurar que el secret está en el deployment:
# imagePullSecrets:
# - name: gcr-secret
```

### 3. Problemas de DNS interno
```bash
# Probar resolución DNS
kubectl run -it --rm dns-test --image=busybox:1.28 -- nslookup auth-service

# Verificar endpoints del service
kubectl get endpoints auth-service -n delivereats
```

### 4. Health checks fallando
```yaml
# Temporalmente deshabilitar probes para debugging
kubectl patch deployment order-service -n delivereats -p '{"spec":{"template":{"spec":{"containers":[{"name":"order-service","livenessProbe":null,"readinessProbe":null}]}}}}'
```

### 5. Rollout atascado
```bash
# Verificar cuotas de recursos
kubectl describe quota -n delivereats

# Verificar PVCs
kubectl get pvc -n delivereats
kubectl describe pvc <pvc-name> -n delivereats

# Forzar reinicio
kubectl rollout restart deployment/order-service -n delivereats
```

---

## Checklist de Despliegue

### Pre-despliegue
- [ ] ConfigMaps creados y verificados
- [ ] Secrets creados (en Base64)
- [ ] Imágenes Docker construidas y subidas a registry
- [ ] Persistent Volumes configurados
- [ ] Namespace creado

### Durante despliegue
- [ ] Aplicar en orden: namespace → configmaps/secrets → storage → deployments → services → ingress
- [ ] Verificar que todos los pods están running
- [ ] Verificar que los services tienen endpoints
- [ ] Probar conectividad interna
- [ ] Verificar ingress rules

### Post-despliegue
- [ ] Health checks pasando
- [ ] Logs sin errores críticos
- [ ] Métricas de performance normales
- [ ] Backup de base de datos verificado
- [ ] Documentación actualizada

### Rollback Plan
- [ ] Script de rollback preparado
- [ ] Versiones anteriores en registry
- [ ] Procedimiento documentado
- [ ] Contactos de emergencia definidos

---

## Comandos Útiles Rápidos

```bash
# Aplicar todo
kubectl apply -f k8s/ -n delivereats

# Eliminar todo
kubectl delete -f k8s/ -n delivereats

# Escalar
kubectl scale deployment/order-service --replicas=5 -n delivereats

# Port forward para testing local
kubectl port-forward service/gateway-service 8080:80 -n delivereats

# Exec en pod
kubectl exec -it deployment/order-service -n delivereats -- /bin/sh

# Copiar archivos
kubectl cp ./local-file.txt <pod-name>:/app/ -n delivereats

# Ver resource usage
kubectl top pods -n delivereats

# Ver logs de múltiples pods
kubectl logs -l app=order-service -n delivereats --tail=100

# Ver cambios en tiempo real
kubectl get pods -n delivereats -w
```