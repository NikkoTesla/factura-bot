# Instalar y publicar la Fiscal API en Google Apps Script

Esta carpeta contiene el código que debes copiar a un Apps Script **vinculado a tu copia nativa de Google Sheets**. No se necesita Node.js, `clasp` ni un servidor propio para la instalación manual.

## 1. Crear el proyecto vinculado

1. Importa la plantilla `.xlsx` como una hoja nativa de Google Sheets, siguiendo [la guía de la hoja](../spreadsheet/README.md).
2. En esa hoja, abre **Extensiones → Apps Script**. Esto crea el proyecto vinculado a la hoja, que necesita el código para abrir el dashboard y agregar el menú personalizado. Consulta la documentación de Google sobre [scripts vinculados a hojas](https://developers.google.com/apps-script/guides/bound).
3. En el editor Apps Script, conserva un archivo llamado `Code.gs` y reemplaza su contenido por el de esta carpeta. Usa **+ → Script** para crear cada archivo `.gs` restante y **+ → HTML** para crear cada archivo `.html`, con el nombre exacto indicado en la tabla.
4. En **Configuración del proyecto**, activa la opción para mostrar el archivo de manifiesto `appsscript.json`. Ábrelo y reemplaza su contenido por el archivo de esta carpeta. Guarda el proyecto.

## 2. Archivos que debes copiar

| Archivo en este repositorio | Tipo en Apps Script | Función |
| --- | --- | --- |
| `Code.gs` | Script | Menú de Sheets, dashboard, endpoints `GET` y `POST`, diagnóstico. |
| `Config.gs` | Script | Nombres de pestañas, versión, inicialización y acceso a Sheets. |
| `Profiles.gs` | Script | Crear, actualizar, desactivar y buscar perfiles. |
| `ApiKeys.gs` | Script | Crear, validar y revocar claves. |
| `Api.gs` | Script | Contrato JSON `getFiscalProfile`. |
| `Audit.gs` | Script | Registro de consumo en `AuditLog`. |
| `Security.gs` | Script | Generación de claves, normalización de alias y límite de solicitudes. |
| `Index.html` | HTML | Estructura del dashboard. |
| `Styles.html` | HTML | Estilos del dashboard. |
| `App.html` | HTML | Lógica cliente del dashboard. |
| `appsscript.json` | Manifiesto | Zona horaria y runtime V8. |

No cambies los nombres de archivo, las pestañas ni sus encabezados. El manifiesto actual usa V8 y no declara bibliotecas externas.

## 3. Autorizar e inicializar

1. Regresa a Google Sheets y vuelve a cargar la página.
2. Abre el menú **API Fiscal → Inicializar sistema**. La primera ejecución solicita permisos para trabajar con la hoja vinculada; autorízalos con la cuenta propietaria.
3. Selecciona **API Fiscal → Verificar instalación** y confirma que termina sin errores.
4. Selecciona **API Fiscal → Abrir Dashboard**. Crea un perfil y una API Key de prueba o de uso real. No compartas la clave: el dashboard puede recuperarla y revocarla, así que limita quién puede editar la hoja.

## 4. Publicar la Web App

1. En Apps Script, elige **Implementar → Nueva implementación** y selecciona **Aplicación web**.
2. Para que el agente acceda a la hoja del propietario, la implementación debe ejecutarse como la cuenta que la publica. Elige el alcance de acceso que permita el agente: si no puede iniciar sesión en Google, puede requerir acceso anónimo; en ese caso la API Key de cada solicitud es la barrera de autenticación de la aplicación. Muse puede enviarla como Query Param `apiKey` desde su bóveda; los clientes existentes pueden seguir enviándola en el cuerpo JSON.
3. Selecciona **Implementar**, completa cualquier autorización y copia la URL que termina en `/exec`. Esa URL es privada de la instalación del usuario; guárdala en la configuración privada del bot, no en archivos del repositorio.

Google puede limitar el acceso anónimo por políticas de Workspace o por la configuración de la cuenta. Si esa opción no está disponible, usa una cuenta/configuración compatible con el método de autenticación del agente. Revisa las opciones vigentes de acceso y ejecución en la [documentación oficial de Web Apps](https://developers.google.com/apps-script/guides/web).

## 5. Probar la API

- Abre la URL `/exec` en un navegador. El `GET` debe responder un JSON con `ok: true` e información del servicio.
- Desde el agente, realiza una petición de prueba `getFiscalProfile` con un alias existente y la API Key de esa instalación, de acuerdo con [`shared/api-contract.md`](../../shared/api-contract.md).
- En Muse, configura el endpoint `/exec` como URL base y la credencial de la bóveda como Query Param `apiKey`; deja `action` y `alias` en el cuerpo JSON. No pegues la clave real en una URL guardada.
- Confirma que el resultado tiene `ok: true` y que `data.alias` corresponde al alias consultado. Después revisa que `AuditLog` registre el consumo. No pegues la API Key en prompts, terminales compartidas ni documentos.

Apps Script puede contestar el `POST` con una redirección temporal para recuperar el JSON. El cliente debe leer `Location` y hacer un `GET` a esa dirección; no debe volver a enviar el `POST` allí.

## Alcance y límites

- La API valida claves con vigencia de 1, 30 o 90 días, revocación y límite configurado de 60 solicitudes por minuto por clave. Google también aplica cuotas propias, que pueden cambiar; consulta [cuotas de Apps Script](https://developers.google.com/apps-script/guides/services/quotas).
- El backend está basado en Sheets y Apps Script y se destina a un volumen personal bajo. El agente debe mantener el perfil del alias correcto en la memoria temporal de la sesión y reutilizarlo entre facturas; no consultar por cada factura.
- La clave se puede recuperar desde el dashboard. Mantén restringidos los permisos de edición de la hoja y revoca las claves que ya no uses.
- La implementación ofusca las API Keys mediante una codificación reversible; esto no es cifrado fuerte. Protege el acceso a la hoja, al proyecto Apps Script y a la cuenta Google propietaria como credenciales sensibles. No compartas permisos de edición con quienes solo necesitan usar el bot.
- Una nueva implementación tiene otra URL `/exec`. Después de publicar una versión actualizada, actualiza la implementación y confirma la URL/configuración del agente.

## Resolución de errores

Consulta [`shared/error-codes.md`](../../shared/error-codes.md). En resumen:

- `invalid_api_key`, `expired_api_key` o `revoked_api_key`: genera una clave nueva o renueva la configuración del agente.
- `profile_not_found`: comprueba el alias exacto y que el perfil esté activo.
- `rate_limit_exceeded`: detén los reintentos automáticos y reutiliza el perfil en la sesión.
- `internal_error`: comprueba los encabezados de la hoja, los permisos del proyecto y el registro de ejecuciones de Apps Script.
