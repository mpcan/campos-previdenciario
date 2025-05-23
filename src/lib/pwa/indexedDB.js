// IndexedDB para PowerPrev
// Implementação de armazenamento local para suporte offline

import { openDB, deleteDB, wrap, unwrap } from 'idb';

// Nome e versão do banco de dados
const DB_NAME = 'powerprev-db';
const DB_VERSION = 1;

// Nomes dos object stores
const STORES = {
  CLIENTES: 'clientes',
  PROCESSOS: 'processos',
  ATENDIMENTOS: 'atendimentos',
  DOCUMENTOS: 'documentos',
  PERICIAS: 'pericias',
  LEADS: 'leads',
  CAMPANHAS: 'campanhas',
  MENSAGENS: 'mensagens',
  SYNC_QUEUE: 'sync_queue',
  JURISPRUDENCIAS: 'jurisprudencias',
  DOCUMENTOS_PROCESSADOS: 'documentos_processados'
};

// Inicializar o banco de dados
export const initDB = async () => {
  try {
    const db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        console.log(`Atualizando banco de dados de v${oldVersion} para v${newVersion}`);
        
        // Criar object stores se não existirem
        if (!db.objectStoreNames.contains(STORES.CLIENTES)) {
          const clientesStore = db.createObjectStore(STORES.CLIENTES, { keyPath: 'id' });
          clientesStore.createIndex('cpf', 'cpf', { unique: true });
          clientesStore.createIndex('nome', 'nome', { unique: false });
          clientesStore.createIndex('updated_at', 'updated_at', { unique: false });
        }
        
        if (!db.objectStoreNames.contains(STORES.PROCESSOS)) {
          const processosStore = db.createObjectStore(STORES.PROCESSOS, { keyPath: 'id' });
          processosStore.createIndex('cliente_id', 'cliente_id', { unique: false });
          processosStore.createIndex('numero', 'numero', { unique: true });
          processosStore.createIndex('status', 'status', { unique: false });
          processosStore.createIndex('updated_at', 'updated_at', { unique: false });
        }
        
        if (!db.objectStoreNames.contains(STORES.ATENDIMENTOS)) {
          const atendimentosStore = db.createObjectStore(STORES.ATENDIMENTOS, { keyPath: 'id' });
          atendimentosStore.createIndex('cliente_id', 'cliente_id', { unique: false });
          atendimentosStore.createIndex('data', 'data', { unique: false });
          atendimentosStore.createIndex('updated_at', 'updated_at', { unique: false });
        }
        
        if (!db.objectStoreNames.contains(STORES.DOCUMENTOS)) {
          const documentosStore = db.createObjectStore(STORES.DOCUMENTOS, { keyPath: 'id' });
          documentosStore.createIndex('cliente_id', 'cliente_id', { unique: false });
          documentosStore.createIndex('processo_id', 'processo_id', { unique: false });
          documentosStore.createIndex('tipo', 'tipo', { unique: false });
          documentosStore.createIndex('updated_at', 'updated_at', { unique: false });
        }
        
        if (!db.objectStoreNames.contains(STORES.PERICIAS)) {
          const periciasStore = db.createObjectStore(STORES.PERICIAS, { keyPath: 'id' });
          periciasStore.createIndex('cliente_id', 'cliente_id', { unique: false });
          periciasStore.createIndex('processo_id', 'processo_id', { unique: false });
          periciasStore.createIndex('data', 'data', { unique: false });
          periciasStore.createIndex('status', 'status', { unique: false });
          periciasStore.createIndex('updated_at', 'updated_at', { unique: false });
        }
        
        if (!db.objectStoreNames.contains(STORES.LEADS)) {
          const leadsStore = db.createObjectStore(STORES.LEADS, { keyPath: 'id' });
          leadsStore.createIndex('telefone', 'telefone', { unique: true });
          leadsStore.createIndex('nome', 'nome', { unique: false });
          leadsStore.createIndex('origem', 'origem', { unique: false });
          leadsStore.createIndex('updated_at', 'updated_at', { unique: false });
        }
        
        if (!db.objectStoreNames.contains(STORES.CAMPANHAS)) {
          const campanhasStore = db.createObjectStore(STORES.CAMPANHAS, { keyPath: 'id' });
          campanhasStore.createIndex('nome', 'nome', { unique: true });
          campanhasStore.createIndex('status', 'status', { unique: false });
          campanhasStore.createIndex('updated_at', 'updated_at', { unique: false });
        }
        
        if (!db.objectStoreNames.contains(STORES.MENSAGENS)) {
          const mensagensStore = db.createObjectStore(STORES.MENSAGENS, { keyPath: 'id' });
          mensagensStore.createIndex('lead_id', 'lead_id', { unique: false });
          mensagensStore.createIndex('campanha_id', 'campanha_id', { unique: false });
          mensagensStore.createIndex('status', 'status', { unique: false });
          mensagensStore.createIndex('agendamento', 'agendamento', { unique: false });
          mensagensStore.createIndex('updated_at', 'updated_at', { unique: false });
        }
        
        if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
          const syncQueueStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id', autoIncrement: true });
          syncQueueStore.createIndex('table', 'table', { unique: false });
          syncQueueStore.createIndex('operation', 'operation', { unique: false });
          syncQueueStore.createIndex('created_at', 'created_at', { unique: false });
          syncQueueStore.createIndex('status', 'status', { unique: false });
        }
        
        if (!db.objectStoreNames.contains(STORES.JURISPRUDENCIAS)) {
          const jurisprudenciasStore = db.createObjectStore(STORES.JURISPRUDENCIAS, { keyPath: 'id' });
          jurisprudenciasStore.createIndex('fonte', 'fonte', { unique: false });
          jurisprudenciasStore.createIndex('termo', 'termo', { unique: false });
          jurisprudenciasStore.createIndex('favorito', 'favorito', { unique: false });
          jurisprudenciasStore.createIndex('data_consulta', 'data_consulta', { unique: false });
        }
        
        if (!db.objectStoreNames.contains(STORES.DOCUMENTOS_PROCESSADOS)) {
          const docsProcessadosStore = db.createObjectStore(STORES.DOCUMENTOS_PROCESSADOS, { keyPath: 'id' });
          docsProcessadosStore.createIndex('type', 'type', { unique: false });
          docsProcessadosStore.createIndex('processedAt', 'processedAt', { unique: false });
          docsProcessadosStore.createIndex('validated', 'validated', { unique: false });
        }
        
        console.log('Banco de dados inicializado com sucesso');
      },
      blocked() {
        console.warn('Banco de dados bloqueado por outra conexão');
      },
      blocking() {
        console.warn('Esta conexão está bloqueando uma atualização de versão');
      },
      terminated() {
        console.error('Conexão com o banco de dados encerrada inesperadamente');
      },
    });
    
    console.log('Conexão com o banco de dados estabelecida');
    return db;
  } catch (error) {
    console.error('Erro ao inicializar o banco de dados:', error);
    throw error;
  }
};

