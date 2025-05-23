// Módulo de monitoramento de limites de APIs gratuitas para PowerPrev
// Implementa sistema de monitoramento, alertas e fallbacks para evitar exceder limites

/**
 * Este módulo fornece funções para monitorar o uso de APIs gratuitas,
 * alertar quando os limites estiverem próximos de serem atingidos e
 * implementar estratégias de fallback quando necessário.
 * 
 * Monitora principalmente:
 * - Supabase (armazenamento, requisições, autenticação)
 * - Vercel (requisições serverless, tempo de execução)
 * - Limites de armazenamento local (IndexedDB)
 */

// Configuração de limites das APIs gratuitas
const API_LIMITS = {
  supabase: {
    storage: {
      limit: 500 * 1024 * 1024, // 500 MB em bytes
      warningThreshold: 0.8, // 80% do limite
      criticalThreshold: 0.95 // 95% do limite
    },
    database: {
      rowLimit: 50000, // Número máximo de linhas
      warningThreshold: 0.8,
      criticalThreshold: 0.95
    },
    auth: {
      usersLimit: 50000, // Número máximo de usuários
      warningThreshold: 0.8,
      criticalThreshold: 0.95
    },
    requests: {
      dailyLimit: 500, // Requisições por dia
      warningThreshold: 0.7, // 70% do limite
      criticalThreshold: 0.9 // 90% do limite
    }
  },
  vercel: {
    serverlessFunctions: {
      executionsLimit: 100, // Execuções por dia
      warningThreshold: 0.7,
      criticalThreshold: 0.9
    },
    bandwidth: {
      limit: 100 * 1024 * 1024 * 1024, // 100 GB em bytes
      warningThreshold: 0.8,
      criticalThreshold: 0.95
    }
  },
  localStorage: {
    limit: 5 * 1024 * 1024, // 5 MB em bytes (varia por navegador)
    warningThreshold: 0.7,
    criticalThreshold: 0.9
  },
  indexedDB: {
    limit: 50 * 1024 * 1024, // 50 MB em bytes (varia por navegador)
    warningThreshold: 0.7,
    criticalThreshold: 0.9
  }
};

// Armazenamento de contadores de uso
let usageCounters = {
  supabase: {
    requests: {
      daily: 0,
      lastReset: new Date().toISOString()
    }
  },
  vercel: {
    serverlessFunctions: {
      executions: 0,
      lastReset: new Date().toISOString()
    }
  }
};

// Carregar contadores do localStorage se disponível
function loadCounters() {
  try {
    const savedCounters = localStorage.getItem('powerprev_api_usage_counters');
    if (savedCounters) {
      usageCounters = JSON.parse(savedCounters);
      
      // Verificar se os contadores diários precisam ser resetados
      const now = new Date();
      const lastResetDate = new Date(usageCounters.supabase.requests.lastReset);
      
      // Se o último reset foi em um dia diferente, resetar contadores diários
      if (now.toDateString() !== lastResetDate.toDateString()) {
        resetDailyCounters();
      }
    }
  } catch (error) {
    console.error('Erro ao carregar contadores de uso:', error);
    // Em caso de erro, inicializar com valores padrão
    resetAllCounters();
  }
}

// Salvar contadores no localStorage
function saveCounters() {
  try {
    localStorage.setItem('powerprev_api_usage_counters', JSON.stringify(usageCounters));
  } catch (error) {
    console.error('Erro ao salvar contadores de uso:', error);
  }
}

// Resetar contadores diários
function resetDailyCounters() {
  usageCounters.supabase.requests.daily = 0;
  usageCounters.supabase.requests.lastReset = new Date().toISOString();
  
  usageCounters.vercel.serverlessFunctions.executions = 0;
  usageCounters.vercel.serverlessFunctions.lastReset = new Date().toISOString();
  
  saveCounters();
}

// Resetar todos os contadores
function resetAllCounters() {
  usageCounters = {
    supabase: {
      requests: {
        daily: 0,
        lastReset: new Date().toISOString()
      }
    },
    vercel: {
      serverlessFunctions: {
        executions: 0,
        lastReset: new Date().toISOString()
      }
    }
  };
  
  saveCounters();
}

// Inicializar módulo
function initialize() {
  loadCounters();
  
  // Configurar verificação periódica de limites
  setInterval(checkAllLimits, 60 * 60 * 1000); // Verificar a cada hora
}

