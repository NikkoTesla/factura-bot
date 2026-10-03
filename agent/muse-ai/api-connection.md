# Conexión de Muse con la Fiscal API

FacturaBot consulta la Fiscal API propia de cada usuario. La URL y la API Key se configuran en su bot; este documento solo muestra el contrato compartido.

Antes de enviar una solicitud, el agente busca el perfil del usuario y alias correctos en la memoria temporal de la sesión. Si lo encuentra completo, lo reutiliza sin otra petición. Si falta o el usuario pide actualizarlo, consulta la API una vez y conserva `data` solo en esa sesión.

## Solicitud

Envía una petición HTTP `POST` a `YOUR_ENDPOINT`, con `Content-Type: application/json` y este cuerpo:

```json
{
  "action": "getFiscalProfile",
  "alias": "YOUR_ALIAS",
  "apiKey": "YOUR_API_KEY"
}
```

La credencial debe incorporarse desde la bóveda de Muse durante la ejecución. El alias corresponde al perfil fiscal solicitado para la factura actual.

## Respuesta

Una respuesta con `ok: true` contiene `data` con `alias`, `tipo_persona`, `rfc`, `nombre_razon_social`, `regimen_fiscal`, `codigo_postal`, `uso_cfdi_default` y `email`. Consulta [el contrato compartido](../../shared/api-contract.md) para ver la estructura completa.

Si `ok` es `false`, detén el flujo y comunica el error sin inventar datos. Los casos posibles se enumeran en [códigos de error](../../shared/error-codes.md). Una clave caducada o revocada se sustituye desde el dashboard fiscal del usuario y la bóveda de Muse.

Google Apps Script puede devolver una redirección temporal al responder con JSON. El cliente HTTP de la integración debe recuperar el resultado mediante `GET` a la dirección temporal indicada en la respuesta; no debe volver a enviar el `POST` a esa dirección.

Las skills deben consumir el perfil fiscal obtenido para la operación actual, sin almacenar datos fiscales particulares ni incorporar direcciones de implementaciones ajenas.
