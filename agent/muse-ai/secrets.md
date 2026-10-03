# Datos de conexión y secretos en Muse

Cada instalación de FacturaBot usa valores propios. Los nombres siguientes son marcadores de posición para la configuración; no contienen datos de una persona ni de una implementación real.

| Valor | Qué representa | Dónde configurarlo |
| --- | --- | --- |
| `YOUR_ENDPOINT` | URL de la Web App `/exec` de la Fiscal API del usuario. | Conexión o configuración privada del agente. |
| `YOUR_API_KEY` | API Key vigente generada en el dashboard fiscal del usuario. | Bóveda de Muse; inyectarla como Query Param llamado `apiKey` en el `POST` a `YOUR_ENDPOINT`. |
| `YOUR_ALIAS` | Perfil fiscal elegido para una operación. | Solicitud del usuario o parámetro de la operación. |

La API Key real no debe aparecer en el prompt, las skills, ejemplos, registros visibles, respuestas ni archivos versionados. Usa la opción de Query Param de la bóveda para que Muse agregue el valor durante la solicitud. El identificador de la credencial que utilice una skill debe coincidir con el configurado en la cuenta de Muse; una credencial de otra cuenta no sirve para esta instalación.

El alias se decide para cada factura. No fijes un alias personal como valor universal y no reutilices datos de otro perfil si la consulta falla.

Las fotos de tickets y los datos fiscales también son sensibles. Úsalos para completar la operación solicitada y evita reproducirlos innecesariamente en el resumen final.
