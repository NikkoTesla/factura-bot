/**
 * Administración de perfiles fiscales.
 */

function listProfiles() {
  const sheet = getSheet_(APP.SHEETS.PROFILES);

  if (sheet.getLastRow() < 2) {
    return [];
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const activeIndex = headers.indexOf('activo');

  return data
    .slice(1)
    .filter(row => {
      const id = String(row[0] || '').trim();

      if (!id || id.includes('ejemplo')) {
        return false;
      }

      if (activeIndex === -1) {
        return true;
      }

      return toBool_(row[activeIndex]);
    })
    .map(row => rowToObject_(headers, row));
}

function createProfile(data) {
  validateProfileData_(data);

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const normalizedAlias = normalizeAlias_(data.alias);

    if (getProfileByAlias_(normalizedAlias)) {
      throw new Error(
        'Ya existe un perfil activo con el alias "' +
        normalizedAlias +
        '".'
      );
    }

    const now = new Date();
    const id = 'fp_' + Utilities.getUuid();

    appendDataRow_(APP.SHEETS.PROFILES, [
      id,
      normalizedAlias,
      String(data.tipo_persona || '').toLowerCase(),
      String(data.rfc || '').trim().toUpperCase(),
      String(data.nombre_razon_social || '').trim(),
      String(data.regimen_fiscal || '').trim(),
      String(data.codigo_postal || '').trim(),
      String(data.uso_cfdi_default || '').trim().toUpperCase(),
      String(data.email || '').trim(),
      true,
      now,
      now
    ]);

    return {
      ok: true,
      id: id
    };

  } finally {
    lock.releaseLock();
  }
}

function updateProfile(id, data) {
  validateProfileData_(data);

  const sheet = getSheet_(APP.SHEETS.PROFILES);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const normalizedAlias = normalizeAlias_(data.alias);

  const aliasIndex = headers.indexOf('alias');
  const activeIndex = headers.indexOf('activo');
  const createdAtIndex = headers.indexOf('created_at');

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) !== String(id)) {
      continue;
    }

    for (let j = 1; j < values.length; j++) {
      if (j === i) {
        continue;
      }

      const sameAlias =
        normalizeAlias_(values[j][aliasIndex]) === normalizedAlias;

      const otherIsActive =
        activeIndex === -1 || toBool_(values[j][activeIndex]);

      if (sameAlias && otherIsActive) {
        throw new Error(
          'Ya existe otro perfil activo con el alias "' +
          normalizedAlias +
          '".'
        );
      }
    }

    const createdAt =
      createdAtIndex !== -1 && values[i][createdAtIndex]
        ? values[i][createdAtIndex]
        : new Date();

    sheet
      .getRange(i + 1, 2, 1, 11)
      .setValues([[
        normalizedAlias,
        String(data.tipo_persona || '').toLowerCase(),
        String(data.rfc || '').trim().toUpperCase(),
        String(data.nombre_razon_social || '').trim(),
        String(data.regimen_fiscal || '').trim(),
        String(data.codigo_postal || '').trim(),
        String(data.uso_cfdi_default || '').trim().toUpperCase(),
        String(data.email || '').trim(),
        true,
        createdAt,
        new Date()
      ]]);

    return { ok: true };
  }

  throw new Error('Perfil no encontrado.');
}

function deactivateProfile(id) {
  const sheet = getSheet_(APP.SHEETS.PROFILES);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];

  const activeIndex = headers.indexOf('activo');
  const updatedAtIndex = headers.indexOf('updated_at');

  if (activeIndex === -1 || updatedAtIndex === -1) {
    throw new Error('La hoja FiscalProfiles no tiene el formato esperado.');
  }

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(id)) {
      sheet
        .getRange(i + 1, activeIndex + 1)
        .setValue(false);

      sheet
        .getRange(i + 1, updatedAtIndex + 1)
        .setValue(new Date());

      return { ok: true };
    }
  }

  throw new Error('Perfil no encontrado.');
}

function getProfileByAlias_(alias) {
  const sheet = getSheet_(APP.SHEETS.PROFILES);

  if (sheet.getLastRow() < 2) {
    return null;
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const aliasIndex = headers.indexOf('alias');
  const activeIndex = headers.indexOf('activo');
  const normalizedAlias = normalizeAlias_(alias);

  if (aliasIndex === -1 || activeIndex === -1) {
    throw new Error('La hoja FiscalProfiles no tiene el formato esperado.');
  }

  for (let i = 1; i < data.length; i++) {
    const row = data[i];

    if (
      normalizeAlias_(row[aliasIndex]) === normalizedAlias &&
      toBool_(row[activeIndex])
    ) {
      return rowToObject_(headers, row);
    }
  }

  return null;
}

function validateProfileData_(data) {
  if (!data) {
    throw new Error('Datos de perfil requeridos.');
  }

  if (!String(data.alias || '').trim()) {
    throw new Error('El alias es obligatorio.');
  }

  if (!String(data.rfc || '').trim()) {
    throw new Error('El RFC es obligatorio.');
  }

  if (!String(data.nombre_razon_social || '').trim()) {
    throw new Error('El nombre o razón social es obligatorio.');
  }

  const type = String(data.tipo_persona || '').toLowerCase();

  if (!['fisica', 'moral'].includes(type)) {
    throw new Error(
      'tipo_persona debe ser "fisica" o "moral".'
    );
  }
}