/**
 * Registra uma requisição Supabase
 * @param {string} type - Tipo de requisição (database, storage, auth)
 * @returns {boolean} - True se a requisição está dentro dos limites
 */
export function trackSupabaseRequest(type = 'database') {
  // Incrementar contador de requisições
  usageCounters.supabase.requests.daily++;
  saveCounters();
  
  // Verificar se atingiu limite
  const usage = usageCounters.supabase.requests.daily / API_LIMITS.supabase.requests.dailyLimit;
  
  // Notificar se atingiu threshold de alerta
  if (usage >= API_LIMITS.supabase.requests.warningThreshold) {
    notifyLimitWarning('supabase', 'requests', usage);
  }
  
  // Retornar se está dentro dos limites
  return usage < 1.0;
}

/**
 * Registra uma execução de função serverless Vercel
 * @returns {boolean} - True se a execução está dentro dos limites
 */
export function trackVercelServerlessExecution() {
  // Incrementar contador de execuções
  usageCounters.vercel.serverlessFunctions.executions++;
  saveCounters();
  
  // Verificar se atingiu limite
  const usage = usageCounters.vercel.serverlessFunctions.executions / 
                API_LIMITS.vercel.serverlessFunctions.executionsLimit;
  
  // Notificar se atingiu threshold de alerta
  if (usage >= API_LIMITS.vercel.serverlessFunctions.warningThreshold) {
    notifyLimitWarning('vercel', 'serverlessFunctions', usage);
  }
  
  // Retornar se está dentro dos limites
  return usage < 1.0;
}

/**
 * Verifica o uso de armazenamento do Supabase
 * @param {number} currentUsage - Uso atual em bytes
 * @returns {Object} - Status do uso
 */
export function checkSupabaseStorage(currentUsage) {
  const limit = API_LIMITS.supabase.storage.limit;
  const usage = currentUsage / limit;
  
  // Notificar se atingiu threshold de alerta
  if (usage >= API_LIMITS.supabase.storage.warningThreshold) {
    notifyLimitWarning('supabase', 'storage', usage);
  }
  
  return {
    currentUsage,
    limit,
    usagePercentage: usage * 100,
    isWarning: usage >= API_LIMITS.supabase.storage.warningThreshold,
    isCritical: usage >= API_LIMITS.supabase.storage.criticalThreshold,
    isExceeded: usage >= 1.0
  };
}

/**
 * Verifica o uso de armazenamento local (IndexedDB)
 * @returns {Promise<Object>} - Status do uso
 */
export async function checkIndexedDBUsage() {
  try {
    // Estimar uso do IndexedDB (implementação simplificada)
    const estimatedUsage = await estimateIndexedDBSize();
    const limit = API_LIMITS.indexedDB.limit;
    const usage = estimatedUsage / limit;
    
    // Notificar se atingiu threshold de alerta
    if (usage >= API_LIMITS.indexedDB.warningThreshold) {
      notifyLimitWarning('browser', 'indexedDB', usage);
    }
    
    return {
      currentUsage: estimatedUsage,
      limit,
      usagePercentage: usage * 100,
      isWarning: usage >= API_LIMITS.indexedDB.warningThreshold,
      isCritical: usage >= API_LIMITS.indexedDB.criticalThreshold,
      isExceeded: usage >= 1.0
    };
  } catch (error) {
    console.error('Erro ao verificar uso do IndexedDB:', error);
    return {
      error: error.message,
      isWarning: false,
      isCritical: false,
      isExceeded: false
    };
  }
}

/**
 * Estima o tamanho do armazenamento IndexedDB
 * @returns {Promise<number>} - Tamanho estimado em bytes
 */
async function estimateIndexedDBSize() {
  // Esta é uma implementação simplificada
  // Em produção, seria necessário um método mais preciso
  
  // Verificar se navigator.storage está disponível
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();
    return estimate.usage || 0;
  }
  
  // Fallback: estimativa baseada em contagem de itens
  // Implementação omitida para brevidade
  return 1024 * 1024; // 1 MB (valor padrão)
}

/**
 * Verifica todos os limites de APIs
 * @returns {Promise<Object>} - Status de todos os limites
 */
