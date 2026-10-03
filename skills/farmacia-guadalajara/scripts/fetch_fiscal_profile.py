#!/usr/bin/env python3
"""Fetch a profile using the public FacturaBot Fiscal API contract."""

import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from urllib.parse import urlsplit


PROFILE_FIELDS = (
    "alias",
    "tipo_persona",
    "rfc",
    "nombre_razon_social",
    "regimen_fiscal",
    "codigo_postal",
    "uso_cfdi_default",
    "email",
)
MAX_RESPONSE_BYTES = 1_000_000


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def validate_endpoint(endpoint: str) -> str:
    parsed = urlsplit(endpoint)
    if (
        parsed.scheme != "https"
        or parsed.hostname != "script.google.com"
        or not parsed.path.startswith("/macros/s/")
        or not parsed.path.endswith("/exec")
        or parsed.query
        or parsed.fragment
    ):
        raise ValueError("FISCAL_API_ENDPOINT debe ser la URL HTTPS /macros/s/.../exec de tu Web App")
    return endpoint


def read_json(url: str) -> dict:
    request = urllib.request.Request(url, headers={"Accept": "application/json"})
    with urllib.request.urlopen(request, timeout=30) as response:
        raw = response.read(MAX_RESPONSE_BYTES + 1)
    if len(raw) > MAX_RESPONSE_BYTES:
        raise ValueError("La respuesta de la API excede el tamaño permitido")
    payload = json.loads(raw.decode("utf-8"))
    if not isinstance(payload, dict):
        raise ValueError("La API devolvió una respuesta inválida")
    return payload


def fiscal_lookup(endpoint: str, api_key: str, alias: str) -> dict:
    body = json.dumps(
        {"action": "getFiscalProfile", "alias": alias, "apiKey": api_key}
    ).encode("utf-8")
    request = urllib.request.Request(
        endpoint,
        data=body,
        headers={"Content-Type": "application/json", "Accept": "application/json"},
        method="POST",
    )
    opener = urllib.request.build_opener(NoRedirect)
    try:
        with opener.open(request, timeout=30) as response:
            payload = json.load(response)
    except urllib.error.HTTPError as exc:
        if exc.code != 302:
            raise
        location = exc.headers.get("Location")
        if not location:
            raise ValueError("Apps Script devolvió una redirección sin Location") from exc
        redirected = urlsplit(location)
        if redirected.scheme != "https" or redirected.hostname != "script.googleusercontent.com":
            raise ValueError("Apps Script devolvió un destino de redirección no esperado") from exc
        payload = read_json(location)

    if not isinstance(payload, dict) or payload.get("ok") is not True:
        raise ValueError("La Fiscal API rechazó la consulta o devolvió una respuesta inválida")
    profile = payload.get("data")
    expected_alias = "-".join(alias.strip().lower().split())
    if not isinstance(profile, dict) or profile.get("alias") != expected_alias:
        raise ValueError("La respuesta no corresponde al alias solicitado")
    missing = [field for field in PROFILE_FIELDS if not str(profile.get(field, "")).strip()]
    if missing:
        raise ValueError("El perfil fiscal no contiene todos los campos esperados por el contrato")
    return profile


def main() -> int:
    parser = argparse.ArgumentParser(description="Fetch a FacturaBot fiscal profile by alias")
    parser.add_argument("alias", help="Exact alias selected by the user")
    args = parser.parse_args()
    alias = args.alias.strip()
    endpoint = os.environ.get("FISCAL_API_ENDPOINT", "").strip()
    api_key = os.environ.get("FISCAL_API_KEY", "").strip()
    if not alias:
        print("Alias vacío", file=sys.stderr)
        return 2
    if not endpoint or not api_key:
        print("Configura FISCAL_API_ENDPOINT y FISCAL_API_KEY en el entorno seguro", file=sys.stderr)
        return 2
    try:
        profile = fiscal_lookup(validate_endpoint(endpoint), api_key, alias)
    except urllib.error.HTTPError as exc:
        print(f"La Fiscal API devolvió HTTP {exc.code}", file=sys.stderr)
        return 2
    except (urllib.error.URLError, TimeoutError) as exc:
        print(f"No se pudo contactar la Fiscal API: {exc}", file=sys.stderr)
        return 2
    except (ValueError, json.JSONDecodeError) as exc:
        print(f"No se pudo validar el perfil fiscal: {exc}", file=sys.stderr)
        return 2
    print(json.dumps({"ok": True, "data": profile}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
