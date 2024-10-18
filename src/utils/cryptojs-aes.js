// cryptojs-aes.js

import CryptoJS from 'crypto-js';
const keySize = 256;
const ivSize = 128;
const iterations = 100;

const AES = {


    /**
     * Encrypts data using AES with specified mode.
     * @param {string} data - Data to encrypt.
     * @param {string} key - Encryption key.
     * @param {Object} [options] - Additional options (padding,mode,iv).
     * @returns {string} Encrypted data in Base64 with IV prepended.
     */




    encrypt(plainText, pass, options = {}) {

        var salt = CryptoJS.lib.WordArray.random(128 / 8);

        var key = CryptoJS.PBKDF2(pass, salt, {
            keySize: keySize / 32,
            iterations: iterations
        });

        var iv = CryptoJS.lib.WordArray.random(ivSize / 8);


        const { padding, mode } = options;
        const modeObj = this.getMode(mode);
        ////console.log(mode)
        const paddingObj = this.getPadding(padding);

        var encrypted = CryptoJS.AES.encrypt(plainText, key, {
            iv: iv,
            padding: paddingObj,
            mode: modeObj,
            hasher: CryptoJS.algo.SHA256
        });

        // salt, iv will be hex 32 in length
        // append them to the ciphertext for use  in decryption
        var transitmessage = salt.toString() + iv.toString() + encrypted.toString();
        return transitmessage;

    },

    /**
     * Decrypts data using AES with specified mode.
     *
     * @param {string} encryptedData - Base64 encoded encrypted data with IV prepended.
     * @param {string} key - Decryption key.
     * @param {Object} [options] - Additional options (padding).
     * @returns {string} Decrypted data.
     */
    decrypt(transitmessage, pass, options = {}) {

        const { padding, mode } = options;
        const modeObj = this.getMode(mode);
        const paddingObj = this.getPadding(padding);

        var salt = CryptoJS.enc.Hex.parse(transitmessage.substr(0, 32));
        var iv = CryptoJS.enc.Hex.parse(transitmessage.substr(32, 32))
        var encrypted = transitmessage.substring(64);

        var key = CryptoJS.PBKDF2(pass, salt, {
            keySize: keySize / 32,
            iterations: iterations
        });

        var decrypted = CryptoJS.AES.decrypt(encrypted, key, {
            iv: iv,
            padding: paddingObj,
            mode: modeObj,
            hasher: CryptoJS.algo.SHA256
        })
        return decrypted.toString(CryptoJS.enc.Utf8);
    },

    /**
     * Gets the CryptoJS mode object based on the mode string.
     * @param {string} mode - Encryption/Decryption mode.
     * @returns {Object} CryptoJS mode object.
     */
    getMode(mode) {
        switch (mode.toUpperCase()) {
            case 'ECB': return CryptoJS.mode.ECB;
            case 'CBC': return CryptoJS.mode.CBC;
            case 'CFB': return CryptoJS.mode.CFB;
            case 'OFB': return CryptoJS.mode.OFB;
            case 'CTR': return CryptoJS.mode.CTR;
            default: throw new Error('Unsupported encryption mode');
        }
    },

    /**
     * Gets the CryptoJS padding object based on the padding string.
     * @param {string} padding - Padding type.
     * @returns {Object} CryptoJS padding object.
     */
    getPadding(padding) {
        switch (padding.toUpperCase()) {
            case 'PKCS7': return CryptoJS.pad.Pkcs7;
            case 'ISO97971': return CryptoJS.pad.Iso97971;
            case 'ANSIХ923': return CryptoJS.pad.AnsiX923;
            case 'ISO10126': return CryptoJS.pad.Iso10126;
            case 'ZEROPADDING': return CryptoJS.pad.ZeroPadding;
            case 'NOPADDING': return CryptoJS.pad.NoPadding;
            default: return CryptoJS.pad.Pkcs7;
        }
    }
};

export default AES;