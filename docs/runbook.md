# Runbook SRE

## Validar cluster

```bash
kubectl get nodes -o wide
kubectl -n airport get pods -o wide
kubectl -n airport get hpa
kubectl -n airport get ingress
```

## Ver logs

```bash
./scripts/tail-logs.sh backend
./scripts/tail-logs.sh oracle
```

## Simular caída de pods

```bash
./scripts/simulate-failure.sh backend
./scripts/simulate-failure.sh frontend
```

Kubernetes debe recrear el pod automáticamente y mantener replicas deseadas.

## Reiniciar servicios

```bash
./scripts/restart-services.sh
```

## Backup Oracle

```bash
./scripts/backup-oracle.sh
```

## Restore Oracle

```bash
./scripts/restore-oracle.sh ./backups/airport-YYYYMMDD-HHMMSS.dmp
```

## Alertas esperadas

- `PodDown`: pod fallido o desconocido.
- `DeploymentReplicasUnavailable`: deployment sin replicas disponibles.
- `HighPodCPU`: pod con CPU alta.
- `HighPodMemory`: pod con RAM alta.
- `BackendHttp500`: errores 5xx elevados.
- `ServiceDown`: target no scrapeable.
