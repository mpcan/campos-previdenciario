// Módulo de backup e recuperação de dados para PowerPrev
// Implementa mecanismos para exportação, importação e recuperação de dados

/**
 * Este módulo fornece funções para backup e recuperação de dados do PowerPrev,
 * permitindo que usuários exportem seus dados para armazenamento seguro e
 * os importem novamente quando necessário. Também implementa mecanismos de
 * recuperação automática em caso de falhas.
 */

import { getAllItems, STORES_ENUM, clearStore, addItems } from '@/lib/pwa/indexedDB';
import { encryptData, decryptData, generateAppPassword } from '@/lib/security/localDataEncryption';

// Configuração de backup
const BACKUP_CONFIG = {
  // Intervalo padrão para backups automáticos (em milissegundos)
  autoBackupInterval: 24 * 60 * 60 * 1000, // 24 horas
  
  // Número máximo de backups automáticos a manter
  maxAutoBackups: 7,
  
  // Tamanho máximo de arquivo de backup (em bytes)
  maxBackupSize: 50 * 1024 * 1024, // 50 MB
  
  // Compressão padrão
  defaultCompression: true,
  
  // Criptografia padrão
  defaultEncryption: true,
  
  // Stores a incluir no backup completo
  fullBackupStores: Object.values(STORES_ENUM),
  
  // Stores essenciais para backup rápido
  essentialStores: [
    STORES_ENUM.CLIENTES,
    STORES_ENUM.PROCESSOS,
    STORES_ENUM.DOCUMENTOS,
    STORES_ENUM.JURISPRUDENCIAS
  ]
};

/**
 * Cria um backup completo dos dados do usuário
 * @param {Object} options - Opções de backup
 * @returns {Promise<Object>} - Metadados do backup e URL para download
 */
export async function createFullBackup(options = {}) {
  try {
    console.log('Iniciando backup completo...');
    
    // Mesclar opções com padrões
    const config = {
      compress: BACKUP_CONFIG.defaultCompression,
      encrypt: BACKUP_CONFIG.defaultEncryption,
      password: null,
      stores: BACKUP_CONFIG.fullBackupStores,
      includeMetadata: true,
      ...options
    };
    
    // Verificar senha para criptografia
    if (config.encrypt && !config.password) {
      // Usar ID do usuário para gerar senha de aplicação
      const userId = await getCurrentUserId();
      config.password = generateAppPassword(userId);
    }
    
    // Coletar dados de cada store
    const backupData = {};
    let totalSize = 0;
    
    for (const store of config.stores) {
      console.log(`Coletando dados de ${store}...`);
      const items = await getAllItems(store);
      backupData[store] = items;
      
      // Estimar tamanho
      const storeSize = estimateObjectSize(items);
      totalSize += storeSize;
      
      console.log(`Coletados ${items.length} itens de ${store} (${formatBytes(storeSize)})`);
    }
    
    // Verificar tamanho total
    if (totalSize > BACKUP_CONFIG.maxBackupSize) {
      console.warn(`Tamanho do backup (${formatBytes(totalSize)}) excede o limite de ${formatBytes(BACKUP_CONFIG.maxBackupSize)}`);
    }
    
    // Adicionar metadados
    const metadata = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      type: 'full',
      stores: config.stores,
      itemCounts: {},
      compressed: config.compress,
      encrypted: config.encrypt,
      totalSize: totalSize
    };
    
    // Contar itens por store
    for (const store of config.stores) {
      metadata.itemCounts[store] = backupData[store].length;
    }
    
    // Incluir metadados no backup se solicitado
    if (config.includeMetadata) {
      backupData._metadata = metadata;
    }
    
    // Comprimir dados se solicitado
    let processedData = backupData;
    if (config.compress) {
      console.log('Comprimindo dados...');
      processedData = await compressData(processedData);
    }
    
    // Criptografar dados se solicitado
    if (config.encrypt && config.password) {
      console.log('Criptografando dados...');
      processedData = await encryptData(processedData, config.password);
    }
    
    // Converter para Blob e criar URL para download
    const backupBlob = new Blob([JSON.stringify(processedData)], { type: 'application/json' });
    const backupUrl = URL.createObjectURL(backupBlob);
    
    // Gerar nome de arquivo
    const date = new Date().toISOString().split('T')[0];
    const fileName = `powerprev_backup_${date}.json`;
    
    console.log('Backup completo concluído com sucesso!');
    
    return {
      metadata,
      backupUrl,
      fileName,
      size: backupBlob.size
    };
  } catch (error) {
    console.error('Erro ao criar backup completo:', error);
    throw new Error(`Falha ao criar backup: ${error.message}`);
  }
}

