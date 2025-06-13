import { randomInt, createHash, randomUUID } from 'crypto';

export const generateOtpAndHash = (length = 6) => {
  const max = Math.pow(10, length);
  const min = Math.pow(10, length - 1);
  const otp = String(randomInt(min, max));

  const hashedOtp = createHash('sha256').update(otp).digest('hex');

  return {
    otp,
    hashedOtp,
  };
};

export const gethashOtp = (otp: string) => {
  return createHash('sha256').update(otp).digest('hex');
};

export const generateRandomUUID = () => {
  return randomUUID();
};
