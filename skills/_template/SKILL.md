---
name: provider-invoice-from-receipt
description: "Crear o recuperar una factura a partir de la imagen de un ticket y el portal oficial del proveedor configurado."
---

# Facturación de NOMBRE_DEL_PROVEEDOR desde un ticket

## Objetivo y alcance

Usa esta skill cuando el usuario solicite facturar o recuperar una factura de NOMBRE_DEL_PROVEEDOR y proporcione, o pueda proporcionar, una imagen del ticket. Automatiza únicamente el portal y los formatos de tienda que hayas comprobado.

Al crear la skill, cambia `name`, `description` y todos los marcadores de esta plantilla por información real del proveedor. El endpoint de Fiscal API y la credencial pertenecen a la configuración privada de cada usuario; nunca los fijes en esta skill.

- Proveedor y formatos de tienda cubiertos: `PROVEEDOR_Y_FORMATOS`.
- Portal oficial de facturación: `URL_DEL_PORTAL_DEL_PROVEEDOR`.
- Comprobantes aceptados: `TIPOS_DE_TICKET`.
- Límites y plazos conocidos del portal: `LIMITES_Y_PLAZOS`.

## Entradas esperadas

- Imagen o escaneo legible de cada ticket. Si hay varios, identifica el correcto por proveedor, fecha y total antes de avanzar.
- Alias del perfil fiscal al que debe emitirse la factura. Pide aclaración si el usuario no indica a nombre de quién facturar.
- Datos adicionales que el portal realmente exija y que no estén en el ticket ni en el perfil fiscal.
- Método de pago cuando el portal lo pida y la información disponible lo permita verificar.
- Preferencia de entrega, como PDF o correo, cuando el portal ofrezca varias opciones.

Solicita solo lo que falte. Trata imágenes de tickets, RFC, domicilios, correos, identificadores y datos de pago como información sensible. No deduzcas régimen fiscal, uso de CFDI, domicilio ni otro dato fiscal a partir del ticket: esos datos proceden del perfil fiscal autorizado por el usuario.

## 1. Identificar los datos del ticket mediante OCR

**Este es uno de los primeros pasos de cada facturación.** Confirma que la imagen corresponde a NOMBRE_DEL_PROVEEDOR y lee el ticket mediante OCR o inspección visual. Antes de abrir o llenar el formulario, identifica exactamente qué datos impresos exige el portal y completa la siguiente tabla para este proveedor. Agrega o elimina filas según el flujo real; no dejes marcadores en una skill publicada.

| Campo exacto del formulario del portal | Etiqueta o ubicación en el ticket | Regla de extracción y validación | Obligatorio |
| --- | --- | --- | --- |
| `CAMPO_PORTAL_1` | `ETIQUETA_TICKET_1` | `FORMATO_Y_COMPROBACION_1` | Sí/No |
| `CAMPO_PORTAL_2` | `ETIQUETA_TICKET_2` | `FORMATO_Y_COMPROBACION_2` | Sí/No |
| `CAMPO_PORTAL_3` | `ETIQUETA_TICKET_3` | `FORMATO_Y_COMPROBACION_3` | Sí/No |

Además, identifica el nombre o formato de tienda, la fecha y el total para comprobar que se está procesando el ticket correcto. Extrae método de pago, sucursal, caja, número de operación u otros valores solo si el portal los pide. Conserva ceros iniciales, letras y separadores cuando formen parte de un identificador. No confundas números de ticket o transacción con fragmentos de tarjeta, autorizaciones o importes.

Si hay varios tickets, identifica cuál corresponde a la solicitud del usuario. Si el OCR es ilegible, ambiguo o no coincide con el comprobante, pide una imagen más clara o la confirmación del dato; no adivines ni envíes el formulario. Antes de avanzar, compara los valores extraídos con los campos y formatos que muestra el portal.

## 2. Obtener el perfil fiscal sin consultas repetidas

Fiscal API está alojada en Google Sheets y Google Apps Script; sus respuestas pueden ser lentas y el servicio no está pensado para muchas peticiones. **No invoques la API por cada factura.** El agente mantiene el perfil únicamente en la memoria temporal de la sesión activa y la skill lo reutiliza durante esa sesión.

1. Identifica el alias que el usuario eligió para esta factura. Si no está claro, pregúntalo.
2. Busca primero en la memoria de la **sesión actual** un perfil completo asociado a ese mismo usuario y a ese alias exacto. Si existe y el usuario no indicó que cambió sus datos, úsalo sin llamar a Fiscal API.
3. Si falta el perfil de ese alias, está incompleto o el usuario pide actualizarlo, consulta `getFiscalProfile` **una vez** mediante la conexión fiscal configurada para ese usuario. Usa la API Key desde la bóveda, nunca desde esta skill.
4. Si la API responde con `ok: true`, guarda `data` solo en la memoria temporal de la sesión, asociado al usuario y alias correctos. Reutiliza ese perfil para las siguientes facturas de la misma sesión, incluso cuando intervengan otras skills de proveedores.
5. Si la API falla, no inventes datos, no uses el perfil de otro alias y no repitas la petición en bucle. Explica el error y espera una corrección o una solicitud explícita de reintento.

