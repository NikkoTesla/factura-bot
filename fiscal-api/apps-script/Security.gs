/**
 * Generación, codificación reversible y rate limiting de API Keys.
 *
 * Nota: la codificación reversible es una capa de ofuscación para evitar
 * almacenar la API Key en texto plano en la hoja. No sustituye cifrado fuerte.
 */

function generateApiKey_() {
  return (
    APP.API_KEY_PREFIX +
    Utilities.getUuid().replace(/-/g, '') +
    Utilities.getUuid().replace(/-/g, '')
  );
}

function getEncodingSecret_() {
  const properties = PropertiesService.getScriptProperties();
  let secret = properties.getProperty('API_KEY_ENCODING_SECRET');

  if (!secret) {
    secret =
      Utilities.getUuid().replace(/-/g, '') +
      Utilities.getUuid().replace(/-/g, '');

    properties.setProperty(
      'API_KEY_ENCODING_SECRET',
      secret
    );
  }

  return secret;
}

function encodeApiKey_(plainText) {
  const secret = getEncodingSecret_();

  const inputBytes = Utilities.newBlob(
    String(plainText),
    'text/plain; charset=utf-8'
  ).getBytes();

  const secretBytes = Utilities.newBlob(
    secret,
    'text/plain; charset=utf-8'
  ).getBytes();

  const outputBytes = inputBytes.map(
    (byte, index) =>
      byte ^ secretBytes[index % secretBytes.length]
  );

  return Utilities.base64Encode(outputBytes);
}

function decodeApiKey_(encodedText) {
  if (!encodedText) {
    return '';
  }

  const secret = getEncodingSecret_();
  const inputBytes = Utilities.base64Decode(String(encodedText));

  const secretBytes = Utilities.newBlob(
    secret,
    'text/plain; charset=utf-8'
  ).getBytes();

  const outputBytes = inputBytes.map(
    (byte, index) =>
      byte ^ secretBytes[index % secretBytes.length]
  );

  return Utilities.newBlob(outputBytes).getDataAsString('UTF-8');
}

function normalizeAlias_(alias) {
  return String(alias || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');
}

function checkRateLimit_(apiKeyId) {
  const cache = CacheService.getScriptCache();
  const minute = Math.floor(Date.now() / 60000);
  const cacheKey = 'rate:' + apiKeyId + ':' + minute;

  const current = Number(cache.get(cacheKey) || 0);

  if (current >= APP.MAX_REQUESTS_PER_MINUTE) {
    return false;
  }

  cache.put(
    cacheKey,
    String(current + 1),
    90
  );

  return true;
}
