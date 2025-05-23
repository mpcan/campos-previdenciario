// Módulo de auditoria básica para PowerPrev
// Implementa sistema de auditoria usando Merkle Trees para verificação de integridade

/**
 * Este módulo fornece funcionalidades de auditoria para o PowerPrev,
 * permitindo verificar a integridade dos dados e manter um registro
 * imutável de alterações importantes no sistema. Utiliza Merkle Trees
 * para criar provas criptográficas de integridade sem depender de blockchain.
 */

import { sha256 } from 'crypto-hash';
import { saveItem, getAllItems, getItem, STORES_ENUM } from '@/lib/pwa/indexedDB';

// Configuração da auditoria
const AUDIT_CONFIG = {
  // Tipos de eventos auditados
  eventTypes: {
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
    LOGIN: 'login',
    LOGOUT: 'logout',
    EXPORT: 'export',
    IMPORT: 'import',
    SHARE: 'share',
    PRINT: 'print',
    ADMIN: 'admin'
  },
  
  // Entidades auditadas
  entities: {
    CLIENTE: 'cliente',
    PROCESSO: 'processo',
    DOCUMENTO: 'documento',
    ATENDIMENTO: 'atendimento',
    PERICIA: 'pericia',
    LEAD: 'lead',
    CAMPANHA: 'campanha',
    USUARIO: 'usuario',
    SISTEMA: 'sistema'
  },
  
  // Configurações de armazenamento
  storage: {
    // Intervalo para consolidação de logs (em milissegundos)
    consolidationInterval: 24 * 60 * 60 * 1000, // 24 horas
    
    // Número máximo de eventos antes da consolidação
    maxEventsBeforeConsolidation: 1000,
    
    // Período de retenção de logs detalhados (em milissegundos)
    detailedLogRetention: 90 * 24 * 60 * 60 * 1000, // 90 dias
    
    // Período de retenção de logs consolidados (em milissegundos)
    consolidatedLogRetention: 5 * 365 * 24 * 60 * 60 * 1000 // 5 anos
  },
  
  // Configurações de Merkle Tree
  merkleTree: {
    // Intervalo para geração de árvore (em milissegundos)
    generationInterval: 6 * 60 * 60 * 1000, // 6 horas
    
    // Número máximo de eventos por árvore
    maxEventsPerTree: 500,
    
    // Algoritmo de hash
    hashAlgorithm: 'sha256'
  },
  
  // Configurações de timestamping
  timestamping: {
    // Usar serviço de timestamping externo
    useExternalService: false,
    
    // URL do serviço (se habilitado)
    serviceUrl: 'https://freetsa.org/tsr',
    
    // Intervalo para timestamping (em milissegundos)
    interval: 24 * 60 * 60 * 1000 // 24 horas
  }
};

/**
 * Registra um evento de auditoria
 * @param {string} eventType - Tipo do evento (create, update, delete, etc.)
 * @param {string} entity - Entidade afetada (cliente, processo, etc.)
 * @param {string} entityId - ID da entidade
 * @param {Object} data - Dados adicionais do evento
 * @param {Object} options - Opções adicionais
 * @returns {Promise<Object>} - Evento registrado
 */
export async function logAuditEvent(eventType, entity, entityId, data = {}, options = {}) {
  try {
    // Validar tipo de evento
    if (!Object.values(AUDIT_CONFIG.eventTypes).includes(eventType)) {
      console.warn(`Tipo de evento desconhecido: ${eventType}`);
    }
    
    // Validar entidade
    if (!Object.values(AUDIT_CONFIG.entities).includes(entity)) {
      console.warn(`Entidade desconhecida: ${entity}`);
    }
    
    // Criar evento
    const event = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
      timestamp: new Date().toISOString(),
      eventType,
      entity,
      entityId,
      userId: await getCurrentUserId(),
      userIp: await getUserIp(),
      userAgent: navigator.userAgent,
      data: sanitizeData(data),
      hash: null // Será calculado abaixo
    };
    
    // Calcular hash do evento
    event.hash = await calculateEventHash(event);
    
    // Salvar evento
    await saveItem(STORES_ENUM.AUDIT_LOGS, event);
    
    // Verificar se é necessário consolidar logs
    await checkAndConsolidateLogs();
    
    // Verificar se é necessário gerar Merkle Tree
    await checkAndGenerateMerkleTree();
    
    return event;
  } catch (error) {
    console.error('Erro ao registrar evento de auditoria:', error);
    
    // Em caso de erro, tentar salvar em localStorage como fallback
    try {
      const fallbackEvent = {
        timestamp: new Date().toISOString(),
        eventType,
        entity,
        entityId,
        error: error.message
      };
      
      const fallbackLogs = JSON.parse(localStorage.getItem('powerprev_audit_fallback') || '[]');
      fallbackLogs.push(fallbackEvent);
      localStorage.setItem('powerprev_audit_fallback', JSON.stringify(fallbackLogs));
    } catch (fallbackError) {
      console.error('Erro no fallback de auditoria:', fallbackError);
    }
    
    throw error;
  }
}