Al cambiar de usuario o al terminar la sesión, no reutilices ese perfil. No escribas datos fiscales en archivos, cachés locales, prompts, ejemplos, logs ni memoria permanente. Consulta [el contrato compartido](../../shared/api-contract.md) para los campos de respuesta.

La conexión fiscal de cada usuario debe enviar un `POST` a su propio `YOUR_ENDPOINT` con `Content-Type: application/json` y el siguiente cuerpo. Los valores mostrados son marcadores de posición:

```json
{
  "action": "getFiscalProfile",
  "alias": "YOUR_ALIAS",
  "apiKey": "YOUR_API_KEY"
}
```

La API Key se incorpora desde la bóveda de la plataforma durante la ejecución. Una respuesta con `ok: true` contiene `data` con el perfil fiscal; si `ok` es `false`, informa el error y detén la facturación. Si Google Apps Script devuelve una redirección temporal para entregar el JSON, recoge la respuesta con `GET` a la dirección indicada; no reenvíes el `POST` a esa redirección.

## 3. Completar el portal del proveedor

Usa las herramientas de interfaz o navegador disponibles para inspeccionar el ticket y el portal. Prefiere controles identificables por su texto, etiqueta o URL frente a coordenadas. Documenta cada pantalla real, sus validaciones y las rutas alternativas del proveedor.

1. Abre el portal oficial comprobado para NOMBRE_DEL_PROVEEDOR. Si ha cambiado o no está disponible, detente y comunícalo. Documenta aquí el flujo: `PASOS_DEL_PORTAL`.
2. Copia cada dato obtenido del OCR en el campo del formulario indicado en la tabla de la sección 1. Usa el perfil fiscal de la sesión para los campos fiscales; no intercambies ambas fuentes.
3. Revisa en pantalla los identificadores del ticket, RFC, nombre legal, código postal, régimen, uso de CFDI, correo y método de pago cuando corresponda. Pide al usuario cualquier decisión necesaria que no pueda deducirse de información verificada.
4. Si hay valores precargados, consérvalos solo después de compararlos con el ticket y el perfil fiscal. Selecciona las opciones de pago y entrega únicamente si corresponden a la solicitud y al flujo real del portal.
5. Envía el formulario solo con datos comprobados. Si el portal muestra una validación, un error o una pantalla inesperada, detente y maneja ese estado según el flujo documentado. No excedas tres intentos de inicio de sesión en portales que requieran acceso.
6. Confirma la emisión o entrega únicamente cuando el portal lo indique de forma visible. No deduzcas éxito por haber completado los campos.

## Verificación y condiciones para detenerse

- Confirma cada cambio de pantalla por URL, texto accesible o contenido visible, no solo por el tiempo transcurrido. Después de enviar un formulario, espera a que termine la carga y revisa errores de validación.
- Si el portal rechaza un identificador del ticket, pide al usuario que lo revise; no pruebes valores inventados repetidamente.
- Si el portal omite una pantalla prevista, continúa solo cuando la siguiente pantalla sea reconocible y los datos necesarios sigan verificados.
- No envíes una factura con RFC, nombre, código postal, correo, selección fiscal o método de pago sin verificar cuando el portal los requiera.
- Si falta la preferencia de entrega, pregunta al usuario antes de elegir PDF, correo u otra opción. Una pantalla que solo ofrece opciones de entrega no demuestra que el archivo se haya generado o enviado.

## Reglas de la skill

- Documenta los campos, validaciones y pasos específicos de NOMBRE_DEL_PROVEEDOR sin depender de otra skill.
- No inventes datos del ticket, datos fiscales, método de pago ni resultados del portal.
- No almacenes datos fiscales particulares dentro de la skill. La memoria temporal de sesión pertenece al agente y se comparte entre skills solo para el usuario y alias correctos.
- Maneja errores y estados inesperados antes de continuar.
- Devuelve un resultado estructurado y evita repetir datos personales o del ticket innecesariamente.

## Resultado esperado

Cuando el portal los proporcione, comunica:

- éxito o error confirmado;
- proveedor;
- folio y UUID fiscal;
- PDF o XML disponible;
- método de entrega y mensaje final.

No declares un folio, UUID, PDF o XML si el portal no lo muestra o entrega.