export async function checkAllLimits() {
  try {
    // Verificar limites do Supabase
    const supabaseRequestsUsage = usageCounters.supabase.requests.daily / 
                                 API_LIMITS.supabase.requests.dailyLimit;
    
    // Verificar limites do Vercel
    const vercelExecutionsUsage = usageCounters.vercel.serverlessFunctions.executions / 
                                 API_LIMITS.vercel.serverlessFunctions.executionsLimit;
    
    // Verificar armazenamento local
    const indexedDBStatus = await checkIndexedDBUsage();
    
    // Compilar resultados
    const results = {
      supabase: {
        requests: {
          current: usageCounters.supabase.requests.daily,
          limit: API_LIMITS.supabase.requests.dailyLimit,
          usage: supabaseRequestsUsage,
          isWarning: supabaseRequestsUsage >= API_LIMITS.supabase.requests.warningThreshold,
          isCritical: supabaseRequestsUsage >= API_LIMITS.supabase.requests.criticalThreshold,
          isExceeded: supabaseRequestsUsage >= 1.0
        }
      },
      vercel: {
        serverlessFunctions: {
          current: usageCounters.vercel.serverlessFunctions.executions,
          limit: API_LIMITS.vercel.serverlessFunctions.executionsLimit,
          usage: vercelExecutionsUsage,
          isWarning: vercelExecutionsUsage >= API_LIMITS.vercel.serverlessFunctions.warningThreshold,
          isCritical: vercelExecutionsUsage >= API_LIMITS.vercel.serverlessFunctions.criticalThreshold,
          isExceeded: vercelExecutionsUsage >= 1.0
        }
      },
      indexedDB: indexedDBStatus
    };
    
    // Verificar se algum limite está em estado crítico
    const hasCritical = results.supabase.requests.isCritical || 
                        results.vercel.serverlessFunctions.isCritical ||
                        indexedDBStatus.isCritical;
    
    if (hasCritical) {
      notifyCriticalLimits(results);
    }
    
    return results;
  } catch (error) {
    console.error('Erro ao verificar limites de APIs:', error);
    return { error: error.message };
  }
}

/**
 * Notifica o usuário sobre aproximação de limites
 * @param {string} service - Nome do serviço
 * @param {string} resource - Nome do recurso
 * @param {number} usage - Uso atual (0-1)
 */
function notifyLimitWarning(service, resource, usage) {
  const percentage = Math.round(usage * 100);
  
  // Criar notificação na interface
  const message = `Atenção: O uso de ${resource} do ${service} atingiu ${percentage}% do limite diário.`;
  
  // Exibir notificação na interface (implementação depende da UI)
  showNotification(message, 'warning');
  
  // Registrar no console
  console.warn(message);
}

/**
 * Notifica o usuário sobre limites críticos
 * @param {Object} results - Resultados da verificação de limites
 */
function notifyCriticalLimits(results) {
  // Criar mensagem com todos os limites críticos
  let message = 'ALERTA: Limites críticos de API atingidos:\n';
  
  if (results.supabase.requests.isCritical) {
    message += `- Requisições Supabase: ${Math.round(results.supabase.requests.usage * 100)}%\n`;
  }
  
  if (results.vercel.serverlessFunctions.isCritical) {
    message += `- Funções Vercel: ${Math.round(results.vercel.serverlessFunctions.usage * 100)}%\n`;
  }
  
  if (results.indexedDB.isCritical) {
    message += `- Armazenamento local: ${Math.round(results.indexedDB.usagePercentage)}%\n`;
  }
  
  message += '\nAlgumas funcionalidades podem ser limitadas para evitar exceder os limites.';
  
  // Exibir notificação na interface
  showNotification(message, 'error');
  
  // Registrar no console
  console.error(message);
}

/**
 * Exibe notificação na interface do usuário
 * @param {string} message - Mensagem da notificação
 * @param {string} type - Tipo de notificação (info, warning, error)
 */
