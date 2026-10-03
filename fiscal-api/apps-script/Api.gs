/**
 * Endpoint de consulta fiscal.
 */

function handleApiRequest_(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse_({
        ok: false,
        error: 'empty_request'
      });
    }

    let body;

    try {
      body = JSON.parse(e.postData.contents);
    } catch (error) {
      return jsonResponse_({
        ok: false,
        error: 'invalid_json'
      });
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return jsonResponse_({
        ok: false,
        error: 'invalid_json'
      });
    }

    const action = String(body.action || '').trim();
    const bodyApiKey = String(body.apiKey || '').trim();
    const queryApiKey = String(
      e.parameter && e.parameter.apiKey || ''
    ).trim();
    const alias = normalizeAlias_(body.alias || '');

    if (bodyApiKey && queryApiKey && bodyApiKey !== queryApiKey) {
      return jsonResponse_({
        ok: false,
        error: 'conflicting_api_keys'
      });
    }

    const apiKey = queryApiKey || bodyApiKey;

    if (!action) {
      return jsonResponse_({
        ok: false,
        error: 'missing_action'
      });
    }

    const auth = validateApiKey_(apiKey);

    if (!auth.ok) {
      writeAudit_(
        '',
        action,
        alias,
        auth.error
      );

      return jsonResponse_({
        ok: false,
        error: auth.error
      });
    }

    if (action === 'getFiscalProfile') {
      if (!alias) {
        writeAudit_(
          auth.apiKey.id,
          action,
          '',
          'ERROR'
        );

        return jsonResponse_({
          ok: false,
          error: 'missing_alias'
        });
      }

      const profile = getProfileByAlias_(alias);

      if (!profile) {
        writeAudit_(
          auth.apiKey.id,
          action,
          alias,
          'NOT_FOUND'
        );

        return jsonResponse_({
          ok: false,
          error: 'profile_not_found'
        });
      }

      writeAudit_(
        auth.apiKey.id,
        action,
        alias,
        'SUCCESS'
      );

      return jsonResponse_({
        ok: true,
        data: {
          alias: profile.alias,
          tipo_persona: profile.tipo_persona,
          rfc: profile.rfc,
          nombre_razon_social: profile.nombre_razon_social,
          regimen_fiscal: profile.regimen_fiscal,
          codigo_postal: profile.codigo_postal,
          uso_cfdi_default: profile.uso_cfdi_default,
          email: profile.email
        }
      });
    }

    writeAudit_(
      auth.apiKey.id,
      action,
      alias,
      'ERROR'
    );

    return jsonResponse_({
      ok: false,
      error: 'unknown_action'
    });

  } catch (error) {
    console.error(error);

    return jsonResponse_({
      ok: false,
      error: 'internal_error',
      message: error.message
    });
  }
}

function jsonResponse_(object) {
  return ContentService
    .createTextOutput(
      JSON.stringify(object)
    )
    .setMimeType(
      ContentService.MimeType.JSON
    );
}
