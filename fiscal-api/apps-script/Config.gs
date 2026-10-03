/**
 * Configuración y utilidades compartidas.
 */

const APP = Object.freeze({
  NAME: 'API Fiscal Personal para Agentes de IA',
  VERSION: '1.0.1',
  API_KEY_PREFIX: 'api_',
  MAX_REQUESTS_PER_MINUTE: 60,
  VALID_EXPIRATION_DAYS: Object.freeze([1, 30, 90]),
  SHEETS: Object.freeze({
    PROFILES: 'FiscalProfiles',
    API_KEYS: 'ApiKeys',
    AUDIT: 'AuditLog',
    CONFIG: 'Config'
  })
});

function initializeSystem() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  if (!spreadsheet) {
    throw new Error('No se encontró la hoja de cálculo activa.');
  }

  const requiredSheets = [
    APP.SHEETS.PROFILES,
    APP.SHEETS.API_KEYS,
    APP.SHEETS.AUDIT,
    APP.SHEETS.CONFIG
  ];

  const missingSheets = requiredSheets.filter(
    name => !spreadsheet.getSheetByName(name)
  );

  if (missingSheets.length) {
    SpreadsheetApp.getUi().alert(
      'No se pudo inicializar el sistema.\n\n' +
      'Faltan estas hojas:\n' +
      missingSheets.join('\n')
    );
    return;
  }

  PropertiesService
    .getScriptProperties()
    .setProperty(
      'SPREADSHEET_ID',
      spreadsheet.getId()
    );

  setConfigValue_('APP_NAME', APP.NAME);
  setConfigValue_('APP_VERSION', APP.VERSION);
  setConfigValue_('INSTALLED', true);
  setConfigValue_('API_ENABLED', true);
  setConfigValue_('MAX_REQUESTS_MIN', APP.MAX_REQUESTS_PER_MINUTE);
  setConfigValue_('DEFAULT_KEY_EXPIRY_DAYS', 30);

  SpreadsheetApp.getUi().alert(
    'Sistema inicializado correctamente.\n\n' +
    'Ya puedes abrir el Dashboard desde el menú API Fiscal.'
  );
}

function getSpreadsheet_() {
  const props = PropertiesService.getScriptProperties();
  const spreadsheetId = props.getProperty('SPREADSHEET_ID');

  if (spreadsheetId) {
    return SpreadsheetApp.openById(spreadsheetId);
  }

  const active = SpreadsheetApp.getActiveSpreadsheet();

  if (active) {
    return active;
  }

  throw new Error(
    'El sistema no está inicializado. Ejecuta "Inicializar sistema" desde Google Sheets.'
  );
}

function getSheet_(sheetName) {
  if (!sheetName) {
    throw new Error('Nombre de hoja requerido.');
  }

  const sheet = getSpreadsheet_().getSheetByName(sheetName);

  if (!sheet) {
    throw new Error('No existe la hoja "' + sheetName + '".');
  }

  return sheet;
}

function appendDataRow_(sheetName, rowData) {
  if (!sheetName) {
    throw new Error('appendDataRow_: sheetName es obligatorio.');
  }

  if (!Array.isArray(rowData)) {
    throw new Error('appendDataRow_: rowData debe ser un arreglo.');
  }

  const sheet = getSheet_(sheetName);
  let row = sheet.getLastRow() + 1;

  if (row < 2) {
    row = 2;
  }

  sheet
    .getRange(row, 1, 1, rowData.length)
    .setValues([rowData]);

  return row;
}

function rowToObject_(headers, row) {
  const object = {};

  headers.forEach((header, index) => {
    const key = String(header || '').trim();

    if (key) {
      const value = row[index];

      // google.script.run no puede devolver objetos Date al dashboard.
      // Convierte las celdas de fecha a ISO para que sus llamadas puedan
      // serializar perfiles, API Keys y registros de actividad.
      object[key] = value instanceof Date
        ? value.toISOString()
        : value;
    }
  });

  return object;
}

function toBool_(value) {
  if (value === true) {
    return true;
  }

  if (value === false || value === null || value === '') {
    return false;
  }

  const text = String(value).trim().toLowerCase();
  return ['true', '1', 'yes', 'si', 'sí'].includes(text);
}

function setConfigValue_(key, value) {
  const sheet = getSheet_(APP.SHEETS.CONFIG);
  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0] || '').trim() === key) {
      sheet.getRange(i + 1, 2).setValue(value);
      return;
    }
  }

  appendDataRow_(APP.SHEETS.CONFIG, [key, value]);
}
