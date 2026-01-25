// TypeScript interface (commented out)
// export interface encryptedRequest {
//     encryptedKey: string;
//     iv: string;
//     data: string;
// }

class CryptoGraphicService {
  // keyPair: CryptoKeyPair | null
  constructor() {
    this.keyPair = null;
    this.initialize();
  }

  // private async initialize()
  async initialize() {
    this.keyPair = await this.generateRsaKeyPair();
  }

  // private async generateRsaKeyPair(): Promise<CryptoKeyPair>
  async generateRsaKeyPair() {
    try {
      return await crypto.subtle.generateKey(
        {
          name: 'RSA-OAEP',
          modulusLength: 2048,
          publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
          hash: 'SHA-256'
        },
        true,
        ['encrypt', 'decrypt']
      );
    } catch (e) {
      throw new Error('Failed to generate RSA key pair: ' + (e instanceof Error ? e.message : String(e)));
    }
  }

  // public async getPublicKey(): Promise<string>
  async getPublicKey() {
    if (!this.keyPair) await this.initialize();

    // this.keyPair! (non-null assertion) removed
    const exported = await crypto.subtle.exportKey('spki', this.keyPair.publicKey);

    const b64 = this.arrayBufferToBase64(exported);
    return b64;
  }

  // async receiveEncryptedPayload(request: encryptedRequest)
  async receiveEncryptedPayload(request) {
    if (!this.keyPair) await this.initialize();

    if (this.keyPair && this.keyPair.privateKey) {
      // 1. Decrypt AES key
      const encryptedKey = this.base64ToArrayBuffer(request.encryptedKey);

      const aesKeyBytes = await crypto.subtle.decrypt({ name: 'RSA-OAEP' }, this.keyPair.privateKey, encryptedKey);

      // 2. Import AES key
      const aesKey = await crypto.subtle.importKey('raw', aesKeyBytes, { name: 'AES-CBC', length: 256 }, false, [
        'decrypt'
      ]);

      // 3. Decrypt payload
      const iv = this.base64ToArrayBuffer(request.iv);
      const encryptedData = this.base64ToArrayBuffer(request.data);

      const decrypted = await crypto.subtle.decrypt({ name: 'AES-CBC', iv }, aesKey, encryptedData);

      const decoded = new TextDecoder().decode(decrypted);

      if (process.env.NODE_ENV === 'development') {
        console.log(decoded);
      }

      return JSON.parse(decoded);
    } else {
      return null;
    }
  }

  // private base64ToArrayBuffer(base64: string)
  base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes.buffer;
  }

  /**
   * THIS UNDER INSTRUCTIONS FOR SEND REQUEST WITH RSA & AES
   *
   * @author DINESH SANKAR
   * @version 1.0.0
   */

  // async encryptAndSend(payload: object): Promise<object>
  async encryptAndSend(payload) {
    // 1. Generate AES key & IV
    const aesKey = await crypto.subtle.generateKey({ name: 'AES-CBC', length: 256 }, true, ['encrypt', 'decrypt']);

    const iv = crypto.getRandomValues(new Uint8Array(16));

    // 2. Encrypt payload
    const encodedData = new TextEncoder().encode(JSON.stringify(payload));

    const encryptedData = await crypto.subtle.encrypt({ name: 'AES-CBC', iv }, aesKey, encodedData);

    // 3. Export AES key
    const rawKey = await crypto.subtle.exportKey('raw', aesKey);

    // 4. Fetch RSA public key
    const response = await fetch(`http://localhost:8085/auth/public-key`);
    const pem = await response.text();
    const keyData = this.pemToArrayBuffer(pem);

    // 5. Import RSA public key
    const publicKey = await crypto.subtle.importKey('spki', keyData, { name: 'RSA-OAEP', hash: 'SHA-256' }, false, [
      'encrypt'
    ]);

    // 6. Encrypt AES key
    const encryptedKey = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, publicKey, rawKey);

    // 7. Return encrypted payload
    return {
      encryptedKey: this.arrayBufferToBase64(encryptedKey),
      iv: this.arrayBufferToBase64(iv),
      data: this.arrayBufferToBase64(encryptedData)
    };
  }

  // private pemToArrayBuffer(pem: string)
  pemToArrayBuffer(pem) {
    const b64Lines = pem
      .toString()
      .replace(/-----.*-----/g, '')
      .replace(/\s+/g, '');

    const byteStr = atob(b64Lines);
    const byteArray = new Uint8Array(byteStr.length);

    for (let i = 0; i < byteStr.length; i++) {
      byteArray[i] = byteStr.charCodeAt(i);
    }

    return byteArray.buffer;
  }

  // private arrayBufferToBase64(buffer: ArrayBuffer | ArrayLike<number>)
  arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);

    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    return btoa(binary);
  }
}

export default CryptoGraphicService;
