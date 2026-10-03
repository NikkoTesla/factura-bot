# Plantilla de skill por proveedor

Duplica **toda** esta carpeta para crear una skill independiente por proveedor:

```text
skills/_template/ → skills/nombre-del-proveedor/
```

La skill resultante debe conservar `SKILL.md`. Este `README.md` sirve como guía para crearla y puede adaptarse si el proveedor necesita documentación adicional. Sustituye los marcadores en mayúsculas de `SKILL.md`, incluido el nombre de la skill, y documenta el flujo real del portal antes de utilizarla.

## Información que debe definir cada skill

1. **Proveedor y portal:** identifica qué tiendas o formatos cubre la skill y cuál es su portal oficial de facturación.
2. **OCR del ticket:** enumera los datos impresos que el portal exige. Para cada campo del formulario, escribe su etiqueta en el ticket, la regla para extraerlo y cómo comprobarlo. Incluye fecha y total para identificar el comprobante correcto.
3. **Mapeo al formulario:** indica exactamente dónde se pega cada dato obtenido por OCR. Conserva los ceros iniciales y distingue identificadores parecidos.
4. **Perfil fiscal:** antes de consultar Fiscal API, busca el perfil del usuario y alias correctos en la memoria temporal de la sesión. En caso de ausencia, consulta una vez y conserva `data` solo durante esa sesión. Las facturas siguientes reutilizan ese perfil; una solicitud de actualización exige volver a consultarlo.
5. **Flujo y resultado:** documenta pantallas, validaciones, errores y la prueba visible de emisión o entrega.

No guardes perfiles fiscales, API Keys ni tickets reales en la carpeta de la skill. La memoria temporal de sesión es del agente, no un archivo de la skill ni una memoria permanente. Consulta [el contrato fiscal](../../shared/api-contract.md) y [las convenciones](../../docs/CONVENTIONS.md).

Agrega archivos o carpetas auxiliares solo si la integración los necesita y evita incluir tickets reales o datos personales.
