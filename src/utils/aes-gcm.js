// improved-aes-gcm.js

const AES_GCM = {
    /**
     * Standardizes the key to ensure it's always 16 bytes.
     * @param {string} key - The input key.
     * @returns {Uint8Array} A 16-byte key.
     */
    standardizeKey(key) {
        const encoder = new TextEncoder();
        const encodedKey = encoder.encode(key);
        
        if (encodedKey.length === 32) {
            return encodedKey;
        } else if (encodedKey.length < 32) {
            const paddedKey = new Uint8Array(32);
            paddedKey.set(encodedKey);
            return paddedKey;
        } else {
            return encodedKey.slice(0, 32);
        }
    },

    /**
     * Encrypts plainText using AES-GCM mode.
     * @param {string} plainText - The text to encrypt.
     * @param {string} secretKey - The secret key used for encryption.
     * @returns {Promise<string>} Base64 encoded string containing IV + ciphertext.
     */
    async encrypt(plainText, secretKey) {
        try {
            const encoder = new TextEncoder();
            const standardizedKey = this.standardizeKey(secretKey);
            
            const key = await crypto.subtle.importKey(
                'raw',
                standardizedKey,
                { name: 'AES-GCM' },
                false,
                ['encrypt']
            );

            const iv = crypto.getRandomValues(new Uint8Array(12));
            const encrypted = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv },
                key,
                encoder.encode(plainText)
            );

            // Combine IV and encrypted data
            const result = new Uint8Array(iv.length + encrypted.byteLength);
            result.set(iv, 0);
            result.set(new Uint8Array(encrypted), iv.length);

            // Return as Base64
            return btoa(String.fromCharCode.apply(null, result));
        } catch (error) {
            //console.error('Encryption error:', error);
            throw error;
        }
    },

    /**
     * Decrypts the encrypted data using AES-GCM mode.
     * @param {string} encryptedData - Base64 encoded string containing IV + ciphertext.
     * @param {string} secretKey - The secret key used for decryption.
     * @returns {Promise<string>} The decrypted plain text.
     */
    async decrypt(encryptedData, secretKey) {
        try {
            const standardizedKey = this.standardizeKey(secretKey);
            
            const key = await crypto.subtle.importKey(
                'raw',
                standardizedKey,
                { name: 'AES-GCM' },
                false,
                ['decrypt']
            );

            // Decode the Base64 input
            const encryptedArray = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

            // Extract IV and ciphertext
            const iv = encryptedArray.slice(0, 12);
            const ciphertext = encryptedArray.slice(12);

            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv },
                key,
                ciphertext
            );

            return new TextDecoder().decode(decrypted);
        } catch (error) {
            //console.error('Decryption error:', error);
            throw error;
        }
    },
};

export default AES_GCM;