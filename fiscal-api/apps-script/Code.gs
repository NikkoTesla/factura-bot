/**
 * API Fiscal Personal para Agentes de IA
 * Versión 1.0.2
 * Creado por Nikko Tesla
 */

function onOpen() {
  SpreadsheetApp
    .getUi()
    .createMenu('API Fiscal')
    .addItem('Abrir Dashboard', 'openDashboard')
    .addSeparator()
    .addItem('Inicializar sistema', 'initializeSystem')
    .addItem('Verificar instalación', 'diagnoseSystem')
    .addToUi();
}

function openDashboard() {
  const html = HtmlService
    .createTemplateFromFile('Index')
    .evaluate()
    .setWidth(1100)
    .setHeight(720);

  SpreadsheetApp
    .getUi()
    .showModalDialog(
      html,
      'API Fiscal Personal para Agentes de IA'
    );
}

function include(filename) {
  return HtmlService
    .createHtmlOutputFromFile(filename)
    .getContent();
}

function doGet() {
  return jsonResponse_({
    ok: true,
    service: 'API Fiscal Personal',
    version: APP.VERSION,
    author: 'Nikko Tesla',
    message: 'API activa. Utiliza POST para consultar perfiles fiscales.'
  });
}

function doPost(e) {
  return handleApiRequest_(e);
}

/**
 * Obtiene automáticamente la URL del servicio publicado.
 * No requiere configuración manual del usuario.
 */
function getWebAppUrl() {
  return ScriptApp
    .getService()
    .getUrl();
}

function diagnoseSystem() {
  try {
    const spreadsheet = getSpreadsheet_();

    const requiredSheets = [
      APP.SHEETS.PROFILES,
      APP.SHEETS.API_KEYS,
      APP.SHEETS.AUDIT,
      APP.SHEETS.CONFIG
    ];

    const missingSheets = requiredSheets.filter(
      sheetName => !spreadsheet.getSheetByName(sheetName)
    );

    if (missingSheets.length) {
      SpreadsheetApp
        .getUi()
        .alert(
          'Faltan las siguientes hojas:\n\n' +
          missingSheets.join('\n')
        );
      return;
    }

    SpreadsheetApp
      .getUi()
      .alert(
        'Instalación correcta.\n\n' +
        'API Fiscal Personal para Agentes de IA\n' +
        'Versión ' + APP.VERSION
      );

  } catch (error) {
    SpreadsheetApp
      .getUi()
      .alert(
        'Error de diagnóstico:\n\n' +
        error.message
      );
  }
}
