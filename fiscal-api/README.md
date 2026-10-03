# Fiscal API Personal para Agentes de IA

La Fiscal API es la fuente de verdad de los perfiles fiscales de **cada usuario**. Usa una hoja de Google Sheets como almacenamiento, Apps Script como backend y un dashboard HTML para administrar perfiles y API Keys. El agente consulta el endpoint Web App de la instalación del propio usuario.

## Instalación

Sigue la [guía completa de instalación y publicación](apps-script/README.md). En resumen: importa la plantilla Excel como un archivo nativo de Google Sheets, crea un proyecto Apps Script vinculado, copia los archivos fuente, inicializa la hoja y publica la Web App.

La plantilla y sus pestañas están descritas en [spreadsheet/README.md](spreadsheet/README.md). El contrato y los errores están en [`../shared/`](../shared/).

## Datos y credenciales

- Cada usuario crea su propia hoja, implementación y perfiles fiscales.
- Nunca subas perfiles, API Keys o la URL de tu implementación al repositorio.
- Guarda la API Key en la bóveda de secretos del agente y configura la URL de tu propio despliegue en ese bot.
- La API no está pensada para consultas de alto volumen. El agente debe reutilizar el perfil fiscal durante la sesión y consultar la API solo si no lo tiene en memoria o el usuario solicita actualizarlo.

La versión actual del Apps Script es **1.0.2**. Acepta la API Key como Query Param `apiKey` para integraciones que la inyectan desde una bóveda, como Muse, y conserva el envío en el cuerpo JSON para clientes existentes. Incluye la corrección de serialización de fechas del dashboard introducida en v1.0.1.
