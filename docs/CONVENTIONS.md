# FacturaBot — Convenciones

## Nombres de directorios

Usar `kebab-case`.

Ejemplos:

```text
home-depot
office-depot
sams-club
```

## Nombres de plataforma

Usar:

```text
muse-ai
grok-bot
openai-dots
buzz-xyz
```

## Skills

Cada skill debe tener como mínimo:

```text
provider-name/
└── SKILL.md
```

Agregar `README.md`, `examples/` o `assets/` solo si aportan documentación o recursos necesarios para ese proveedor.

## Seguridad

Nunca versionar:

- API Keys reales;
- contraseñas;
- tokens;
- cookies;
- archivos de sesión;
- credenciales;
- secretos;
- datos fiscales reales de usuarios.

Usar placeholders:

```text
YOUR_API_KEY
YOUR_ENDPOINT
YOUR_ALIAS
YOUR_SECRET
```

## Documentación

Si se modifica:

- la arquitectura → actualizar `docs/ARCHITECTURE.md`;
- el contrato API → actualizar documentación y ejemplos;
- una convención → actualizar este archivo;
- la versión → actualizar README, roadmap y release notes cuando corresponda.

## Versionado

Usar versionado semántico cuando aplique:

```text
MAJOR.MINOR.PATCH
```

Ejemplo:

```text
1.0.0
1.1.0
1.1.1
2.0.0
```