/**
 * Sanitiza dados para auditoria, removendo informações sensíveis
 * @param {Object} data - Dados a sanitizar
 * @returns {Object} - Dados sanitizados
 */
function sanitizeData(data) {
  // Clone para não modificar o original
  const sanitized = JSON.parse(JSON.stringify(data));
  
  // Lista de campos sensíveis a remover ou mascarar
  const sensitiveFields = [
    'senha', 'password', 'token', 'secret', 'credit_card',
    'cartao', 'cpf', 'cnpj', 'rg', 'passaporte', 'biometria'
  ];
  
  // Função recursiva para sanitizar objetos
  function sanitizeObject(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    
    // Array
    if (Array.isArray(obj)) {
      return obj.map(item => sanitizeObject(item));
    }
    
    // Objeto
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      // Verificar se é campo sensível
      const isSensitive = sensitiveFields.some(field => 
        key.toLowerCase().includes(field.toLowerCase())
      );
      
      if (isSensitive) {
        // Mascarar valor sensível
        if (typeof value === 'string') {
          result[key] = maskSensitiveValue(value);
        } else {
          result[key] = '[REDACTED]';
        }
      } else if (typeof value === 'object' && value !== null) {
        // Processar recursivamente
        result[key] = sanitizeObject(value);
      } else {
        // Manter valor
        result[key] = value;
      }
    }
    
    return result;
  }
  
  return sanitizeObject(sanitized);
}

/**
 * Mascara valor sensível
 * @param {string} value - Valor a mascarar
 * @returns {string} - Valor mascarado
 */
function maskSensitiveValue(value) {
  if (!value || typeof value !== 'string') return '[REDACTED]';
  
  // Manter primeiros e últimos caracteres
  const length = value.length;
  if (length <= 4) return '****';
  
  const visibleChars = Math.min(2, Math.floor(length / 4));
  const prefix = value.substring(0, visibleChars);
  const suffix = value.substring(length - visibleChars);
  const masked = '*'.repeat(length - (visibleChars * 2));
  
  return prefix + masked + suffix;
}

/**
 * Calcula hash de um evento
 * @param {Object} event - Evento para calcular hash
 * @returns {Promise<string>} - Hash do evento
 */
async function calculateEventHash(event) {
  // Criar cópia sem o campo hash
  const { hash, ...eventWithoutHash } = event;
  
  // Converter para string ordenada
  const eventString = JSON.stringify(eventWithoutHash, Object.keys(eventWithoutHash).sort());
  
  // Calcular hash
  return await sha256(eventString);
}

/**
 * Verifica se é necessário consolidar logs e executa se necessário
 * @returns {Promise<boolean>} - True se logs foram consolidados
 */
async function checkAndConsolidateLogs() {
  try {
    // Obter todos os eventos
    const events = await getAllItems(STORES_ENUM.AUDIT_LOGS);
    
    // Verificar se é necessário consolidar
    if (events.length < AUDIT_CONFIG.storage.maxEventsBeforeConsolidation) {
      return false;
    }
    
    // Verificar última consolidação
    const lastConsolidation = await getItem(STORES_ENUM.AUDIT_META, 'last_consolidation');
    const now = new Date().getTime();
    
    if (lastConsolidation && 
        (now - new Date(lastConsolidation.timestamp).getTime() < AUDIT_CONFIG.storage.consolidationInterval)) {
      return false;
    }
    
    // Consolidar logs
    await consolidateAuditLogs();
    
    return true;
  } catch (error) {
    console.error('Erro ao verificar consolidação de logs:', error);
    return false;
  }
}

