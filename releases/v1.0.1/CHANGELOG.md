# Fiscal API v1.0.1

Corrección de lectura de datos en el dashboard.

- Convierte los valores `Date` de Google Sheets en cadenas ISO en `rowToObject_`.
- Permite que `listProfiles`, `listApiKeys` y `listAuditLog` devuelvan objetos serializables por `google.script.run`.
- Mantiene el formato de fecha compatible con el dashboard, que interpreta las cadenas ISO con `new Date()`.
