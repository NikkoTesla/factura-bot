---
name: farmacias-guadalajara-invoice-from-receipt
description: "Factura uno o varios tickets de Farmacias Guadalajara a partir de alias y fotos de recibos, consultando los datos fiscales del alias mediante la API configurada."
---

# Facturación Farmacias Guadalajara por alias

Activa esta skill cuando el usuario indique un alias, adjunte una o más fotos de tickets y pida facturarlos. El perfil fiscal se consulta mediante la Fiscal API propia del usuario solo si no está disponible en la memoria de la sesión. Si el portal exige un dato que la API no entrega, solicítalo al usuario; no lo inventes.

## Entradas y privacidad

- Alias escrito por el usuario; respétalo salvo quitar espacios accidentales al inicio o al final.
- Una o más fotos o scans de tickets de Farmacias Guadalajara.
- La URL de la Web App `/exec` y la API key deben configurarse en el entorno seguro del agente como `FISCAL_API_ENDPOINT` y `FISCAL_API_KEY`. Nunca pidas que peguen la clave en el chat ni la escribas en esta skill o en mensajes de estado.

Trata alias, fotografías, folios, RFC, domicilios, nombres y correos como datos sensibles. No repitas esos valores en el resumen final.

## Consulta fiscal obligatoria

Antes de llamar la API, busca el perfil completo del mismo usuario y alias exacto en la memoria temporal de la sesión. Reutilízalo si está disponible. Solo si falta o el usuario pide actualizarlo, consulta la Fiscal API una vez. En Muse, usa la conexión HTTP configurada con la API Key de la bóveda como Query Param `apiKey`. En otros entornos puedes usar `scripts/fetch_fiscal_profile.py`; el helper requiere Python 3 y toma `FISCAL_API_ENDPOINT`, `FISCAL_API_KEY` y el alias como argumento. Captura la redirección temporal de Apps Script y hace un `GET` a `Location` para recoger la respuesta; no reenvía el `POST`.

En Muse, el cuerpo JSON sigue el contrato compartido:

```json
{
  "action": "getFiscalProfile",
  "alias": "<alias recibido>"
}
```

El helper de Python sigue enviando `apiKey` en el cuerpo por compatibilidad. Nunca escribas la clave real en la skill ni en una URL guardada.

Acepta la respuesta solo si `ok` es `true`, `data.alias` coincide con el alias normalizado por la API (minúsculas, espacios convertidos en guiones) y el perfil contiene los campos de la API: `rfc`, `nombre_razon_social`, `regimen_fiscal`, `codigo_postal`, `uso_cfdi_default` y `email`. Esta API no proporciona domicilio completo ni método de pago; si el portal los requiere, pídelos al usuario antes de continuar. Mapea los nombres de la API a los campos equivalentes del portal sin alterar su significado.

Si falta configuración, la API devuelve error, el alias no existe o falta un dato requerido por el portal, detén el proceso y explica qué debe corregirse. No uses datos de otro alias ni valores de demostración. Conserva el perfil únicamente en memoria de esta sesión para las facturas siguientes; no lo escribas en disco ni en memoria persistente.

## Flujo por ticket

Procesa cada foto como un ticket independiente y conserva la relación entre sus datos. Si todas usan el mismo alias, reutiliza el perfil fiscal ya validado, pero no mezcles folios entre recibos.

1. Abre cada foto en Preview u otro visor. Confirma que es un ticket de Farmacias Guadalajara y extrae exactamente `Folio Factura`, `Caja`, fecha de compra y `No. Ticket`. Si existe un QR que abre una URL con `folio`, `caja`, `ticket`, `fecha` y `tienda`, usa esa URL después de verificarla. No confundas esos valores con producto, tarjeta, autorización, hora o total.
2. Abre o enfoca el portal oficial `https://www.movil.farmaciasguadalajara.com/facturacion/`. Antes de capturar información fiscal, verifica el dominio y que la página muestre la facturación de Farmacias Guadalajara. Usa controles accesibles y textos visibles, no coordenadas fijas.
3. Si el QR ya precargó el ticket, comprueba que folio, caja, fecha y ticket coincidan con la foto. Si no, captura esos campos manualmente. Selecciona `He leído y acepto la Política de Privacidad`, luego `Validar Folio`. Ante una confirmación, selecciona `SI` solo si los identificadores siguen coincidiendo.
4. En `Datos de facturación`, mapea RFC (`rfc`), código postal (`codigo_postal`), nombre o razón social (`nombre_razon_social`), régimen (`regimen_fiscal`) y uso CFDI (`uso_cfdi_default`) desde el perfil. Esta API no entrega domicilio completo ni método de pago: si aparecen como obligatorios, solicítalos al usuario antes de continuar. Elige opciones con coincidencia exacta o normalizada únicamente por mayúsculas, espacios y acentos; si no existe una opción equivalente, detente.
5. Cuando exista `Quiero recibir la factura por correo`, selecciónalo y usa `email` en `Correo electrónico` y `Confirma tu correo electrónico`. Verifica que ambos coincidan. No solicites otro correo al usuario salvo que la API no lo entregue.
6. Antes de `Obtener Factura`, revisa que la identidad visible corresponda al perfil consultado y que el ticket corresponda a la foto. Selecciona `Obtener Factura`; en `¿Está seguro que quiere facturar?`, selecciona `Aceptar` solo para ese ticket.
7. Espera a que termine la carga y revisa cualquier alerta o mensaje posterior. Confirma una señal explícita de éxito o un identificador de factura. No afirmes que se descargó un PDF/XML ni que se entregó el correo si el portal no lo muestra; si solo informa que el envío por correo puede tardar, comunícalo como estado pendiente.

## Reglas de detención

- Si falta alias, foto, merchant, identificador de ticket o perfil fiscal válido, pide únicamente lo que falta.
- Si el portal, dominio, campos o flujo cambian materialmente, detente antes de enviar información personal o fiscal.
- Si la API devuelve un perfil ambiguo, un ticket no coincide, el folio es rechazado o la confirmación no es clara, no adivines ni reintentes repetidamente.
- Si un ticket falla, conserva el resultado de los demás y reporta cada ticket como completado, bloqueado o pendiente sin revelar datos fiscales.
