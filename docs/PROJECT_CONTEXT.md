# FacturaBot — Project Context

## Visión

FacturaBot es un agente de IA de facturación que permanece disponible **24/7 en la nube**.

Su objetivo es permitir que un usuario solicite una factura de forma conversacional mientras el agente:

1. identifica el proveedor;
2. selecciona la skill correcta;
3. obtiene los datos fiscales de la memoria temporal de la sesión o, si faltan, desde Fiscal API;
4. ejecuta la automatización de facturación;
5. devuelve el resultado al usuario.

FacturaBot debe ser portable entre varias plataformas de agentes.

## Plataformas soportadas

La arquitectura debe contemplar instalación y configuración en:

- muse.ai
- Grok Bot
- OpenAI Dots
- buzz.xyz

La lógica funcional de FacturaBot debe ser común. Las diferencias de configuración deben aislarse por plataforma dentro de `agent/`.

---

## Las tres piezas fundamentales

### 1. El agente

FacturaBot es la capa conversacional y de orquestación.

Responsabilidades:

- recibir solicitudes;
- interpretar intención;
- identificar proveedor;
- solicitar información faltante;
- determinar alias fiscal;
- reutilizar el perfil fiscal del usuario y alias correctos durante la sesión, consultando Fiscal API solo cuando sea necesario;
- invocar la skill correcta;
- manejar errores;
- devolver resultado.

---

### 2. Fiscal API

La Fiscal API evita duplicar datos fiscales dentro de las skills.

Tecnología actual:

- Google Sheets
- Google Apps Script
- HTML dashboard
- Web App

Datos entregados:

- alias;
- tipo de persona;
- RFC;
- nombre o razón social;
- régimen fiscal;
- código postal;
- uso CFDI predeterminado;
- email.

Las credenciales se administran mediante API Keys con expiración y revocación.

---

### 3. Skills por proveedor

Cada proveedor tiene su propia lógica de facturación.

Ejemplos futuros:

- Walmart
- Costco
- Home Depot
- Office Depot
- Sam's Club
- Chedraui
- Liverpool
- otros.

Las skills no deben conocer ni almacenar permanentemente los datos fiscales del usuario.

---

## Flujo conceptual

```text
Usuario
  ↓
FacturaBot
  ↓
Identifica proveedor
  ↓
Busca perfil fiscal en la sesión
  ↓
Si falta, consulta Fiscal API
  ↓
Obtiene perfil fiscal
  ↓
Selecciona skill
  ↓
Ejecuta facturación
  ↓
Entrega resultado
```

---

## Principio de crecimiento

El número de skills crecerá con el tiempo.

Agregar un nuevo proveedor no debe exigir modificar las skills existentes ni duplicar la lógica fiscal.

La integración ideal es:

```text
1 proveedor = 1 skill
```

y:

```text
todos los proveedores → 1 Fiscal API
```
