# FacturaBot — Roadmap

## v1.0.0 — Base del proyecto

### Fiscal API

- Google Sheets como almacenamiento.
- Google Apps Script como backend.
- Dashboard administrativo.
- Perfiles fiscales.
- API Keys.
- Vigencias 1, 30 y 90 días.
- Revocación.
- AuditLog de consumo externo.
- Endpoint JSON.
- Recuperación de API Key desde dashboard.
- Estado visual de API Keys revocadas.
- Versión visible en dashboard.

### FacturaBot

- Definición de arquitectura.
- Soporte objetivo para:
  - muse.ai
  - Grok Bot
  - OpenAI Dots
  - buzz.xyz
- Definición de contrato entre agente, Fiscal API y skills.

### Skills

- Plantilla estándar `_template`.
- Skills incluidas: Walmart, Farmacias Guadalajara y La Gran Bodega.
- Catálogo abierto a proveedores adicionales con portal de facturación.

---

## v1.0.1 y v1.0.2 — Mantenimiento de Fiscal API

- v1.0.1: serialización de fechas de Sheets para la lectura del dashboard.
- v1.0.2: autenticación mediante Query Param `apiKey` desde la bóveda de Muse, manteniendo compatibilidad con los clientes que envían la clave en el cuerpo JSON.

---

## Próximas etapas

- Completar y validar configuración de FacturaBot para Grok Bot, OpenAI Dots y buzz.xyz.
- Definir formato común de entrada y salida de todas las skills.
- Validar las skills existentes en cuentas limpias y ante cambios de sus portales.
- Crear pruebas end-to-end.
- Mantener la guía de instalación para usuarios no técnicos y revisar cambios de las plataformas.
- Crear guía de creación de nuevas skills.
- Crear catálogo de proveedores soportados.
- Definir política de versionado de skills.