/**
 * Cria um backup rápido apenas dos dados essenciais
 * @param {Object} options - Opções de backup
 * @returns {Promise<Object>} - Metadados do backup e URL para download
 */
export async function createQuickBackup(options = {}) {
  try {
    console.log('Iniciando backup rápido...');
    
    // Usar apenas stores essenciais
    return createFullBackup({
      ...options,
      stores: BACKUP_CONFIG.essentialStores,
      type: 'quick'
    });
  } catch (error) {
    console.error('Erro ao criar backup rápido:', error);
    throw new Error(`Falha ao criar backup rápido: ${error.message}`);
  }
}

/**
 * Restaura dados a partir de um arquivo de backup
 * @param {File|Blob|Object} backupSource - Arquivo ou objeto de backup
 * @param {Object} options - Opções de restauração
 * @returns {Promise<Object>} - Resultado da restauração
 */
export async function restoreFromBackup(backupSource, options = {}) {
  try {
    console.log('Iniciando restauração de backup...');
    
    // Mesclar opções com padrões
    const config = {
      password: null,
      clearExistingData: false,
      onProgress: null,
      stores: null, // null = restaurar todos os stores disponíveis no backup
      ...options
    };
    
    // Obter dados do backup
    let backupData;
    
    if (backupSource instanceof File || backupSource instanceof Blob) {
      // Ler arquivo
      const text = await readFileAsText(backupSource);
      backupData = JSON.parse(text);
    } else if (typeof backupSource === 'object') {
      // Usar objeto diretamente
      backupData = backupSource;
    } else if (typeof backupSource === 'string') {
      // Parsear string JSON
      backupData = JSON.parse(backupSource);
    } else {
      throw new Error('Formato de backup inválido');
    }
    
    // Verificar se os dados estão criptografados
    if (backupData.isEncrypted) {
      if (!config.password) {
        // Usar ID do usuário para gerar senha de aplicação
        const userId = await getCurrentUserId();
        config.password = generateAppPassword(userId);
      }
      
      // Descriptografar dados
      console.log('Descriptografando dados...');
      backupData = await decryptData(backupData, config.password);
    }
    
    // Verificar se os dados estão comprimidos
    if (backupData._compressed) {
      console.log('Descomprimindo dados...');
      backupData = await decompressData(backupData);
    }
    
    // Extrair metadados
    const metadata = backupData._metadata || {
      timestamp: new Date().toISOString(),
      version: 'unknown',
      type: 'unknown',
      stores: Object.keys(backupData).filter(key => key !== '_metadata'),
      itemCounts: {}
    };
    
    // Determinar stores a restaurar
    const storesToRestore = config.stores || 
                           metadata.stores || 
                           Object.keys(backupData).filter(key => key !== '_metadata');
    
    // Resultados da restauração
    const results = {
      success: true,
      restoredStores: [],
      itemCounts: {},
      errors: []
    };
    
    // Restaurar cada store
    for (const store of storesToRestore) {
      try {
        // Verificar se o store existe no backup
        if (!backupData[store]) {
          console.warn(`Store ${store} não encontrado no backup, pulando...`);
          continue;
        }
        
        // Notificar progresso
        if (config.onProgress) {
          config.onProgress({
            store,
            status: 'processing',
            message: `Restaurando ${store}...`
          });
        }
        
        // Limpar dados existentes se solicitado
        if (config.clearExistingData) {
          await clearStore(store);
        }
        
        // Adicionar itens do backup
        const items = backupData[store];
        await addItems(store, items);
        
        // Registrar resultado
        results.restoredStores.push(store);
        results.itemCounts[store] = items.length;
        
        // Notificar progresso
        if (config.onProgress) {
          config.onProgress({
            store,
            status: 'completed',
            message: `Restaurados ${items.length} itens em ${store}`
          });
        }
      } catch (error) {
        console.error(`Erro ao restaurar store ${store}:`, error);
        
        // Registrar erro
        results.errors.push({
          store,
          error: error.message
        });
        
        // Notificar progresso
        if (config.onProgress) {
          config.onProgress({
            store,
            status: 'error',
            message: `Erro ao restaurar ${store}: ${error.message}`
          });
        }
      }
    }
    
    // Verificar se houve erros
    if (results.errors.length > 0) {
      results.success = false;
    }
    
    console.log('Restauração de backup concluída:', results);
    
    return {
      ...results,
      metadata
    };
  } catch (error) {
    console.error('Erro ao restaurar backup:', error);
    throw new Error(`Falha ao restaurar backup: ${error.message}`);
  }
}

/**
 * Configura backup automático periódico
 * @param {Object} options - Opções de configuração
 * @returns {Object} - Controlador de backup automático
 */
