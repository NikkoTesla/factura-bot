# Conexión de Muse con la Fiscal API

FacturaBot consulta la Fiscal API propia de cada usuario. La URL y la API Key se configuran en su bot; este documento solo muestra el contrato compartido.

Antes de enviar una solicitud, el agente busca el perfil del usuario y alias correctos en la memoria temporal de la sesión. Si lo encuentra completo, lo reutiliza sin otra petición. Si falta o el usuario pide actualizarlo, consulta la API una vez y conserva `data` solo en esa sesión.

## Solicitud

En la conexión HTTP de Muse, usa el método `POST` y la URL base `YOUR_ENDPOINT` (la Web App `/exec` de tu instalación). Configura un **Query Param** llamado exactamente `apiKey`, cuyo valor se obtiene de la API Key guardada en la bóveda. No escribas la clave real en la URL ni en el prompt. Usa `Content-Type: application/json` y este cuerpo:

```json
{
  "action": "getFiscalProfile",
  "alias": "YOUR_ALIAS"
}
```

La solicitud resultante tiene la forma `POST YOUR_ENDPOINT?apiKey=YOUR_API_KEY`, donde `YOUR_API_KEY` es un marcador para el valor que Muse agrega desde la bóveda durante la ejecución. El alias corresponde al perfil fiscal solicitado para la factura actual. La API también acepta `apiKey` en el cuerpo para clientes antiguos; si se envía en ambos lugares, los valores deben coincidir.

## Respuesta

Una respuesta con `ok: true` contiene `data` con `alias`, `tipo_persona`, `rfc`, `nombre_razon_social`, `regimen_fiscal`, `codigo_postal`, `uso_cfdi_default` y `email`. Consulta [el contrato compartido](../../shared/api-contract.md) para ver la estructura completa.

Si `ok` es `false`, detén el flujo y comunica el error sin inventar datos. Los casos posibles se enumeran en [códigos de error](../../shared/error-codes.md). Una clave caducada o revocada se sustituye desde el dashboard fiscal del usuario y la bóveda de Muse.

Google Apps Script puede devolver una redirección temporal al responder con JSON. El cliente HTTP de la integración debe recuperar el resultado mediante `GET` a la dirección temporal indicada en la respuesta; no debe volver a enviar el `POST` ni agregar la API Key a esa dirección.

Las skills deben consumir el perfil fiscal obtenido para la operación actual, sin almacenar datos fiscales particulares ni incorporar direcciones de implementaciones ajenas.
