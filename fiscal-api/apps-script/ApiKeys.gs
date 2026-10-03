/**
 * Administración y validación de API Keys.
 */

function createApiKey(data) {
  if (!data) {
    throw new Error('Datos requeridos.');
  }

  const name = String(data.nombre || '').trim();
  const days = Number(data.expirationDays);

  if (!name) {
    throw new Error('Debes indicar un nombre para la API Key.');
  }

  if (!APP.VALID_EXPIRATION_DAYS.includes(days)) {
    throw new Error('La vigencia debe ser de 1, 30 o 90 días.');
  }

  const rawKey = generateApiKey_();
  const encodedKey = encodeApiKey_(rawKey);

  const createdAt = new Date();
  const expiresAt = new Date(
    createdAt.getTime() +
    days * 24 * 60 * 60 * 1000
  );

  const id = 'key_' + Utilities.getUuid();
  const prefix = rawKey.substring(0, 12);

  appendDataRow_(APP.SHEETS.API_KEYS, [
    id,
    name,
    prefix,
    encodedKey,
    createdAt,
    expiresAt,
    '',
    '',
    true
  ]);

  return {
    ok: true,
    apiKey: rawKey,
    id: id,
    nombre: name,
    prefix: prefix,
    expiresAt: expiresAt.toISOString()
  };
}

function listApiKeys() {
  const sheet = getSheet_(APP.SHEETS.API_KEYS);

  if (sheet.getLastRow() < 2) {
    return [];
  }

  const data = sheet.getDataRange().getValues();

  if (!data || data.length < 2) {
    return [];
  }

  const headers = data[0];
  const apiKeyIndex = headers.indexOf('api_key');

  if (apiKeyIndex === -1) {
    throw new Error(
      'No existe la columna "api_key" en la hoja ApiKeys.'
    );
  }

  return data
    .slice(1)
    .filter(row => {
      const id = String(row[0] || '').trim();
      return id && !id.includes('ejemplo');
    })
    .map(row => {
      const object = rowToObject_(headers, row);

      try {
        object.api_key = decodeApiKey_(object.api_key);
      } catch (error) {
        object.api_key = '';
        console.error(
          'No se pudo decodificar API Key:',
          error
        );
      }

      return object;
    });
}

function revokeApiKey(id) {
  const sheet = getSheet_(APP.SHEETS.API_KEYS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const revokedIndex = headers.indexOf('revoked_at');
  const activeIndex = headers.indexOf('active');

  if (revokedIndex === -1 || activeIndex === -1) {
    throw new Error('La hoja ApiKeys no tiene el formato esperado.');
  }

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet
        .getRange(i + 1, revokedIndex + 1)
        .setValue(new Date());

      sheet
        .getRange(i + 1, activeIndex + 1)
        .setValue(false);

      return { ok: true };
    }
  }

  throw new Error('API Key no encontrada.');
}

function validateApiKey_(rawKey) {
  if (!rawKey) {
    return {
      ok: false,
      error: 'missing_api_key'
    };
  }

  rawKey = String(rawKey).trim();

  if (!rawKey.startsWith(APP.API_KEY_PREFIX)) {
    return {
      ok: false,
      error: 'invalid_api_key'
    };
  }

  const requestedEncoded = encodeApiKey_(rawKey);
  const sheet = getSheet_(APP.SHEETS.API_KEYS);
  const data = sheet.getDataRange().getValues();

  if (!data || data.length < 2) {
    return {
      ok: false,
      error: 'invalid_api_key'
    };
  }

  const headers = data[0];

  const apiKeyIndex = headers.indexOf('api_key');
  const expiresIndex = headers.indexOf('expires_at');
  const revokedIndex = headers.indexOf('revoked_at');
  const activeIndex = headers.indexOf('active');
  const lastUsedIndex = headers.indexOf('last_used_at');

  if (apiKeyIndex === -1) {
    throw new Error('No existe la columna api_key.');
  }

  if (expiresIndex === -1) {
    throw new Error('No existe la columna expires_at.');
  }

  if (revokedIndex === -1) {
    throw new Error('No existe la columna revoked_at.');
  }

  if (activeIndex === -1) {
    throw new Error('No existe la columna active.');
  }

  if (lastUsedIndex === -1) {
    throw new Error('No existe la columna last_used_at.');
  }

  for (let i = 1; i < data.length; i++) {
    if (
      String(data[i][apiKeyIndex] || '') !== requestedEncoded
    ) {
      continue;
    }

    const record = rowToObject_(headers, data[i]);

    if (!toBool_(data[i][activeIndex])) {
      return {
        ok: false,
        error: 'revoked_api_key'
      };
    }

    if (data[i][revokedIndex]) {
      return {
        ok: false,
        error: 'revoked_api_key'
      };
    }

    const expiresAt = new Date(data[i][expiresIndex]);

    if (
      isNaN(expiresAt.getTime()) ||
      expiresAt.getTime() <= Date.now()
    ) {
      return {
        ok: false,
        error: 'expired_api_key'
      };
    }

    if (!checkRateLimit_(record.id)) {
      return {
        ok: false,
        error: 'rate_limit_exceeded'
      };
    }

    sheet
      .getRange(i + 1, lastUsedIndex + 1)
      .setValue(new Date());

    delete record.api_key;

    return {
      ok: true,
      apiKey: record
    };
  }

  return {
    ok: false,
    error: 'invalid_api_key'
  };
}
