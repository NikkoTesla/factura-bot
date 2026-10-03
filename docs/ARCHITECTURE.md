# FacturaBot — Arquitectura

## Vista general

```text
                    ┌───────────────────┐
                    │      Usuario      │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │     FacturaBot    │
                    │   Agente 24/7     │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌──────────────────────┐
                    │ Memoria de sesión    │
                    │ usuario + alias      │
                    └──────────┬───────────┘
                         perfil│ausente o
                         actualizado
                              ▼
                    ┌──────────────────────┐
                    │     Fiscal API       │
                    │ Google Apps Script  │
                    └──────────┬───────────┘
                              │
                              ▼
                    ┌──────────────────────┐
                    │ Google Drive/Sheets  │
                    │ perfiles, API Keys,  │
                    │ AuditLog             │
                    └──────────────────────┘

                    ┌──────────────────────┐
                    │ Skills por proveedor │
                    │ Walmart              │
                    │ Farmacias Guadalajara│
                    │ La Gran Bodega       │
                    └──────────────────────┘
```

## Capa de agente

Ruta:

`agent/`

Cada plataforma tiene su propia carpeta:

```text
agent/
├── muse-ai/
├── grok-bot/
├── openai-dots/
└── buzz-xyz/
```

La guía de instalación más completa actualmente es `muse-ai/`. Las otras carpetas son esqueletos y no representan instalaciones validadas. Cada carpeta puede incluir:

- `README.md`
- `setup.md`
- `system-prompt.md`
- `api-connection.md`
- `secrets.md`
- `examples/`

La lógica conceptual debe mantenerse equivalente entre plataformas.

---

## Fiscal API

Ruta:

`fiscal-api/`

Subcomponentes:

```text
fiscal-api/
├── apps-script/
└── spreadsheet/
```

### apps-script

Contiene todo el código que el usuario copia a Google Apps Script.

### spreadsheet

Contiene la plantilla del Google Sheet y documentación asociada.

---

## Skills

Ruta:

`skills/`

Cada proveedor usa una carpeta independiente.

```text
skills/
├── _template/
├── walmart/
├── farmacia-guadalajara/
├── gran-bodega/
└── ...
```

No existe dependencia directa entre skills salvo utilidades compartidas explícitamente documentadas.

---

## Datos y secretos

Fiscal API es la fuente de verdad de los perfiles fiscales. En cada sesión, el agente busca primero el perfil del usuario y alias correctos en su memoria temporal. Solo consulta Fiscal API si no está disponible, está incompleto o el usuario solicita actualizarlo. Tras una respuesta correcta, lo reutiliza durante esa sesión para facturas del mismo alias, incluso entre skills distintas. La memoria de sesión no se escribe en archivos ni se conserva como memoria permanente.

Cada skill identifica mediante OCR los datos que exige el portal de su proveedor y los coloca en los campos correspondientes. Los datos fiscales proceden del perfil de la sesión, no del ticket.

Los secretos deben almacenarse en el secret manager o bóveda de cada plataforma.

Nunca deben almacenarse en Git.