/**
 * Consolida logs de auditoria
 * @returns {Promise<Object>} - Resultado da consolidação
 */
async function consolidateAuditLogs() {
  try {
    console.log('Iniciando consolidação de logs de auditoria...');
    
    // Obter todos os eventos
    const events = await getAllItems(STORES_ENUM.AUDIT_LOGS);
    
    // Agrupar por dia, entidade e tipo
    const groupedEvents = {};
    
    for (const event of events) {
      // Extrair data (YYYY-MM-DD)
      const date = event.timestamp.split('T')[0];
      const key = `${date}_${event.entity}_${event.eventType}`;
      
      if (!groupedEvents[key]) {
        groupedEvents[key] = {
          date,
          entity: event.entity,
          eventType: event.eventType,
          count: 0,
          firstEvent: event,
          lastEvent: event,
          entityIds: new Set()
        };
      }
      
      groupedEvents[key].count++;
      groupedEvents[key].entityIds.add(event.entityId);
      
      // Atualizar primeiro e último evento
      if (event.timestamp < groupedEvents[key].firstEvent.timestamp) {
        groupedEvents[key].firstEvent = event;
      }
      if (event.timestamp > groupedEvents[key].lastEvent.timestamp) {
        groupedEvents[key].lastEvent = event;
      }
    }
    
    // Criar registros consolidados
    const consolidatedLogs = [];
    
    for (const key in groupedEvents) {
      const group = groupedEvents[key];
      
      const consolidatedLog = {
        id: `consolidated_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
        date: group.date,
        entity: group.entity,
        eventType: group.eventType,
        count: group.count,
        uniqueEntities: Array.from(group.entityIds).length,
        firstEventTimestamp: group.firstEvent.timestamp,
        lastEventTimestamp: group.lastEvent.timestamp,
        sampleEventIds: [group.firstEvent.id, group.lastEvent.id],
        consolidatedAt: new Date().toISOString()
      };
      
      consolidatedLogs.push(consolidatedLog);
    }
    
    // Salvar logs consolidados
    for (const log of consolidatedLogs) {
      await saveItem(STORES_ENUM.AUDIT_CONSOLIDATED, log);
    }
    
    // Atualizar metadados
    await saveItem(STORES_ENUM.AUDIT_META, {
      id: 'last_consolidation',
      timestamp: new Date().toISOString(),
      eventsCount: events.length,
      consolidatedCount: consolidatedLogs.length
    });
    
    // Limpar logs antigos
    await cleanupOldAuditLogs();
    
    console.log(`Consolidação concluída: ${consolidatedLogs.length} registros criados`);
    
    return {
      success: true,
      eventsCount: events.length,
      consolidatedCount: consolidatedLogs.length
    };
  } catch (error) {
    console.error('Erro na consolidação de logs:', error);
    throw error;
  }
}

/**
 * Limpa logs de auditoria antigos
 * @returns {Promise<number>} - Número de logs removidos
 */
async function cleanupOldAuditLogs() {
  try {
    console.log('Limpando logs de auditoria antigos...');
    
    // Obter todos os eventos
    const events = await getAllItems(STORES_ENUM.AUDIT_LOGS);
    const now = new Date().getTime();
    let removedCount = 0;
    
    // Identificar eventos antigos
    const oldEvents = events.filter(event => {
      const eventTime = new Date(event.timestamp).getTime();
      return (now - eventTime) > AUDIT_CONFIG.storage.detailedLogRetention;
    });
    
    // Remover eventos antigos
    for (const event of oldEvents) {
      await deleteItem(STORES_ENUM.AUDIT_LOGS, event.id);
      removedCount++;
    }
    
    // Limpar logs consolidados antigos
    const consolidatedLogs = await getAllItems(STORES_ENUM.AUDIT_CONSOLIDATED);
    
    const oldConsolidatedLogs = consolidatedLogs.filter(log => {
      const logTime = new Date(log.consolidatedAt).getTime();
      return (now - logTime) > AUDIT_CONFIG.storage.consolidatedLogRetention;
    });
    
    for (const log of oldConsolidatedLogs) {
      await deleteItem(STORES_ENUM.AUDIT_CONSOLIDATED, log.id);
      removedCount++;
    }
    
    console.log(`Limpeza concluída: ${removedCount} logs removidos`);
    
    return removedCount;
  } catch (error) {
    console.error('Erro na limpeza de logs antigos:', error);
    return 0;
  }
}

/**
 * Verifica se é necessário gerar Merkle Tree e executa se necessário
 * @returns {Promise<boolean>} - True se árvore foi gerada
 */
async function checkAndGenerateMerkleTree() {
  try {
    // Verificar última geração
    const lastGeneration = await getItem(STORES_ENUM.AUDIT_META, 'last_merkle_tree');
    const now = new Date().getTime();
    
    if (lastGeneration && 
        (now - new Date(lastGeneration.timestamp).getTime() < AUDIT_CONFIG.merkleTree.generationInterval)) {
      return false;
    }
    
    // Obter eventos não incluídos em árvores
    const events = await getAllItems(STORES_ENUM.AUDIT_LOGS);
    const eventsWithoutTree = events.filter(event => !event.merkleTreeId);
    
    if (eventsWithoutTree.length < AUDIT_CONFIG.merkleTree.maxEventsPerTree) {
      return false;
    }
    
    // Gerar Merkle Tree
    await generateMerkleTree(eventsWithoutTree);
    
    return true;
  } catch (error) {
    console.error('Erro ao verificar geração de Merkle Tree:', error);
    return false;
  }
}

/**
 * Gera uma Merkle Tree para um conjunto de eventos
 * @param {Array} events - Eventos para incluir na árvore
 * @returns {Promise<Object>} - Árvore gerada
 */
async function generateMerkleTree(events) {
  try {
    console.log(`Gerando Merkle Tree para ${events.length} eventos...`);
    
    // Limitar número de eventos
    const eventsToInclude = events.slice(0, AUDIT_CONFIG.merkleTree.maxEventsPerTree);
    
    // Ordenar eventos por timestamp
    eventsToInclude.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    // Calcular hashes das folhas (eventos)
    const leaves = await Promise.all(eventsToInclude.map(event => calculateEventHash(event)));
    
    // Construir árvore
    const tree = await buildMerkleTree(leaves);
    
    // Criar registro da árvore
    const merkleTree = {
      id: `merkle_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
      timestamp: new Date().toISOString(),
      eventsCount: eventsToInclude.length,
      firstEventTimestamp: eventsToInclude[0].timestamp,
      lastEventTimestamp: eventsToInclude[eventsToInclude.length - 1].timestamp,
      rootHash: tree.rootHash,
      treeHeight: tree.height,
      eventIds: eventsToInclude.map(event => event.id)
    };
    
    // Salvar árvore
    await saveItem(STORES_ENUM.AUDIT_MERKLE_TREES, merkleTree);
    
    // Atualizar eventos com referência à árvore
    for (const event of eventsToInclude) {
      event.merkleTreeId = merkleTree.id;
      await saveItem(STORES_ENUM.AUDIT_LOGS, event);
    }
    
    // Atualizar metadados
    await saveItem(STORES_ENUM.AUDIT_META, {
      id: 'last_merkle_tree',
      timestamp: new Date().toISOString(),
      merkleTreeId: merkleTree.id,
      eventsCount: eventsToInclude.length
    });
    
    // Verificar se é necessário fazer timestamping
    await checkAndCreateTimestamp(merkleTree);
    
    console.log(`Merkle Tree gerada com sucesso: ${merkleTree.id}`);
    
    return merkleTree;
  } catch (error) {
    console.error('Erro na geração de Merkle Tree:', error);
    throw error;
  }
}

/**
 * Constrói uma Merkle Tree a partir de folhas
 * @param {Array} leaves - Hashes das folhas
 * @returns {Promise<Object>} - Árvore construída
 */
async function buildMerkleTree(leaves) {
  // Implementação simplificada de Merkle Tree
  
  // Garantir número par de folhas
  if (leaves.length % 2 !== 0) {
    leaves.push(leaves[leaves.length - 1]);
  }
  
  let height = 0;
  let nodes = [...leaves];
  
  // Construir árvore de baixo para cima
  while (nodes.length > 1) {
    height++;
    const newLevel = [];
    
    for (let i = 0; i < nodes.length; i += 2) {
      // Combinar pares de nós
      const left = nodes[i];
      const right = i + 1 < nodes.length ? nodes[i + 1] : left;
      
      // Calcular hash do par
      const combinedHash = await sha256(left + right);
      newLevel.push(combinedHash);
    }
    
    nodes = newLevel;
  }
  
  // Raiz da árvore
  const rootHash = nodes[0];
  
  return {
    rootHash,
    height,
    leavesCount: leaves.length
  };
}

/**
 * Verifica se é necessário criar timestamp e executa se necessário
 * @param {Object} merkleTree - Árvore para timestamping
 * @returns {Promise<boolean>} - True se timestamp foi criado
 */
async function checkAndCreateTimestamp(merkleTree) {
  try {
    // Verificar se timestamping está habilitado
    if (!AUDIT_CONFIG.timestamping.useExternalService) {
      return false;
    }
    
    // Verificar último timestamp
    const lastTimestamp = await getItem(STORES_ENUM.AUDIT_META, 'last_timestamp');
    const now = new Date().getTime();
    
    if (lastTimestamp && 
        (now - new Date(lastTimestamp.timestamp).getTime() < AUDIT_CONFIG.timestamping.interval)) {
      return false;
    }
    
    // Criar timestamp
    const timestamp = await createTimestamp(merkleTree.rootHash);
    
    // Salvar timestamp
    await saveItem(STORES_ENUM.AUDIT_TIMESTAMPS, {
      id: `timestamp_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
      timestamp: new Date().toISOString(),
      merkleTreeId: merkleTree.id,
      rootHash: merkleTree.rootHash,
      serviceResponse: timestamp
    });
    
    // Atualizar metadados
    await saveItem(STORES_ENUM.AUDIT_META, {
      id: 'last_timestamp',
      timestamp: new Date().toISOString(),
      merkleTreeId: merkleTree.id
    });
    
    return true;
  } catch (error) {
    console.error('Erro ao verificar criação de timestamp:', error);
    return false;
  }
}

/**
 * Cria um timestamp para um hash
 * @param {string} hash - Hash para timestamping
 * @returns {Promise<Object>} - Resposta do serviço de timestamp
 */
async function createTimestamp(hash) {
  try {
    // Implementação simplificada - em produção, usar serviço real
    
    if (!AUDIT_CONFIG.timestamping.useExternalService) {
      // Timestamp local
      return {
        source: 'local',
        timestamp: new Date().toISOString(),
        hash
      };
    }
    
    // Simular chamada a serviço externo
    console.log(`Criando timestamp para hash: ${hash}`);
    
    // Em produção, fazer requisição real ao serviço
    // const response = await fetch(AUDIT_CONFIG.timestamping.serviceUrl, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ hash })
    // });
    // return await response.json();
    
    // Simulação
    return {
      source: AUDIT_CONFIG.timestamping.serviceUrl,
      timestamp: new Date().toISOString(),
      hash,
      signature: `sim_${Date.now()}_${hash.substring(0, 8)}`
    };
  } catch (error) {
    console.error('Erro ao criar timestamp:', error);
    
    // Fallback para timestamp local
    return {
      source: 'local_fallback',
      timestamp: new Date().toISOString(),
      hash,
      error: error.message
    };
  }
}

/**
 * Verifica a integridade de um evento
 * @param {Object} event - Evento para verificar
 * @returns {Promise<Object>} - Resultado da verificação
 */
export async function verifyEventIntegrity(event) {
  try {
    // Calcular hash do evento
    const calculatedHash = await calculateEventHash(event);
    
    // Verificar hash
    const hashValid = calculatedHash === event.hash;
    
    // Verificar inclusão em Merkle Tree
    let merkleProofValid = false;
    let merkleTree = null;
    
    if (event.merkleTreeId) {
      merkleTree = await getItem(STORES_ENUM.AUDIT_MERKLE_TREES, event.merkleTreeId);
      
      if (merkleTree) {
        // Verificar se evento está na lista de eventos da árvore
        merkleProofValid = merkleTree.eventIds.includes(event.id);
      }
    }
    
    return {
      event: event.id,
      hashValid,
      merkleProofValid,
      merkleTreeId: event.merkleTreeId,
      timestamp: new Date().toISOString(),
      overallValid: hashValid && (event.merkleTreeId ? merkleProofValid : true)
    };
  } catch (error) {
    console.error('Erro ao verificar integridade do evento:', error);
    throw error;
  }
}

/**
 * Verifica a integridade de uma Merkle Tree
 * @param {string} treeId - ID da árvore
 * @returns {Promise<Object>} - Resultado da verificação
 */
export async function verifyMerkleTreeIntegrity(treeId) {
  try {
    // Obter árvore
    const merkleTree = await getItem(STORES_ENUM.AUDIT_MERKLE_TREES, treeId);
    
    if (!merkleTree) {
      throw new Error(`Merkle Tree não encontrada: ${treeId}`);
    }
    
    // Obter eventos da árvore
    const events = [];
    
    for (const eventId of merkleTree.eventIds) {
      const event = await getItem(STORES_ENUM.AUDIT_LOGS, eventId);
      if (event) {
        events.push(event);
      }
    }
    
    // Verificar se todos os eventos foram encontrados
    const eventsFound = events.length === merkleTree.eventsCount;
    
    // Recalcular árvore
    const leaves = await Promise.all(events.map(event => calculateEventHash(event)));
    const recalculatedTree = await buildMerkleTree(leaves);
    
    // Verificar hash raiz
    const rootHashValid = recalculatedTree.rootHash === merkleTree.rootHash;
    
    // Verificar timestamp
    let timestampValid = false;
    let timestamp = null;
    
    const timestamps = await getAllItems(STORES_ENUM.AUDIT_TIMESTAMPS);
    timestamp = timestamps.find(ts => ts.merkleTreeId === treeId);
    
    if (timestamp) {
      // Em produção, verificar assinatura do timestamp
      timestampValid = timestamp.rootHash === merkleTree.rootHash;
    }
    
    return {
      treeId,
      eventsCount: merkleTree.eventsCount,
      eventsFound,
      rootHashValid,
      timestampValid: timestamp ? timestampValid : null,
      timestamp: timestamp ? timestamp.timestamp : null,
      overallValid: eventsFound && rootHashValid && (timestamp ? timestampValid : true)
    };
  } catch (error) {
    console.error('Erro ao verificar integridade da Merkle Tree:', error);
    throw error;
  }
}

/**
 * Busca eventos de auditoria
 * @param {Object} filters - Filtros de busca
 * @param {Object} options - Opções de busca
 * @returns {Promise<Object>} - Resultados da busca
 */
export async function searchAuditEvents(filters = {}, options = {}) {
  try {
    // Mesclar opções com padrões
    const config = {
      limit: 100,
      offset: 0,
      sortBy: 'timestamp',
      sortDirection: 'desc',
      includeConsolidated: false,
      ...options
    };
    
    // Obter eventos
    let events = await getAllItems(STORES_ENUM.AUDIT_LOGS);
    
    // Aplicar filtros
    events = filterEvents(events, filters);
    
    // Ordenar
    events.sort((a, b) => {
      const aValue = a[config.sortBy];
      const bValue = b[config.sortBy];
      
      if (config.sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
    
    // Aplicar paginação
    const paginatedEvents = events.slice(config.offset, config.offset + config.limit);
    
    // Incluir logs consolidados se solicitado
    let consolidatedLogs = [];
    
    if (config.includeConsolidated) {
      consolidatedLogs = await getAllItems(STORES_ENUM.AUDIT_CONSOLIDATED);
      consolidatedLogs = filterConsolidatedLogs(consolidatedLogs, filters);
    }
    
    return {
      events: paginatedEvents,
      consolidatedLogs,
      total: events.length,
      totalConsolidated: consolidatedLogs.length,
      limit: config.limit,
      offset: config.offset
    };
  } catch (error) {
    console.error('Erro na busca de eventos de auditoria:', error);
    throw error;
  }
}

/**
 * Filtra eventos de acordo com critérios
 * @param {Array} events - Eventos para filtrar
 * @param {Object} filters - Critérios de filtragem
 * @returns {Array} - Eventos filtrados
 */
function filterEvents(events, filters) {
  return events.filter(event => {
    // Filtrar por tipo de evento
    if (filters.eventType && event.eventType !== filters.eventType) {
      return false;
    }
    
    // Filtrar por entidade
    if (filters.entity && event.entity !== filters.entity) {
      return false;
    }
    
    // Filtrar por ID de entidade
    if (filters.entityId && event.entityId !== filters.entityId) {
      return false;
    }
    
    // Filtrar por usuário
    if (filters.userId && event.userId !== filters.userId) {
      return false;
    }
    
    // Filtrar por data inicial
    if (filters.startDate && new Date(event.timestamp) < new Date(filters.startDate)) {
      return false;
    }
    
    // Filtrar por data final
    if (filters.endDate && new Date(event.timestamp) > new Date(filters.endDate)) {
      return false;
    }
    
    // Filtrar por texto
    if (filters.searchText) {
      const searchText = filters.searchText.toLowerCase();
      const eventText = JSON.stringify(event).toLowerCase();
      
      if (!eventText.includes(searchText)) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Filtra logs consolidados de acordo com critérios
 * @param {Array} logs - Logs para filtrar
 * @param {Object} filters - Critérios de filtragem
 * @returns {Array} - Logs filtrados
 */
function filterConsolidatedLogs(logs, filters) {
  return logs.filter(log => {
    // Filtrar por tipo de evento
    if (filters.eventType && log.eventType !== filters.eventType) {
      return false;
    }
    
    // Filtrar por entidade
    if (filters.entity && log.entity !== filters.entity) {
      return false;
    }
    
    // Filtrar por data inicial
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      const logDate = new Date(log.date);
      
      if (logDate < startDate) {
        return false;
      }
    }
    
    // Filtrar por data final
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      const logDate = new Date(log.date);
      
      if (logDate > endDate) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Exporta logs de auditoria
 * @param {Object} filters - Filtros para exportação
 * @param {string} format - Formato de exportação (json, csv)
 * @returns {Promise<Object>} - Dados exportados
 */
export async function exportAuditLogs(filters = {}, format = 'json') {
  try {
    // Buscar eventos
    const { events, consolidatedLogs } = await searchAuditEvents(filters, {
      limit: 10000, // Limite maior para exportação
      includeConsolidated: true
    });
    
    // Preparar dados para exportação
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        filters,
        eventsCount: events.length,
        consolidatedCount: consolidatedLogs.length
      },
      events,
      consolidatedLogs
    };
    
    // Exportar no formato solicitado
    if (format === 'csv') {
      return exportToCsv(exportData);
    } else {
      return exportToJson(exportData);
    }
  } catch (error) {
    console.error('Erro na exportação de logs de auditoria:', error);
    throw error;
  }
}

/**
 * Exporta dados para formato JSON
 * @param {Object} data - Dados para exportar
 * @returns {Object} - Dados exportados
 */
function exportToJson(data) {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  return {
    format: 'json',
    url,
    blob,
    filename: `powerprev_audit_logs_${new Date().toISOString().split('T')[0]}.json`
  };
}

/**
 * Exporta dados para formato CSV
 * @param {Object} data - Dados para exportar
 * @returns {Object} - Dados exportados
 */
function exportToCsv(data) {
  // Cabeçalho para eventos
  const eventHeaders = [
    'ID', 'Timestamp', 'Tipo de Evento', 'Entidade', 'ID da Entidade',
    'Usuário', 'IP', 'User Agent', 'Hash'
  ];
  
  // Converter eventos para linhas CSV
  const eventRows = data.events.map(event => [
    event.id,
    event.timestamp,
    event.eventType,
    event.entity,
    event.entityId,
    event.userId,
    event.userIp,
    event.userAgent,
    event.hash
  ]);
  
  // Cabeçalho para logs consolidados
  const consolidatedHeaders = [
    'ID', 'Data', 'Entidade', 'Tipo de Evento', 'Contagem',
    'Entidades Únicas', 'Primeiro Evento', 'Último Evento', 'Consolidado Em'
  ];
  
  // Converter logs consolidados para linhas CSV
  const consolidatedRows = data.consolidatedLogs.map(log => [
    log.id,
    log.date,
    log.entity,
    log.eventType,
    log.count,
    log.uniqueEntities,
    log.firstEventTimestamp,
    log.lastEventTimestamp,
    log.consolidatedAt
  ]);
  
  // Construir CSV
  let csv = '';
  
  // Adicionar metadados
  csv += 'Exportação de Logs de Auditoria PowerPrev\n';
  csv += `Data de Exportação,${data.metadata.exportDate}\n`;
  csv += `Total de Eventos,${data.metadata.eventsCount}\n`;
  csv += `Total de Logs Consolidados,${data.metadata.consolidatedCount}\n\n`;
  
  // Adicionar eventos
  csv += 'EVENTOS DETALHADOS\n';
  csv += eventHeaders.join(',') + '\n';
  eventRows.forEach(row => {
    csv += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n';
  });
  
  // Adicionar logs consolidados
  csv += '\nLOGS CONSOLIDADOS\n';
  csv += consolidatedHeaders.join(',') + '\n';
  consolidatedRows.forEach(row => {
    csv += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n';
  });
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  return {
    format: 'csv',
    url,
    blob,
    filename: `powerprev_audit_logs_${new Date().toISOString().split('T')[0]}.csv`
  };
}

/**
 * Obtém estatísticas de auditoria
 * @param {Object} filters - Filtros para estatísticas
 * @returns {Promise<Object>} - Estatísticas
 */
export async function getAuditStats(filters = {}) {
  try {
    // Buscar eventos
    const { events, consolidatedLogs } = await searchAuditEvents(filters, {
      limit: 10000,
      includeConsolidated: true
    });
    
    // Estatísticas gerais
    const stats = {
      totalEvents: events.length,
      totalConsolidated: consolidatedLogs.length,
      eventsByType: {},
      eventsByEntity: {},
      eventsByUser: {},
      eventsByDay: {},
      integrityStats: {
        validHashes: 0,
        invalidHashes: 0,
        inMerkleTree: 0,
        notInMerkleTree: 0
      }
    };
    
    // Calcular estatísticas
    for (const event of events) {
      // Por tipo
      stats.eventsByType[event.eventType] = (stats.eventsByType[event.eventType] || 0) + 1;
      
      // Por entidade
      stats.eventsByEntity[event.entity] = (stats.eventsByEntity[event.entity] || 0) + 1;
      
      // Por usuário
      stats.eventsByUser[event.userId] = (stats.eventsByUser[event.userId] || 0) + 1;
      
      // Por dia
      const day = event.timestamp.split('T')[0];
      stats.eventsByDay[day] = (stats.eventsByDay[day] || 0) + 1;
      
      // Integridade
      const calculatedHash = await calculateEventHash(event);
      if (calculatedHash === event.hash) {
        stats.integrityStats.validHashes++;
      } else {
        stats.integrityStats.invalidHashes++;
      }
      
      if (event.merkleTreeId) {
        stats.integrityStats.inMerkleTree++;
      } else {
        stats.integrityStats.notInMerkleTree++;
      }
    }
    
    return stats;
  } catch (error) {
    console.error('Erro ao obter estatísticas de auditoria:', error);
    throw error;
  }
}

/**
 * Obtém ID do usuário atual
 * @returns {Promise<string>} - ID do usuário
 */
async function getCurrentUserId() {
  // Implementação simplificada - em produção, obter do contexto de autenticação
  return 'user_default';
}

/**
 * Obtém IP do usuário
 * @returns {Promise<string>} - IP do usuário
 */
async function getUserIp() {
  try {
    // Implementação simplificada - em produção, usar serviço real
    return '127.0.0.1';
  } catch (error) {
    console.error('Erro ao obter IP do usuário:', error);
    return 'unknown';
  }
}

/**
 * Remove um item de um store
 * @param {string} storeName - Nome do store
 * @param {string} id - ID do item
 * @returns {Promise<void>}
 */
async function deleteItem(storeName, id) {
  // Implementação simplificada - em produção, usar função real do IndexedDB
  console.log(`Removendo item ${id} do store ${storeName}`);
}

export default {
  logAuditEvent,
  verifyEventIntegrity,
  verifyMerkleTreeIntegrity,
  searchAuditEvents,
  exportAuditLogs,
  getAuditStats,
  AUDIT_CONFIG
};
