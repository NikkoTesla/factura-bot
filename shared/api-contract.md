# Fiscal API — Contrato compartido

## Acción

`getFiscalProfile`

## Request

```json
{
  "action": "getFiscalProfile",
  "alias": "YOUR_ALIAS",
  "apiKey": "YOUR_API_KEY"
}
```

## Response

```json
{
  "ok": true,
  "data": {
    "alias": "YOUR_ALIAS",
    "tipo_persona": "fisica",
    "rfc": "...",
    "nombre_razon_social": "...",
    "regimen_fiscal": "...",
    "codigo_postal": "...",
    "uso_cfdi_default": "...",
    "email": "..."
  }
}
```

## Regla

FacturaBot y las skills no deben inventar datos fiscales cuando la API falle.