export function setupAutoBackup(options = {}) {
  // Mesclar opções com padrões
  const config = {
    interval: BACKUP_CONFIG.autoBackupInterval,
    stores: BACKUP_CONFIG.essentialStores,
    maxBackups: BACKUP_CONFIG.maxAutoBackups,
    onBackupComplete: null,
    enabled: true,
    ...options
  };
  
  let intervalId = null;
  
  // Função para realizar backup
  const performBackup = async () => {
    try {
      console.log('Iniciando backup automático...');
      
      // Criar backup
      const result = await createFullBackup({
        stores: config.stores,
        type: 'auto'
      });
      
      // Salvar backup no armazenamento local
      await saveAutoBackup(result);
      
      // Limpar backups antigos
      await cleanupOldAutoBackups(config.maxBackups);
      
      // Notificar conclusão
      if (config.onBackupComplete) {
        config.onBackupComplete(result);
      }
      
      console.log('Backup automático concluído com sucesso!');
      return result;
    } catch (error) {
      console.error('Erro no backup automático:', error);
      return { error: error.message };
    }
  };
  
  // Iniciar intervalo se habilitado
  if (config.enabled) {
    intervalId = setInterval(performBackup, config.interval);
  }
  
  // Retornar controlador
  return {
    start: () => {
      if (!intervalId) {
        intervalId = setInterval(performBackup, config.interval);
      }
    },
    stop: () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    },
    performNow: performBackup,
    updateConfig: (newOptions) => {
      // Atualizar configuração
      Object.assign(config, newOptions);
      
      // Reiniciar intervalo se necessário
      if (intervalId) {
        clearInterval(intervalId);
        if (config.enabled) {
          intervalId = setInterval(performBackup, config.interval);
        } else {
          intervalId = null;
        }
      }
    },
    getConfig: () => ({ ...config })
  };
}

/**
 * Salva um backup automático no armazenamento local
 * @param {Object} backupResult - Resultado do backup
 * @returns {Promise<Object>} - Informações do backup salvo
 */
async function saveAutoBackup(backupResult) {
  try {
    // Obter lista atual de backups
    const backupsList = await getAutoBackupsList();
    
    // Criar entrada para o novo backup
    const backupEntry = {
      id: `auto_${Date.now()}`,
      timestamp: new Date().toISOString(),
      metadata: backupResult.metadata,
      fileName: backupResult.fileName,
      size: backupResult.size
    };
    
    // Converter URL para Blob e armazenar
    const response = await fetch(backupResult.backupUrl);
    const blob = await response.blob();
    
    // Armazenar Blob no IndexedDB
    await saveBackupBlob(backupEntry.id, blob);
    
    // Adicionar à lista de backups
    backupsList.push(backupEntry);
    
    // Salvar lista atualizada
    await saveAutoBackupsList(backupsList);
    
    return backupEntry;
  } catch (error) {
    console.error('Erro ao salvar backup automático:', error);
    throw error;
  }
}

/**
 * Obtém a lista de backups automáticos
 * @returns {Promise<Array>} - Lista de backups
 */
export async function getAutoBackupsList() {
  try {
    const listJson = localStorage.getItem('powerprev_auto_backups_list');
    return listJson ? JSON.parse(listJson) : [];
  } catch (error) {
    console.error('Erro ao obter lista de backups automáticos:', error);
    return [];
  }
}

/**
 * Salva a lista de backups automáticos
 * @param {Array} list - Lista de backups
 * @returns {Promise<void>}
 */
async function saveAutoBackupsList(list) {
  try {
    localStorage.setItem('powerprev_auto_backups_list', JSON.stringify(list));
  } catch (error) {
    console.error('Erro ao salvar lista de backups automáticos:', error);
    throw error;
  }
}

/**
 * Salva um blob de backup no IndexedDB
 * @param {string} id - ID do backup
 * @param {Blob} blob - Blob de dados
 * @returns {Promise<void>}
 */
async function saveBackupBlob(id, blob) {
  // Implementação simplificada - em produção, usar IndexedDB diretamente
  // para armazenar blobs grandes
  try {
    const reader = new FileReader();
    
    // Converter Blob para Base64
    const base64 = await new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    
    // Armazenar no localStorage (não ideal para arquivos grandes)
    localStorage.setItem(`powerprev_backup_${id}`, base64);
  } catch (error) {
    console.error('Erro ao salvar blob de backup:', error);
    throw error;
  }
}

/**
 * Obtém um backup automático pelo ID
 * @param {string} id - ID do backup
 * @returns {Promise<Object>} - Dados do backup
 */
