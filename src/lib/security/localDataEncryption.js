// Módulo de criptografia para dados sensíveis armazenados localmente no PowerPrev
// Implementa criptografia AES-GCM para proteger informações confidenciais no IndexedDB

/**
 * Este módulo fornece funções para criptografar e descriptografar dados sensíveis
 * armazenados localmente no navegador do usuário, garantindo que mesmo que alguém
 * tenha acesso ao armazenamento local, não conseguirá ler informações confidenciais.
 * 
 * Utiliza a Web Crypto API para implementar criptografia AES-GCM, que é um padrão
 * de criptografia seguro e amplamente utilizado.
 */

// Constantes para configuração da criptografia
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256; // bits
const SALT_LENGTH = 16; // bytes
const IV_LENGTH = 12; // bytes para AES-GCM
const ITERATION_COUNT = 100000;

/**
 * Gera uma chave de criptografia derivada da senha do usuário
 * @param {string} password - Senha do usuário
 * @param {Uint8Array} salt - Valor de salt para derivação da chave
 * @returns {Promise<CryptoKey>} - Chave de criptografia
 */
async function deriveKey(password, salt) {
  // Converter senha para ArrayBuffer
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  // Importar a senha como chave
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  
  // Derivar a chave AES-GCM
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: ITERATION_COUNT,
      hash: 'SHA-256'
    },
    baseKey,
    {
      name: ALGORITHM,
      length: KEY_LENGTH
    },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Gera um salt aleatório para derivação de chave
 * @returns {Uint8Array} - Salt aleatório
 */
function generateSalt() {
  return window.crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

/**
 * Gera um vetor de inicialização (IV) aleatório
 * @returns {Uint8Array} - IV aleatório
 */
function generateIV() {
  return window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
}

/**
 * Criptografa dados sensíveis
 * @param {Object|string} data - Dados a serem criptografados
 * @param {string} password - Senha para criptografia (normalmente derivada do login do usuário)
 * @returns {Promise<Object>} - Objeto contendo dados criptografados e metadados
 */
export async function encryptData(data, password) {
  try {
    // Verificar se a Web Crypto API está disponível
    if (!window.crypto || !window.crypto.subtle) {
      throw new Error('Web Crypto API não está disponível neste navegador');
    }
    
    // Converter dados para string JSON se for objeto
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(dataString);
    
    // Gerar salt e IV
    const salt = generateSalt();
    const iv = generateIV();
    
    // Derivar chave de criptografia
    const key = await deriveKey(password, salt);
    
    // Criptografar dados
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: ALGORITHM,
        iv
      },
      key,
      dataBuffer
    );
    
    // Converter para formato Base64 para armazenamento
    const encryptedBase64 = arrayBufferToBase64(encryptedBuffer);
    const saltBase64 = arrayBufferToBase64(salt);
    const ivBase64 = arrayBufferToBase64(iv);
    
    // Retornar objeto com dados criptografados e metadados
    return {
      encryptedData: encryptedBase64,
      salt: saltBase64,
      iv: ivBase64,
      algorithm: ALGORITHM,
      keyLength: KEY_LENGTH,
      isEncrypted: true
    };
  } catch (error) {
    console.error('Erro ao criptografar dados:', error);
    throw new Error(`Falha na criptografia: ${error.message}`);
  }
}

/**
 * Descriptografa dados sensíveis
 * @param {Object} encryptedPackage - Pacote contendo dados criptografados e metadados
 * @param {string} password - Senha para descriptografia
 * @returns {Promise<Object|string>} - Dados descriptografados
 */
