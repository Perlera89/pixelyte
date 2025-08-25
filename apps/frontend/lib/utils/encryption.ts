import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || '#pixelyte-tech';

export const encryptData = (data: any): string => {
  try {
    if (typeof data === 'object') {
      data = JSON.stringify(data);
    }
    return CryptoJS.AES.encrypt(String(data), SECRET_KEY).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    return '';
  }
};

export const decryptData = (encryptedData: string): string | null => {
  try {
    if (!encryptedData) return null;
    
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    // Intenta parsear como JSON
    try {
      return JSON.parse(decrypted);
    } catch {
      return decrypted;
    }
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

export const hashPassword = (password: string): string => {
  return CryptoJS.SHA256(password + SECRET_KEY).toString();
};

export const verifyPassword = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash;
};