export async function getAutoBackup(id) {
  try {
    // Obter dados do backup
    const base64 = localStorage.getItem(`powerprev_backup_${id}`);
    if (!base64) {
      throw new Error(`Backup ${id} não encontrado`);
    }
    
    // Converter Base64 para Blob
    const blob = await base64ToBlob(base64);
    
    // Criar URL para download
    const backupUrl = URL.createObjectURL(blob);
    
    // Obter metadados da lista
    const backupsList = await getAutoBackupsList();
    const backupEntry = backupsList.find(b => b.id === id);
    
    if (!backupEntry) {
      throw new Error(`Metadados do backup ${id} não encontrados`);
    }
    
    return {
      ...backupEntry,
      backupUrl,
      blob
    };
  } catch (error) {
    console.error(`Erro ao obter backup ${id}:`, error);
    throw error;
  }
}

/**
 * Remove backups automáticos antigos
 * @param {number} maxBackups - Número máximo de backups a manter
 * @returns {Promise<number>} - Número de backups removidos
 */
async function cleanupOldAutoBackups(maxBackups) {
  try {
    // Obter lista de backups
    const backupsList = await getAutoBackupsList();
    
    // Se não exceder o limite, não fazer nada
    if (backupsList.length <= maxBackups) {
      return 0;
    }
    
    // Ordenar por timestamp (mais recente primeiro)
    backupsList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Identificar backups a remover
    const backupsToRemove = backupsList.slice(maxBackups);
    
    // Remover cada backup
    for (const backup of backupsToRemove) {
      // Remover dados do backup
      localStorage.removeItem(`powerprev_backup_${backup.id}`);
    }
    
    // Atualizar lista
    const updatedList = backupsList.slice(0, maxBackups);
    await saveAutoBackupsList(updatedList);
    
    return backupsToRemove.length;
  } catch (error) {
    console.error('Erro ao limpar backups antigos:', error);
    return 0;
  }
}

/**
 * Converte Base64 para Blob
 * @param {string} base64 - String Base64
 * @returns {Promise<Blob>} - Blob
 */
async function base64ToBlob(base64) {
  // Remover prefixo de data URL se presente
  const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
  
  // Determinar tipo MIME
  const mimeType = base64.includes('data:') ? 
                  base64.split(',')[0].split(':')[1].split(';')[0] : 
                  'application/octet-stream';
  
  // Converter para array de bytes
  const byteCharacters = atob(base64Data);
  const byteArrays = [];
  
  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  
  return new Blob(byteArrays, { type: mimeType });
}

/**
 * Lê um arquivo como texto
 * @param {File|Blob} file - Arquivo a ser lido
 * @returns {Promise<string>} - Conteúdo do arquivo
 */
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

/**
 * Comprime dados usando algoritmo LZ-string
 * @param {Object} data - Dados a comprimir
 * @returns {Promise<Object>} - Dados comprimidos
 */
async function compressData(data) {
  try {
    // Implementação simplificada - em produção, usar uma biblioteca de compressão real
    // como LZ-string, pako, etc.
    
    // Converter para string JSON
    const jsonString = JSON.stringify(data);
    
    // Simular compressão (em produção, usar compressão real)
    const compressedData = {
      _compressed: true,
      _originalSize: jsonString.length,
      data: jsonString // Em produção, substituir por dados comprimidos
    };
    
    return compressedData;
  } catch (error) {
    console.error('Erro ao comprimir dados:', error);
    throw error;
  }
}

/**
 * Descomprime dados
 * @param {Object} compressedData - Dados comprimidos
 * @returns {Promise<Object>} - Dados descomprimidos
 */
async function decompressData(compressedData) {
  try {
    // Verificar se os dados estão realmente comprimidos
    if (!compressedData._compressed) {
      return compressedData;
    }
    
    // Implementação simplificada - em produção, usar a mesma biblioteca de compressão
    
    // Descomprimir (em produção, usar descompressão real)
    const jsonString = compressedData.data;
    
    // Parsear JSON
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Erro ao descomprimir dados:', error);
    throw error;
  }
}

/**
 * Estima o tamanho de um objeto em bytes
 * @param {Object} obj - Objeto a ser medido
 * @returns {number} - Tamanho estimado em bytes
 */
function estimateObjectSize(obj) {
  const jsonString = JSON.stringify(obj);
  return jsonString.length * 2; // Aproximação para UTF-16
}

/**
 * Formata tamanho em bytes para formato legível
 * @param {number} bytes - Tamanho em bytes
 * @returns {string} - Tamanho formatado
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Obtém ID do usuário atual
 * @returns {Promise<string>} - ID do usuário
 */
async function getCurrentUserId() {
  // Implementação simplificada - em produção, obter do contexto de autenticação
  return 'user_default';
}

export default {
  createFullBackup,
  createQuickBackup,
  restoreFromBackup,
  setupAutoBackup,
  getAutoBackupsList,
  getAutoBackup,
  BACKUP_CONFIG
};
