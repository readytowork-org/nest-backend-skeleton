import * as crypto from 'node:crypto';

interface FMTPayload {
  email: string;
  password: string;
}

// ---- Base64URL helpers ----
function base64urlDecode(str: string) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4 !== 0) str += '=';
  return Buffer.from(str, 'base64');
}

export function decodeFullMetalToken(
  token: string,
  secret: string,
): FMTPayload {
  const parts = token.split('.');
  if (parts.length !== 5) {
    throw new Error('Invalid token format');
  }

  const [h, s, n, c, t] = parts;

  const headerBytes = base64urlDecode(h);
  const salt = base64urlDecode(s);
  const iv = base64urlDecode(n);
  const ciphertext = base64urlDecode(c);
  const tag = base64urlDecode(t);

  const headerJson = headerBytes.toString('utf8');
  const header = JSON.parse(headerJson);

  if (
    header.typ !== 'STK' ||
    header.alg !== 'AES-256-GCM' ||
    header.kdf !== 'PBKDF2' ||
    header.v !== 1
  ) {
    throw new Error('Unsupported token type or version');
  }

  if (new Date(header.exp * 1000) < new Date()) {
    throw new Error('Token expired');
  }

  // Derive key with the same parameters as PHP
  const iterations = 100000;
  const keyLength = 32; // 32 bytes

  // Decrypt AES-256-GCM
  try {
    const key = crypto.pbkdf2Sync(
      secret,
      salt,
      iterations,
      keyLength,
      'sha256',
    );

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAAD(headerBytes);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    const payloadJson = decrypted.toString('utf8');
    return JSON.parse(payloadJson) as FMTPayload;
  } catch (err) {
    console.error(err);
    // Wrong secret, tampered data, or corrupted token
    throw new Error('Invalid token or secret');
  }
}
