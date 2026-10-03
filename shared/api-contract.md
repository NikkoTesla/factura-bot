# Fiscal API — Contrato compartido

## Acción

`getFiscalProfile`

## Request

Envía `POST` al endpoint `/exec`. En Muse, configura la bóveda para agregar el parámetro de consulta `apiKey` a la URL; el cuerpo JSON contiene la acción y el alias:

```http
POST YOUR_ENDPOINT?apiKey=YOUR_API_KEY
Content-Type: application/json
```

```json
{
  "action": "getFiscalProfile",
  "alias": "YOUR_ALIAS"
}
```

`YOUR_API_KEY` representa el valor inyectado por la bóveda durante la ejecución. No escribas la clave real en una URL guardada, prompt, skill o archivo. Para clientes existentes, la API sigue aceptando `apiKey` dentro del cuerpo JSON. Si se envía en ambos lugares, ambos valores deben coincidir; de lo contrario responde `conflicting_api_keys`.

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
