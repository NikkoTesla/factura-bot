# Configuración de FacturaBot en Muse

Esta guía describe la instalación para una cuenta de usuario. Usa valores propios en el bot: `YOUR_ENDPOINT`, `YOUR_API_KEY` y `YOUR_ALIAS` son marcadores de posición, no datos para copiar literalmente.

## Antes de empezar

- Una cuenta de Muse con acceso a las herramientas necesarias para cargar instrucciones, utilizar skills, navegar por portales y guardar credenciales de forma segura.
- Una [Fiscal API](../../fiscal-api/README.md) propia, publicada desde Google Apps Script, con al menos un perfil fiscal y una API Key vigente.
- Un ticket de prueba legible y una skill compatible con su proveedor.

La interfaz y las funciones disponibles de Muse pueden variar según la cuenta. Comprueba que la cuenta permita la ejecución de la skill y el acceso seguro a la Fiscal API antes de intentar emitir una factura.

## 1. Preparar la Fiscal API propia

1. Instala la plantilla de Google Sheets y el proyecto de Google Apps Script siguiendo el [README principal](../../README.md#configuración).
2. Inicializa el sistema desde el menú **API Fiscal → Inicializar sistema** de la hoja.
3. En el dashboard, crea los perfiles fiscales que usarás, cada uno con su alias, y genera una API Key.
4. Publica la Web App y conserva la URL de tu implementación. Esa URL será `YOUR_ENDPOINT` en los ejemplos.

Cada usuario debe operar su propia hoja, implementación y API Key. No copies direcciones o perfiles de otra instalación.

## 2. Crear o configurar FacturaBot

1. Crea un agente en Muse con el nombre **FacturaBot**, o usa un agente existente dedicado a facturación.
2. Adapta y pega las instrucciones de [system-prompt.md](system-prompt.md). Mantén la lógica general en el agente y los pasos del portal en la skill del proveedor.
3. Configura la conexión a tu Fiscal API conforme a [api-connection.md](api-connection.md). El agente debe poder enviar una petición `getFiscalProfile` usando el alias solicitado.
4. Guarda la API Key en la bóveda o mecanismo de credenciales disponible en tu cuenta de Muse. Sigue [secrets.md](secrets.md); no la pegues en las instrucciones del agente.

## 3. Instalar la primera skill

1. Identifica el proveedor del ticket y revisa si existe una skill en [`skills/`](../../skills/): Walmart, Farmacias Guadalajara o La Gran Bodega.
2. Carga la carpeta de la skill mediante el mecanismo disponible en Muse, conservando su `SKILL.md` y los archivos que utilice.
3. Configura el endpoint y la API Key propios de tu instalación según [api-connection.md](api-connection.md) y [secrets.md](secrets.md). Las skills del repositorio usan el contrato compartido; verifica los requisitos que el portal pida además del perfil fiscal.
4. Confirma que el agente selecciona esa skill solamente para los proveedores que cubre. Los detalles del ticket, los campos del portal y las opciones de entrega pertenecen a la skill, no al prompt general.

## 4. Comprobar la configuración

1. Pide al agente que identifique los datos faltantes de un ticket de prueba sin emitir la factura.
2. Verifica que consulte el alias correcto y que la Fiscal API responda con `ok: true`.
3. Revisa que la skill encuentre el portal del proveedor y valide los datos antes de enviar formularios.
4. Comprueba la confirmación real del portal y la entrega elegida por el usuario. Si el portal no confirma la emisión, el agente no debe afirmar que la factura quedó generada.

## 5. Ampliar el catálogo de proveedores

Cuando necesites otro proveedor, puedes pedirle a Muse:

> Instálame más skills para los proveedores que tengan su propio portal de facturación. Empieza por **NOMBRE_DEL_PROVEEDOR**, usa la plantilla de FacturaBot y conecta la skill a mi Fiscal API.

Para cada proveedor nuevo, crea o instala una skill independiente basada en [`skills/_template/`](../../skills/_template/). Debe documentar su portal, entradas, validaciones, errores y resultado. No guardes perfiles fiscales en la skill. Si todavía no hay una skill comprobada para un proveedor, el agente debe decirlo y evitar simular que puede emitir esa factura.
