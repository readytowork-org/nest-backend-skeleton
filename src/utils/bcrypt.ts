import * as bcrypt from 'bcrypt';

const SALT_OR_ROUNDS = 10;

export const hashPlainText = async (plainText: string) => {
  const hash = await bcrypt.hash(plainText, SALT_OR_ROUNDS);
  return hash;
};

export const compareHashAndPlainText = async (
  plainText: string,
  hash: string,
) => {
  const isMatch = await bcrypt.compare(plainText, hash);
  return isMatch;
};

export const decryptAndComparePlainText = (
  plainText: string,
  encryptedText: string,
) => {
  // todo: decypt nickname and compare
  return encryptedText === plainText;
};

export const dummyPromise = new Promise((resolve) => {
  setTimeout(() => {
    resolve('Dummy operation complete!');
  }, 2000); // 2000 milliseconds = 2 seconds
});