export async function decryptData(encryptedPackage, password) {
  try {
    // Verificar se a Web Crypto API está disponível
    if (!window.crypto || !window.crypto.subtle) {
      throw new Error('Web Crypto API não está disponível neste navegador');
    }
    
    // Verificar se o pacote está no formato correto
    if (!encryptedPackage.encryptedData || !encryptedPackage.salt || !encryptedPackage.iv) {
      throw new Error('Formato de dados criptografados inválido');
    }
    
    // Converter de Base64 para ArrayBuffer
    const encryptedBuffer = base64ToArrayBuffer(encryptedPackage.encryptedData);
    const salt = base64ToArrayBuffer(encryptedPackage.salt);
    const iv = base64ToArrayBuffer(encryptedPackage.iv);
    
    // Derivar chave de descriptografia
    const key = await deriveKey(password, new Uint8Array(salt));
    
    // Descriptografar dados
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv: new Uint8Array(iv)
      },
      key,
      encryptedBuffer
    );
    
    // Converter para string
    const decoder = new TextDecoder();
    const decryptedString = decoder.decode(decryptedBuffer);
    
    // Tentar converter para objeto JSON se possível
    try {
      return JSON.parse(decryptedString);
    } catch (e) {
      // Se não for JSON válido, retornar como string
      return decryptedString;
    }
  } catch (error) {
    console.error('Erro ao descriptografar dados:', error);
    throw new Error(`Falha na descriptografia: ${error.message}`);
  }
}

/**
 * Verifica se um objeto está criptografado
 * @param {Object} data - Objeto a ser verificado
 * @returns {boolean} - Verdadeiro se o objeto estiver criptografado
 */
export function isEncrypted(data) {
  return data && 
         typeof data === 'object' && 
         data.isEncrypted === true && 
         data.encryptedData && 
         data.salt && 
         data.iv;
}

/**
 * Converte ArrayBuffer para string Base64
 * @param {ArrayBuffer} buffer - Buffer a ser convertido
 * @returns {string} - String Base64
 */
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Converte string Base64 para ArrayBuffer
 * @param {string} base64 - String Base64
 * @returns {ArrayBuffer} - ArrayBuffer
 */
function base64ToArrayBuffer(base64) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Gera uma senha de aplicação para uso interno
 * Combina identificadores únicos do usuário com uma chave de aplicação
 * @param {string} userId - ID do usuário
 * @param {string} appKey - Chave da aplicação (opcional)
 * @returns {string} - Senha derivada
 */
export function generateAppPassword(userId, appKey = 'PowerPrev-SecureStorage') {
  // Combinar ID do usuário com chave da aplicação
  return `${userId}-${appKey}-${navigator.userAgent.replace(/\s/g, '')}`;
}

/**
 * Criptografa um objeto com campos sensíveis
 * Apenas os campos especificados serão criptografados, o resto permanece como está
 * @param {Object} obj - Objeto com dados
 * @param {Array<string>} sensitiveFields - Lista de campos sensíveis para criptografar
 * @param {string} password - Senha para criptografia
 * @returns {Promise<Object>} - Objeto com campos sensíveis criptografados
 */
export async function encryptSensitiveFields(obj, sensitiveFields, password) {
  // Clonar objeto para não modificar o original
  const result = { ...obj };
  
  // Criptografar cada campo sensível
  for (const field of sensitiveFields) {
    if (obj[field] !== undefined) {
      result[field] = await encryptData(obj[field], password);
    }
  }
  
  return result;
}

/**
 * Descriptografa campos sensíveis de um objeto
 * @param {Object} obj - Objeto com dados criptografados
 * @param {Array<string>} sensitiveFields - Lista de campos sensíveis para descriptografar
 * @param {string} password - Senha para descriptografia
 * @returns {Promise<Object>} - Objeto com campos sensíveis descriptografados
 */
export async function decryptSensitiveFields(obj, sensitiveFields, password) {
  // Clonar objeto para não modificar o original
  const result = { ...obj };
  
  // Descriptografar cada campo sensível
  for (const field of sensitiveFields) {
    if (obj[field] !== undefined && isEncrypted(obj[field])) {
      result[field] = await decryptData(obj[field], password);
    }
  }
  
  return result;
}

export default {
  encryptData,
  decryptData,
  isEncrypted,
  generateAppPassword,
  encryptSensitiveFields,
  decryptSensitiveFields
};
