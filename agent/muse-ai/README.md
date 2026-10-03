# FacturaBot en Muse

Esta carpeta reúne la documentación para configurar FacturaBot como agente de facturación en Muse. La configuración es **por usuario**: cada persona conecta su propia Fiscal API, guarda sus credenciales en su bóveda e instala las skills de los proveedores que necesita.

## Qué hace el agente

FacturaBot recibe un ticket o una solicitud de facturación, identifica el proveedor y el alias fiscal, consulta la Fiscal API del usuario y ejecuta la skill de ese proveedor. Al terminar, comunica el resultado confirmado por el portal de facturación.

La Fiscal API usa Google Sheets y Google Apps Script. El diseño requiere que los perfiles fiscales se consulten durante la operación y no se incorporen a las instrucciones ni a las skills.

## Documentos de esta carpeta

| Archivo | Contenido |
| --- | --- |
| [setup.md](setup.md) | Preparación de la API, configuración del agente e instalación de skills. |
| [system-prompt.md](system-prompt.md) | Instrucciones generales listas para adaptar y pegar en el agente. |
| [api-connection.md](api-connection.md) | Contrato de consulta fiscal y manejo de errores. |
| [secrets.md](secrets.md) | Datos que debe configurar cada usuario y dónde guardarlos. |

## Estado de las skills

El repositorio incluye skills para [Walmart](../../skills/walmart/SKILL.md), [Farmacias Guadalajara](../../skills/farmacia-guadalajara/SKILL.md) y [La Gran Bodega](../../skills/gran-bodega/SKILL.md), además de una [plantilla](../../skills/_template/SKILL.md). Las guías y los scripts usan placeholders o configuración del usuario, no una Fiscal API compartida. La existencia de una skill no garantiza que el portal siga igual ni que se haya probado en la cuenta de cada usuario; valida cada flujo antes de emitir facturas reales.

La conexión de perfiles fiscales usa el contrato común del proyecto. El agente debe buscar primero el alias en la memoria temporal de la sesión y consultar la API solo si el perfil no está disponible o se pide actualizarlo. Los helpers no deben persistir perfiles fiscales en archivos locales.

Para pedir la ampliación del catálogo al agente, el usuario puede decir:

> Instálame más skills para los proveedores de mis tickets que tengan su propio portal de facturación. Usa una skill por proveedor, conéctalas a mi Fiscal API y dime cuáles quedaron listas.

Si se necesita un proveedor concreto:

> Instálame una skill para facturar tickets de **NOMBRE_DEL_PROVEEDOR** en su portal de facturación.

Consulta [la arquitectura del proyecto](../../docs/ARCHITECTURE.md) y [las reglas de las skills](../../skills/README.md).
