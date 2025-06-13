import { ENCODING, HASH_ALGORITHM } from '@app/common';
import * as crypto from 'crypto';

export const generateResetToken = () => {
  const token = crypto.randomBytes(32).toString(ENCODING);
  const hashed = crypto
    .createHash(HASH_ALGORITHM)
    .update(token)
    .digest(ENCODING);
  return { token, hashed };
};

export const getHashToken = (token: string) => {
  return crypto.createHash(HASH_ALGORITHM).update(token).digest(ENCODING);
};
