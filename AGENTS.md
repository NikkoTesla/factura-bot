# FacturaBot — instrucciones para Codex

## Nombre del proyecto

**FacturaBot**

## Propósito

FacturaBot es un agente de IA de facturación, activo **24/7 en la nube**, diseñado para atender solicitudes de usuarios y automatizar procesos de facturación con distintos proveedores.

Debe ser compatible e instalable en:

- muse.ai
- Grok Bot
- OpenAI Dots
- buzz.xyz

El proyecto debe mantenerse modular, portable y extensible entre plataformas.

---

## Arquitectura general

FacturaBot se compone de tres piezas principales:

1. **Agente de IA**
2. **Fiscal API**
3. **Skills de facturación por proveedor**

### 1. Agente de IA

Responsabilidades:

- atender al usuario;
- identificar la intención de facturación;
- identificar el proveedor;
- seleccionar la skill correcta;
- consultar los datos fiscales mediante Fiscal API;
- ejecutar la skill correspondiente;
- devolver al usuario el resultado de la facturación;
- mantenerse portable entre las plataformas soportadas.

La configuración específica de cada plataforma debe vivir en:

- `agent/muse-ai/`
- `agent/grok-bot/`
- `agent/openai-dots/`
- `agent/buzz-xyz/`

No mezclar configuraciones específicas de plataforma con la lógica general de FacturaBot.

---

### 2. Fiscal API

Ubicación:

`fiscal-api/`

Responsabilidades:

- almacenar perfiles fiscales;
- exponer perfiles fiscales mediante API;
- generar API Keys;
- permitir expiración y revocación;
- registrar consumo externo en AuditLog;
- servir como única fuente de verdad para los datos fiscales.

Tecnología actual:

- Google Sheets
- Google Apps Script
- Dashboard HTML
- Web App `/exec`

Nombre actual del sistema fiscal:

**API Fiscal Personal para Agentes de IA**

Versión actual:

**1.0.0**

Autor:

**Nikko Tesla**

Sitio:

https://nikkotesla.github.io/

Regla importante:

**Las skills nunca deben almacenar datos fiscales particulares del usuario.**

---

### 3. Skills

Ubicación:

`skills/`

Debe existir una skill independiente por proveedor.

Ejemplos:

- `skills/walmart/`
- `skills/costco/`
- `skills/home-depot/`
- `skills/office-depot/`

Cada skill debe contener únicamente la lógica específica necesaria para facturar con ese proveedor.

Las skills pueden crecer indefinidamente conforme se agreguen nuevos proveedores.

Cada nueva skill debe partir de:

`skills/_template/`

---

## Estructura mínima de una skill

```text
provider-name/
└── SKILL.md
```

`README.md`, `examples/` y `assets/` son opcionales y se agregan solo cuando la integración del proveedor los necesita.

---

## Fiscal API — contrato base

Petición:

```http
POST <FISCAL_API_ENDPOINT>
Content-Type: application/json
```

Body:

```json
{
  "action": "getFiscalProfile",
  "alias": "personal",
  "apiKey": "<SECRET>"
}
```

Respuesta exitosa:

```json
{
  "ok": true,
  "data": {
    "alias": "...",
    "tipo_persona": "...",
    "rfc": "...",
    "nombre_razon_social": "...",
    "regimen_fiscal": "...",
    "codigo_postal": "...",
    "uso_cfdi_default": "...",
    "email": "..."
  }
}
```

Nunca escribir API Keys reales en archivos versionados.

---

## Reglas de seguridad

Nunca versionar:

- API Keys reales;
- contraseñas;
- tokens;
- cookies;
- credenciales;
- secretos de bóveda;
- datos fiscales reales de usuarios;
- datos personales innecesarios.

Usar placeholders:

- `YOUR_API_KEY`
- `YOUR_ENDPOINT`
- `YOUR_ALIAS`
- `YOUR_SECRET`

Los secretos deben almacenarse en la bóveda o secret manager de la plataforma donde se instale FacturaBot.

---

## Reglas de implementación

- Mantener FacturaBot portable entre las plataformas soportadas.
- Mantener separada la configuración específica de cada plataforma.
- No introducir dependencias innecesarias entre una skill y otra.
- No introducir infraestructura centralizada sin documentarlo.
- Cada usuario debe poder operar su propia Fiscal API.
- Mantener el proceso de instalación apto para usuarios no técnicos.
- Preferir copy/paste y pasos guiados.
- No exigir edición manual de código en la instalación normal.
- No cambiar contratos API sin actualizar documentación y ejemplos.
- No cambiar arquitectura sin actualizar `docs/ARCHITECTURE.md`.
- Mantener versiones explícitas.
- Antes de realizar cambios destructivos, presentar un plan.
- No borrar archivos funcionales existentes sin autorización expresa.

---

## Estado actual

### Fiscal API v1.0.0

Incluye:

- perfiles fiscales;
- API Keys con vigencia de 1, 30 o 90 días;
- revocación;
- recuperación de API Key desde dashboard;
- AuditLog de consumo externo;
- endpoint Web App;
- toast al copiar;
- API Keys revocadas con texto gris;
- API Keys revocadas sin capacidad de copiar;
- logo Nikko Tesla;
- versión visible en dashboard.

El frontend del dashboard se considera estable para v1.0.0 salvo correcciones de bugs.

---

## Forma de trabajar con este repositorio

Antes de modificar el proyecto:

1. Leer este `AGENTS.md`.
2. Leer `docs/PROJECT_CONTEXT.md`.
3. Leer `docs/ARCHITECTURE.md`.
4. Leer `docs/CONVENTIONS.md`.
5. Revisar documentación específica del componente afectado.
6. Preservar compatibilidad con los demás componentes.
