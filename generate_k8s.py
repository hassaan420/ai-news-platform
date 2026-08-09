import os

k8s_dir = r"c:\Users\hp\ai-news-platform\k8s"
os.makedirs(k8s_dir, exist_ok=True)

# 1. Namespace
namespace_yaml = """apiVersion: v1
kind: Namespace
metadata:
  name: ai-news
"""
with open(os.path.join(k8s_dir, "00-namespace.yaml"), "w") as f:
    f.write(namespace_yaml)

# 2. ConfigMap & Secret
configmap_yaml = """apiVersion: v1
kind: ConfigMap
metadata:
  name: ai-news-config
  namespace: ai-news
data:
  SPRING_PROFILES_ACTIVE: "prod"
  SPRING_DATASOURCE_URL_AUTH: "jdbc:mysql://mysql:3306/auth_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
  SPRING_DATASOURCE_URL_NEWS: "jdbc:mysql://mysql:3306/news_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
  SPRING_DATASOURCE_URL_CATEGORY: "jdbc:mysql://mysql:3306/category_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
  SPRING_DATASOURCE_URL_ADMIN: "jdbc:mysql://mysql:3306/admin_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
  SPRING_DATASOURCE_USERNAME: "newsplatform"
  SPRING_REDIS_HOST: "redis"
  SPRING_REDIS_PORT: "6379"
  # Service URLs
  AUTH_SERVICE_URL: "http://auth-service:8081"
  NEWS_SERVICE_URL: "http://news-service:8082"
  CATEGORY_SERVICE_URL: "http://category-service:8083"
  SEARCH_SERVICE_URL: "http://search-service:8084"
  SCHEDULER_SERVICE_URL: "http://scheduler-service:8085"
  ADMIN_SERVICE_URL: "http://admin-service:8086"
---
apiVersion: v1
kind: Secret
metadata:
  name: ai-news-secrets
  namespace: ai-news
type: Opaque
stringData:
  MYSQL_ROOT_PASSWORD: "strong_root_password"
  MYSQL_PASSWORD: "strong_db_password"
  REDIS_PASSWORD: "strong_redis_password"
  JWT_SECRET: "your_super_secret_jwt_signing_key_min_32_bytes_long"
  INTERNAL_API_KEY: "your_internal_service_key"
  NEWSAPI_KEY: "dummy"
"""
with open(os.path.join(k8s_dir, "01-config-secrets.yaml"), "w") as f:
    f.write(configmap_yaml)

# 3. StatefulSets (MySQL & Redis)
stateful_yaml = """apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mysql
  namespace: ai-news
spec:
  serviceName: "mysql"
  replicas: 1
  selector:
    matchLabels:
      app: mysql
  template:
    metadata:
      labels:
        app: mysql
    spec:
      containers:
      - name: mysql
        image: mysql:8.0
        env:
        - name: MYSQL_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: ai-news-secrets
              key: MYSQL_ROOT_PASSWORD
        - name: MYSQL_USER
          valueFrom:
            configMapKeyRef:
              name: ai-news-config
              key: SPRING_DATASOURCE_USERNAME
        - name: MYSQL_PASSWORD
          valueFrom:
            secretKeyRef:
              name: ai-news-secrets
              key: MYSQL_PASSWORD
        ports:
        - containerPort: 3306
        volumeMounts:
        - name: mysql-data
          mountPath: /var/lib/mysql
  volumeClaimTemplates:
  - metadata:
      name: mysql-data
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 10Gi
---
apiVersion: v1
kind: Service
metadata:
  name: mysql
  namespace: ai-news
spec:
  ports:
  - port: 3306
  selector:
    app: mysql
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: redis
  namespace: ai-news
spec:
  serviceName: "redis"
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
        command: ["redis-server", "--requirepass", "$(REDIS_PASSWORD)", "--maxmemory", "256mb", "--maxmemory-policy", "allkeys-lru"]
        env:
        - name: REDIS_PASSWORD
          valueFrom:
            secretKeyRef:
              name: ai-news-secrets
              key: REDIS_PASSWORD
        ports:
        - containerPort: 6379
---
apiVersion: v1
kind: Service
metadata:
  name: redis
  namespace: ai-news
spec:
  ports:
  - port: 6379
  selector:
    app: redis
"""
with open(os.path.join(k8s_dir, "02-statefulsets.yaml"), "w") as f:
    f.write(stateful_yaml)

# 4. Deployments (Spring Boot & Frontend)
services = [
    ('gateway-service', 8080),
    ('auth-service', 8081),
    ('news-service', 8082),
    ('category-service', 8083),
    ('search-service', 8084),
    ('scheduler-service', 8085),
    ('admin-service', 8086),
    ('frontend', 80)
]

deployments_yaml = ""
for svc, port in services:
    db_env = ""
    if svc in ['auth-service', 'news-service', 'category-service', 'admin-service']:
        db_key = svc.split('-')[0].upper()
        db_env = f"""
        - name: SPRING_DATASOURCE_URL
          valueFrom:
            configMapKeyRef:
              name: ai-news-config
              key: SPRING_DATASOURCE_URL_{db_key}
        - name: SPRING_DATASOURCE_USERNAME
          valueFrom:
            configMapKeyRef:
              name: ai-news-config
              key: SPRING_DATASOURCE_USERNAME
        - name: SPRING_DATASOURCE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: ai-news-secrets
              key: MYSQL_PASSWORD"""
    
    redis_env = ""
    if svc != 'frontend':
        redis_env = f"""
        - name: SPRING_PROFILES_ACTIVE
          valueFrom:
            configMapKeyRef:
              name: ai-news-config
              key: SPRING_PROFILES_ACTIVE
        - name: SPRING_REDIS_HOST
          valueFrom:
            configMapKeyRef:
              name: ai-news-config
              key: SPRING_REDIS_HOST
        - name: SPRING_REDIS_PORT
          valueFrom:
            configMapKeyRef:
              name: ai-news-config
              key: SPRING_REDIS_PORT
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: ai-news-secrets
              key: JWT_SECRET"""

    probes = ""
    if svc != 'frontend':
        probes = f"""
        livenessProbe:
          httpGet:
            path: /actuator/health/liveness
            port: {port}
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: {port}
          initialDelaySeconds: 15
          periodSeconds: 10"""
    
    deployments_yaml += f"""---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {svc}
  namespace: ai-news
spec:
  replicas: 1
  selector:
    matchLabels:
      app: {svc}
  template:
    metadata:
      labels:
        app: {svc}
    spec:
      containers:
      - name: {svc}
        image: {svc}:latest
        imagePullPolicy: Never
        ports:
        - containerPort: {port}
        env:{redis_env}{db_env}{probes}
---
apiVersion: v1
kind: Service
metadata:
  name: {svc}
  namespace: ai-news
spec:
  ports:
  - port: {port}
  selector:
    app: {svc}
"""

with open(os.path.join(k8s_dir, "03-deployments.yaml"), "w") as f:
    f.write(deployments_yaml)

# 5. Ingress
ingress_yaml = """apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ai-news-ingress
  namespace: ai-news
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: gateway-service
            port:
              number: 8080
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 80
"""
with open(os.path.join(k8s_dir, "04-ingress.yaml"), "w") as f:
    f.write(ingress_yaml)

print("K8s manifests generated successfully.")
