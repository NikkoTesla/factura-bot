/**
 * AuditLog registra únicamente consumo de la API.
 */

function writeAudit_(apiKeyId, action, alias, result) {
  try {
    appendDataRow_(APP.SHEETS.AUDIT, [
      new Date(),
      apiKeyId || '',
      action || '',
      alias || '',
      result || ''
    ]);
  } catch (error) {
    console.error(
      'No se pudo escribir AuditLog:',
      error
    );
  }
}

function listAuditLog(limit) {
  const sheet = getSheet_(APP.SHEETS.AUDIT);

  if (sheet.getLastRow() < 2) {
    return [];
  }

  const data = sheet.getDataRange().getValues();

  if (!data || data.length < 2) {
    return [];
  }

  const headers = data[0];

  let records = data
    .slice(1)
    .filter(
      row => row.some(
        cell => cell !== '' && cell !== null
      )
    )
    .map(
      row => rowToObject_(headers, row)
    );

  records.reverse();

  return records.slice(
    0,
    Number(limit) || 30
  );
}
