const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

process.loadEnvFile('.env');

function handleSuccess(res, statusCode = 200, message, data) {
  if (process.env.NODE_ENV === 'development') {
    console.log(data)
  }
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

function handleError(res, statusCode = 500, message, error) {
  if (process.env.NODE_ENV === 'development') {
    console.log(error)
  }
  res.status(statusCode).json({
    success: false,
    message,
    error: error?.message || error
  });
};


function encrypt(text, secretKey) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(secretKey, 'hex'), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(encryptedText, secretKey) {
  const [ivHex, encrypted] = encryptedText.split(':');
  if (!ivHex || !encrypted) throw new Error('Invalid encrypted payload');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(secretKey, 'hex'), iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function expressEncryptMiddleware(secretKey) {
  if (!/^[0-9a-fA-F]{64}$/.test(secretKey)) {
    throw new Error('Secret key must be a 64-character hex string.');
  }

  return (req, res, next) => {
    if (
      req.is('application/json') &&
      req.headers['encrypted'] === 'true' &&
      req.body &&
      typeof req.body.data === 'string'
    ) {
      try {
        const decrypted = decrypt(req.body.data, secretKey);
        req.body = JSON.parse(decrypted);
        req.headers['decrypted'] = 'true';
      } catch (err) {
        handleError(res, 400, 'Invalid encrypted request data', err);
      }
    }

    let alreadyEncrypted = false;

    const originalJson = res.json.bind(res);
    res.json = (data) => {
      if (alreadyEncrypted) return originalJson(data);

      try {
        const jsonStr = JSON.stringify(data);
        const encrypted = encrypt(jsonStr, secretKey);
        alreadyEncrypted = true;
        res.setHeader('X-Encrypted', 'true');
        return originalJson({ data: encrypted });
      } catch (err) {
        handleError(res, 400, 'Encryption failed', err);
      }
    };

    const originalSend = res.send.bind(res);
    res.send = (body) => {
      if (alreadyEncrypted) return originalSend(body);

      if (typeof body === 'object' && body !== null) {
        try {
          const jsonStr = JSON.stringify(body);
          const encrypted = encrypt(jsonStr, secretKey);
          alreadyEncrypted = true;
          res.setHeader('X-Encrypted', 'true');
          return originalSend(JSON.stringify({ data: encrypted }));
        } catch (err) {
          handleError(res, 400, 'Encryption failed', err);
        }
      }

      if (typeof body === 'string') {
        try {
          JSON.parse(body);
          const encrypted = encrypt(body, secretKey);
          alreadyEncrypted = true;
          res.setHeader('X-Encrypted', 'true');
          return originalSend(JSON.stringify({ data: encrypted }));
        } catch (err) {
          handleError(res, 400, 'Encryption failed', err);
        }
      }

      return originalSend(body);
    };

    next();
  };
}

module.exports = expressEncryptMiddleware;