function showNotification(message, type = 'info') {
  // Verificar se o elemento de notificação existe
  let notificationContainer = document.getElementById('api-limits-notification');
  
  // Criar container se não existir
  if (!notificationContainer) {
    notificationContainer = document.createElement('div');
    notificationContainer.id = 'api-limits-notification';
    notificationContainer.style.position = 'fixed';
    notificationContainer.style.bottom = '20px';
    notificationContainer.style.right = '20px';
    notificationContainer.style.zIndex = '9999';
    document.body.appendChild(notificationContainer);
  }
  
  // Criar elemento de notificação
  const notification = document.createElement('div');
  notification.style.padding = '12px 16px';
  notification.style.marginTop = '10px';
  notification.style.borderRadius = '4px';
  notification.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
  notification.style.maxWidth = '300px';
  notification.style.wordWrap = 'break-word';
  
  // Definir estilo com base no tipo
  switch (type) {
    case 'warning':
      notification.style.backgroundColor = '#FFF3CD';
      notification.style.color = '#856404';
      notification.style.border = '1px solid #FFEEBA';
      break;
    case 'error':
      notification.style.backgroundColor = '#F8D7DA';
      notification.style.color = '#721C24';
      notification.style.border = '1px solid #F5C6CB';
      break;
    default:
      notification.style.backgroundColor = '#D1ECF1';
      notification.style.color = '#0C5460';
      notification.style.border = '1px solid #BEE5EB';
  }
  
  // Adicionar mensagem
  notification.textContent = message;
  
  // Adicionar botão de fechar
  const closeButton = document.createElement('button');
  closeButton.textContent = '×';
  closeButton.style.position = 'absolute';
  closeButton.style.top = '5px';
  closeButton.style.right = '5px';
  closeButton.style.background = 'none';
  closeButton.style.border = 'none';
  closeButton.style.cursor = 'pointer';
  closeButton.style.fontSize = '16px';
  closeButton.style.fontWeight = 'bold';
  closeButton.style.color = 'inherit';
  closeButton.onclick = () => notification.remove();
  
  notification.appendChild(closeButton);
  notification.style.position = 'relative';
  
  // Adicionar ao container
  notificationContainer.appendChild(notification);
  
  // Remover após 10 segundos
  setTimeout(() => {
    notification.remove();
  }, 10000);
}

/**
 * Implementa estratégia de fallback para quando limites são excedidos
 * @param {string} service - Nome do serviço
 * @param {string} resource - Nome do recurso
 * @returns {Object} - Estratégia de fallback
 */
export function implementFallbackStrategy(service, resource) {
  switch (`${service}.${resource}`) {
    case 'supabase.requests':
      return {
        strategy: 'local_first',
        description: 'Priorizar armazenamento local e sincronizar quando possível',
        implementation: () => {
          // Configurar para usar armazenamento local primeiro
          return {
            useLocalStorage: true,
            syncInterval: 3600000, // 1 hora
            batchSize: 10 // Número de itens por lote de sincronização
          };
        }
      };
      
    case 'supabase.storage':
      return {
        strategy: 'compress_data',
        description: 'Comprimir dados antes de armazenar',
        implementation: () => {
          // Configurar para comprimir dados
          return {
            compressData: true,
            compressionLevel: 9, // Nível máximo de compressão
            minSizeForCompression: 1024 // Tamanho mínimo para compressão (bytes)
          };
        }
      };
      
    case 'vercel.serverlessFunctions':
      return {
        strategy: 'client_processing',
        description: 'Mover processamento para o cliente quando possível',
        implementation: () => {
          // Configurar para processar no cliente
          return {
            useClientProcessing: true,
            serverlessThrottling: true,
            throttleDelay: 5000 // 5 segundos entre requisições
          };
        }
      };
      
    case 'browser.indexedDB':
      return {
        strategy: 'cleanup_old_data',
        description: 'Limpar dados antigos para liberar espaço',
        implementation: async () => {
          // Implementar limpeza de dados antigos
          return {
            cleanupOldData: true,
            dataRetentionDays: 30, // Manter dados por 30 dias
            priorityItems: ['jurisprudencias', 'documentos'] // Itens a manter prioritariamente
          };
        }
      };
      
    default:
      return {
        strategy: 'default',
        description: 'Estratégia padrão de fallback',
        implementation: () => {
          return {
            throttleRequests: true,
            cacheResults: true,
            retryInterval: 3600000 // 1 hora
          };
        }
      };
  }
}

// Inicializar módulo quando importado
initialize();

export default {
  trackSupabaseRequest,
  trackVercelServerlessExecution,
  checkSupabaseStorage,
  checkIndexedDBUsage,
  checkAllLimits,
  implementFallbackStrategy,
  resetDailyCounters,
  API_LIMITS
};
