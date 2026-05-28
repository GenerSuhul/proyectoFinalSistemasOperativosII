# Troubleshooting

## Oracle falla en Docker Desktop Windows

Si ves:

```text
Segmentation fault (core dumped) sqlplus -s / as sysdba
```

El fallo ocurre dentro del binario de Oracle antes de que Spring Boot o Flyway se conecten. En Windows + Docker Desktop + WSL2 puede pasar con Oracle 23ai Free. El despliegue objetivo del proyecto es Oracle Linux en VPS, donde debe validarse la base.

Mitigaciones locales:

- Subir memoria de Docker Desktop a 10 GB o más.
- Usar `docker compose down -v` antes de reintentar.
- Usar Oracle instalado nativo o una instancia Oracle remota y cambiar `DB_URL`.

## Backend no conecta a Oracle

```bash
kubectl -n airport logs deploy/backend
kubectl -n airport logs deploy/oracle
kubectl -n airport exec deploy/backend -- wget -qO- http://localhost:8080/actuator/health
```

Verifica:

- Secret `DB_PASSWORD`.
- Service `oracle`.
- PVC montado.
- Oracle healthy.

## HPA no muestra métricas

Instala metrics-server:

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
kubectl top nodes
kubectl top pods -n airport
```

## Ingress no responde

```bash
kubectl -n ingress-nginx get svc
kubectl -n airport describe ingress airport-ingress
```

Revisa DNS de:

- `airport.example.com`
- `grafana.airport.example.com`
- `prometheus.airport.example.com`
