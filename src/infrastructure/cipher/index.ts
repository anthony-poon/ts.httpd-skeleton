import { CipherImpl } from './impl';

export interface Cipher {
  hashCompare: (plaintext: string | null, hash: string) => boolean;
  hash: (password: string) => string;
  randomHex: (byte?: number) => string;
}

const cipher = new CipherImpl();

export default cipher;
