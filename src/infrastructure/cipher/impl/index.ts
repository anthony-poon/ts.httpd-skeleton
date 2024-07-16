import bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

import { Cipher } from '../index';

const SALT_ROUND = 10;

export class CipherImpl implements Cipher {
  hashCompare(plaintext: string | null, hash: string): boolean {
    if (!plaintext) {
      return false;
    }
    return bcrypt.compareSync(plaintext, hash);
  }

  hash(password: string): string {
    return bcrypt.hashSync(password, SALT_ROUND);
  }

  randomHex(byte: number = 128): string {
    return crypto.randomBytes(byte).toString('hex');
  }
}
