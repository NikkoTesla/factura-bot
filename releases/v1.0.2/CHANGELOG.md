# Fiscal API v1.0.2

- Acepta `apiKey` como Query Param en solicitudes `POST`, para que Muse la inyecte desde su bóveda.
- Conserva la autenticación con `apiKey` en el cuerpo JSON para integraciones existentes.
- Rechaza con `conflicting_api_keys` las solicitudes que envían claves diferentes en ambos lugares.
- Actualiza el ejemplo de conexión del dashboard y la documentación de instalación.
