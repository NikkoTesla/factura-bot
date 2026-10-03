# Skills de FacturaBot

Cada proveedor debe tener una skill independiente.

Usa `skills/_template/` como base para crear nuevos proveedores.

Las skills contienen lógica de facturación, no datos fiscales del usuario.

Cada skill nueva debe documentar qué campos extrae por OCR del ticket, cómo los valida y en qué campos del portal los coloca. Antes de consultar Fiscal API, el agente busca el perfil del usuario y alias correctos en la memoria temporal de la sesión; solo consulta la API si falta o debe actualizarse. Consulta la [plantilla](./_template/SKILL.md) para el flujo completo.
