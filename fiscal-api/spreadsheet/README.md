# Plantilla de Google Sheets

El archivo [`API_Fiscal_Personal_Plantilla_Maestra_Nikko_Tesla_v1.0.0.xlsx`](API_Fiscal_Personal_Plantilla_Maestra_Nikko_Tesla_v1.0.0.xlsx) está limpio de perfiles y API Keys de usuario. Importa una copia como **archivo nativo de Google Sheets** antes de vincular el Apps Script.

En Google Drive, abre el archivo Excel con Google Sheets y elige **Archivo → Guardar como Hojas de cálculo de Google**. También puedes crear una hoja nueva y usar **Archivo → Importar** para subir el `.xlsx` y elegir que se cree una hoja nueva. Google documenta ambas rutas en su [guía para trabajar con archivos de Excel en Sheets](https://support.google.com/docs/answer/9331167?hl=es).

No renombres las pestañas ni los encabezados de las cuatro hojas de datos: Apps Script los usa exactamente como aparecen.

| Pestaña | Encabezados |
| --- | --- |
| `FiscalProfiles` | `id`, `alias`, `tipo_persona`, `rfc`, `nombre_razon_social`, `regimen_fiscal`, `codigo_postal`, `uso_cfdi_default`, `email`, `activo`, `created_at`, `updated_at` |
| `ApiKeys` | `id`, `nombre`, `key_prefix`, `api_key`, `created_at`, `expires_at`, `last_used_at`, `revoked_at`, `active` |
| `AuditLog` | `timestamp`, `api_key_id`, `action`, `alias`, `result` |
| `Config` | `key`, `value` |

La pestaña `Acerca de` es informativa. No pegues datos fiscales reales en la plantilla ni subas a GitHub una copia que contenga perfiles o claves.
