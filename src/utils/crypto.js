// ../utils/crypto.js
import CryptoJS from 'crypto-js';

import { sm3 } from 'sm-crypto';


export const useCrypto = () => {
  return {
    md5: (text) => {
      return CryptoJS.MD5(text).toString();
    },
    sha1: (text) => {
      return CryptoJS.SHA1(text).toString();
    },
    sha256: (text) => {
      return CryptoJS.SHA256(text).toString();
    },
    sha3: (text) => {
      return CryptoJS.SHA3(text).toString();
    },
    sha512: (text) => {
      return CryptoJS.SHA512(text).toString();
    },
    sm3: (text) => {
      // SM3 implementation can be added here
      return sm3(text).toString();
    }
  };
};