// Funções genéricas para operações CRUD

// Adicionar ou atualizar um item
export const saveItem = async (storeName, item) => {
  try {
    const db = await initDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    
    // Adicionar timestamp de atualização
    const itemToSave = {
      ...item,
      updated_at: new Date().toISOString()
    };
    
    await store.put(itemToSave);
    await tx.done;
    
    // Adicionar à fila de sincronização se online
    if (navigator.onLine) {
      await addToSyncQueue(storeName, item.id ? 'update' : 'insert', itemToSave);
    }
    
    return itemToSave;
  } catch (error) {
    console.error(`Erro ao salvar item em ${storeName}:`, error);
    throw error;
  }
};

// Obter um item por ID
export const getItem = async (storeName, id) => {
  try {
    const db = await initDB();
    return db.get(storeName, id);
  } catch (error) {
    console.error(`Erro ao obter item de ${storeName}:`, error);
    throw error;
  }
};

// Obter todos os itens de um store
export const getAllItems = async (storeName, limit = 0) => {
  try {
    const db = await initDB();
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    
    let items;
    if (limit > 0) {
      // Obter apenas os N itens mais recentes
      const index = store.index('updated_at');
      items = await index.getAll(null, limit);
    } else {
      items = await store.getAll();
    }
    
    await tx.done;
    return items;
  } catch (error) {
    console.error(`Erro ao obter itens de ${storeName}:`, error);
    throw error;
  }
};

// Excluir um item
export const deleteItem = async (storeName, id) => {
  try {
    const db = await initDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    
    await store.delete(id);
    await tx.done;
    
    // Adicionar à fila de sincronização se online
    if (navigator.onLine) {
      await addToSyncQueue(storeName, 'delete', { id });
    }
    
    return true;
  } catch (error) {
    console.error(`Erro ao excluir item de ${storeName}:`, error);
    throw error;
  }
};

// Buscar itens por índice
export const queryByIndex = async (storeName, indexName, value) => {
  try {
    const db = await initDB();
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const index = store.index(indexName);
    
    const items = await index.getAll(value);
    await tx.done;
    
    return items;
  } catch (error) {
    console.error(`Erro ao consultar ${storeName} por ${indexName}:`, error);
    throw error;
  }
};

// Gerenciamento de sincronização

// Adicionar operação à fila de sincronização
export const addToSyncQueue = async (table, operation, data) => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
    const store = tx.objectStore(STORES.SYNC_QUEUE);
    
    const syncItem = {
      table,
      operation,
      data,
      status: 'pending',
      created_at: new Date().toISOString(),
      attempts: 0
    };
    
    await store.add(syncItem);
    await tx.done;
    
    // Registrar evento de sincronização se o navegador suportar
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-pending-data');
    } else {
      // Fallback: tentar sincronizar imediatamente
      await processSyncQueue();
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao adicionar à fila de sincronização:', error);
    throw error;
  }
};

