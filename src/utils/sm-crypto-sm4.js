import { sm4 } from 'sm-crypto';


const SM4 = {


     generateRandomHexString(length) {
        const hexChars = '0123456789abcdef';
        let result = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * hexChars.length);
            result += hexChars[randomIndex];
        }
        return result;
    },
    

    /**
        * Standardizes the key to ensure it's always 16 bytes.
        * @param {string} key - The input key. 可以为 16 进制串或字节数组，要求为 128 比特
        * @returns {Uint8Array} A 16-byte key.
        */

    standardizeKey(key) {
        const encoder = new TextEncoder();
        let byteArray = encoder.encode(key);
    
        // Ensure the byte array is exactly 16 bytes long
        if (byteArray.length < 16) {
            const paddedArray = new Uint8Array(16);
            paddedArray.set(byteArray);
            byteArray = paddedArray;
        } else if (byteArray.length > 16) {
            byteArray = byteArray.slice(0, 16);
        }
    
        // Convert byte array to hexadecimal string
        let hexString = '';
        byteArray.forEach(byte => {
            hexString += byte.toString(16).padStart(2, '0');
        });
    
        return hexString;
    },


    /**
     * Encrypts data using AES with specified mode.
     * @param {string} data - Data to encrypt.
     * @param {string} key - Encryption key.
     * @param {Object} [options] - Additional options (padding).
     * @returns {string} Encrypted data in Base64 with IV prepended.
     */
    encrypt(data, key, options = {}) {
        const { padding,mode } = options;
        const modeObj = this.getMode(mode);
        const paddingObj = this.getPadding(padding);

        // Generate IV for modes that require it
        const iv = (modeObj !== "ecb") ? this.generateRandomHexString(32) : null;
        //console.log("iv=",iv)
        //console.log(this.standardizeKey(key))
        const cfg = {
            mode: modeObj,
            padding: paddingObj,
            iv: iv
        };

        const encrypted = sm4.encrypt(data, this.standardizeKey(key), cfg);

        // Combine IV and ciphertext
        let result;
        if (iv) {
            result = `${iv}${encrypted}`;
        } else {
            result = encrypted;
        }

        return result;
    },

    /**
     * Decrypts data using AES with specified mode.
     * @param {string} encryptedData - Base64 encoded encrypted data with IV prepended.
     * @param {string} key - Decryption key.
     * @param {Object} [options] - Additional options (padding).
     * @returns {string} Decrypted data.
     */
    decrypt(encryptedData, key, options = {}) {
        const { padding, mode } = options;
        const modeObj = this.getMode(mode);
        const paddingObj = this.getPadding(padding)

        // Separate IV and actual ciphertext
        let iv, actualCiphertext;
        if (modeObj !== 'ecb') {
            iv = encryptedData.slice(0, 32);
            actualCiphertext = encryptedData.slice(32);
        } else {
            iv = null;
            actualCiphertext = encryptedData;
        }

        const cfg = {
            mode: modeObj,
            padding: paddingObj,
            iv: iv
        };

        const decrypted = sm4.decrypt(
            actualCiphertext,
            this.standardizeKey(key),
            cfg
        );

        return decrypted;
    },

    /**
     * Gets the CryptoJS mode object based on the mode string.
     * @param {string} mode - Encryption/Decryption mode.
     * @returns {Object} CryptoJS mode object.
     */
    getMode(mode) {
        switch (mode.toUpperCase()) {
            case 'ECB': return 'ecb';
            case 'CBC': return 'cbc';
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
            case 'PKCS7': return "pkcs#7";
            default: return "pkcs#7";
        }
    }
};

export default SM4;