// Processar fila de sincronização
export const processSyncQueue = async () => {
  if (!navigator.onLine) {
    console.log('Dispositivo offline, sincronização adiada');
    return false;
  }
  
  try {
    const db = await initDB();
    const tx = db.transaction(STORES.SYNC_QUEUE, 'readonly');
    const store = tx.objectStore(STORES.SYNC_QUEUE);
    const index = store.index('status');
    
    // Obter itens pendentes
    const pendingItems = await index.getAll('pending');
    await tx.done;
    
    if (pendingItems.length === 0) {
      console.log('Nenhum item pendente para sincronização');
      return true;
    }
    
    console.log(`Processando ${pendingItems.length} itens pendentes`);
    
    // Processar cada item pendente
    for (const item of pendingItems) {
      try {
        // Aqui seria a chamada para a API do Supabase
        // Implementação simplificada para demonstração
        const success = await mockSyncWithServer(item);
        
        if (success) {
          // Marcar como concluído
          await updateSyncItemStatus(item.id, 'completed');
        } else {
          // Incrementar tentativas e atualizar status
          const attempts = (item.attempts || 0) + 1;
          const status = attempts >= 5 ? 'failed' : 'pending';
          await updateSyncItemStatus(item.id, status, attempts);
        }
      } catch (error) {
        console.error(`Erro ao sincronizar item ${item.id}:`, error);
        
        // Incrementar tentativas e atualizar status
        const attempts = (item.attempts || 0) + 1;
        const status = attempts >= 5 ? 'failed' : 'pending';
        await updateSyncItemStatus(item.id, status, attempts);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao processar fila de sincronização:', error);
    return false;
  }
};

// Atualizar status de um item na fila de sincronização
const updateSyncItemStatus = async (id, status, attempts = null) => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
    const store = tx.objectStore(STORES.SYNC_QUEUE);
    
    const item = await store.get(id);
    if (!item) {
      throw new Error(`Item ${id} não encontrado na fila de sincronização`);
    }
    
    item.status = status;
    if (attempts !== null) {
      item.attempts = attempts;
    }
    item.updated_at = new Date().toISOString();
    
    await store.put(item);
    await tx.done;
    
    return true;
  } catch (error) {
    console.error(`Erro ao atualizar status do item ${id}:`, error);
    throw error;
  }
};

// Mock para simular sincronização com o servidor
// Em uma implementação real, isso seria substituído por chamadas à API do Supabase
const mockSyncWithServer = async (syncItem) => {
  return new Promise((resolve) => {
    // Simular latência de rede
    setTimeout(() => {
      // Simular sucesso com 90% de probabilidade
      const success = Math.random() < 0.9;
      console.log(`Sincronização ${success ? 'bem-sucedida' : 'falhou'} para item:`, syncItem);
      resolve(success);
    }, 500);
  });
};

// Limpar itens concluídos da fila de sincronização
export const cleanupSyncQueue = async (olderThanDays = 7) => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
    const store = tx.objectStore(STORES.SYNC_QUEUE);
    
    // Calcular data limite
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    const cutoffString = cutoffDate.toISOString();
    
    // Obter todos os itens
    const allItems = await store.getAll();
    
    // Filtrar itens concluídos e antigos
    const itemsToDelete = allItems.filter(item => 
      item.status === 'completed' && 
      item.updated_at < cutoffString
    );
    
    // Excluir itens
    for (const item of itemsToDelete) {
      await store.delete(item.id);
    }
    
    await tx.done;
    
    console.log(`${itemsToDelete.length} itens removidos da fila de sincronização`);
    return itemsToDelete.length;
  } catch (error) {
    console.error('Erro ao limpar fila de sincronização:', error);
    throw error;
  }
};

// Exportar constantes
export const STORES_ENUM = STORES;

// Configurar listeners para eventos de conectividade
export const setupConnectivityListeners = () => {
  // Quando ficar online
  window.addEventListener('online', () => {
    console.log('Dispositivo online, iniciando sincronização');
    processSyncQueue();
  });
  
  // Quando ficar offline
  window.addEventListener('offline', () => {
    console.log('Dispositivo offline, operando em modo local');
    // Notificar o usuário
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('PowerPrev - Modo Offline', {
        body: 'Você está trabalhando offline. As alterações serão sincronizadas quando a conexão for restaurada.',
        icon: '/static/images/icons/icon-192x192.png'
      });
    }
  });
};

// Inicializar banco de dados e configurar listeners
export const initializeOfflineSupport = async () => {
  try {
    // Inicializar banco de dados
    await initDB();
    
    // Configurar listeners de conectividade
    setupConnectivityListeners();
    
    // Registrar service worker
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/serviceWorker.js');
        console.log('Service Worker registrado com sucesso:', registration.scope);
      } catch (error) {
        console.error('Erro ao registrar Service Worker:', error);
      }
    }
    
    // Solicitar permissão para notificações
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      await Notification.requestPermission();
    }
    
    // Processar fila de sincronização se estiver online
    if (navigator.onLine) {
      await processSyncQueue();
    }
    
    // Limpar itens antigos da fila de sincronização
    await cleanupSyncQueue();
    
    return true;
  } catch (error) {
    console.error('Erro ao inicializar suporte offline:', error);
    return false;
  }
};
