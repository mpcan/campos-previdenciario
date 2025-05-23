// Módulo de conformidade legal para web scraping no PowerPrev
// Implementa práticas éticas e conformidade com termos de uso de sites

/**
 * Este módulo fornece funções para garantir que o web scraping realizado
 * pelo PowerPrev seja ético e esteja em conformidade com os termos de uso
 * dos sites consultados. Implementa:
 * 
 * 1. Delays entre requisições para não sobrecarregar servidores
 * 2. Headers de identificação para transparência
 * 3. Cache de resultados para minimizar requisições
 * 4. Verificação de robots.txt
 * 5. Respeito a limites de taxa de requisições
 */

// Configuração de delays e limites por domínio
const DOMAIN_CONFIGS = {
  'jurisprudencia.stf.jus.br': {
    minDelayMs: 2000, // 2 segundos entre requisições
    maxRequestsPerHour: 30,
    userAgent: 'PowerPrev/1.0 (+https://www.powerprev.com.br/sobre/web-scraping)',
    respectRobotsTxt: true
  },
  'scon.stj.jus.br': {
    minDelayMs: 3000, // 3 segundos entre requisições
    maxRequestsPerHour: 20,
    userAgent: 'PowerPrev/1.0 (+https://www.powerprev.com.br/sobre/web-scraping)',
    respectRobotsTxt: true
  },
  'www2.jf.jus.br': {
    minDelayMs: 2500, // 2.5 segundos entre requisições
    maxRequestsPerHour: 25,
    userAgent: 'PowerPrev/1.0 (+https://www.powerprev.com.br/sobre/web-scraping)',
    respectRobotsTxt: true
  },
  'jurisprudencia.trf1.jus.br': {
    minDelayMs: 3000, // 3 segundos entre requisições
    maxRequestsPerHour: 20,
    userAgent: 'PowerPrev/1.0 (+https://www.powerprev.com.br/sobre/web-scraping)',
    respectRobotsTxt: true
  },
  'default': {
    minDelayMs: 5000, // 5 segundos entre requisições
    maxRequestsPerHour: 10,
    userAgent: 'PowerPrev/1.0 (+https://www.powerprev.com.br/sobre/web-scraping)',
    respectRobotsTxt: true
  }
};

// Armazenamento de contadores de requisições
const requestCounters = {};

// Armazenamento de cache de robots.txt
const robotsTxtCache = {};

/**
 * Inicializa contadores para um domínio
 * @param {string} domain - Nome do domínio
 */
function initDomainCounter(domain) {
  if (!requestCounters[domain]) {
    requestCounters[domain] = {
      hourlyCount: 0,
      lastReset: new Date().getTime(),
      lastRequest: 0
    };
  }
}

/**
 * Verifica se uma requisição está dentro dos limites para um domínio
 * @param {string} domain - Nome do domínio
 * @returns {boolean} - True se a requisição está dentro dos limites
 */
function checkRequestLimits(domain) {
  const config = DOMAIN_CONFIGS[domain] || DOMAIN_CONFIGS.default;
  const counter = requestCounters[domain];
  
  // Verificar se passou uma hora desde o último reset
  const now = new Date().getTime();
  if (now - counter.lastReset > 3600000) { // 1 hora em milissegundos
    counter.hourlyCount = 0;
    counter.lastReset = now;
  }
  
  // Verificar se excedeu o limite por hora
  if (counter.hourlyCount >= config.maxRequestsPerHour) {
    console.warn(`Limite de requisições excedido para ${domain}: ${counter.hourlyCount}/${config.maxRequestsPerHour} por hora`);
    return false;
  }
  
  // Verificar delay mínimo entre requisições
  if (now - counter.lastRequest < config.minDelayMs) {
    console.warn(`Delay mínimo não respeitado para ${domain}: ${now - counter.lastRequest}ms < ${config.minDelayMs}ms`);
    return false;
  }
  
  return true;
}

/**
 * Registra uma requisição para um domínio
 * @param {string} domain - Nome do domínio
 */
function recordRequest(domain) {
  const counter = requestCounters[domain];
  counter.hourlyCount++;
  counter.lastRequest = new Date().getTime();
}

/**
 * Obtém headers de requisição apropriados para um domínio
 * @param {string} domain - Nome do domínio
 * @returns {Object} - Headers HTTP
 */
function getRequestHeaders(domain) {
  const config = DOMAIN_CONFIGS[domain] || DOMAIN_CONFIGS.default;
  
  return {
    'User-Agent': config.userAgent,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'pt-BR,pt;q=0.8,en-US;q=0.5,en;q=0.3',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Cache-Control': 'max-age=0',
    'TE': 'Trailers',
    'X-Requested-With': 'PowerPrev-Jurisprudencia'
  };
}

/**
 * Verifica se uma URL pode ser acessada de acordo com robots.txt
 * @param {string} url - URL a ser verificada
 * @returns {Promise<boolean>} - True se a URL pode ser acessada
 */
async function checkRobotsTxt(url) {
  try {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname;
    const config = DOMAIN_CONFIGS[domain] || DOMAIN_CONFIGS.default;
    
    // Se não precisar respeitar robots.txt, retornar true
    if (!config.respectRobotsTxt) {
      return true;
    }
    
    // Verificar cache
    if (!robotsTxtCache[domain]) {
      // Obter robots.txt
      const robotsTxtUrl = `${parsedUrl.protocol}//${domain}/robots.txt`;
      
      try {
        const response = await fetch(robotsTxtUrl, {
          headers: {
            'User-Agent': config.userAgent
          }
        });
        
        if (response.ok) {
          const robotsTxt = await response.text();
          robotsTxtCache[domain] = parseRobotsTxt(robotsTxt);
        } else {
          // Se não conseguir obter robots.txt, assumir que pode acessar
          robotsTxtCache[domain] = { allowed: true };
        }
      } catch (error) {
        console.error(`Erro ao obter robots.txt para ${domain}:`, error);
        // Em caso de erro, assumir que pode acessar
        robotsTxtCache[domain] = { allowed: true };
      }
    }
    
    // Verificar se a URL é permitida
    const path = parsedUrl.pathname + parsedUrl.search;
    return isPathAllowed(path, robotsTxtCache[domain]);
  } catch (error) {
    console.error('Erro ao verificar robots.txt:', error);
    // Em caso de erro, assumir que pode acessar
    return true;
  }
}

/**
 * Parseia o conteúdo de robots.txt
 * @param {string} robotsTxt - Conteúdo do arquivo robots.txt
 * @returns {Object} - Regras parseadas
 */
function parseRobotsTxt(robotsTxt) {
  const rules = {
    disallowedPaths: [],
    allowedPaths: []
  };
  
  // Implementação simplificada de parser de robots.txt
  const lines = robotsTxt.split('\n');
  let isRelevantUserAgent = false;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Ignorar comentários e linhas vazias
    if (trimmedLine === '' || trimmedLine.startsWith('#')) {
      continue;
    }
    
    // Verificar User-agent
    if (trimmedLine.toLowerCase().startsWith('user-agent:')) {
      const userAgent = trimmedLine.substring(11).trim();
      isRelevantUserAgent = userAgent === '*' || userAgent === 'PowerPrev';
      continue;
    }
    
    // Se não for para o user-agent relevante, ignorar
    if (!isRelevantUserAgent) {
      continue;
    }
    
    // Processar regras Disallow
    if (trimmedLine.toLowerCase().startsWith('disallow:')) {
      const path = trimmedLine.substring(9).trim();
      if (path !== '') {
        rules.disallowedPaths.push(path);
      }
      continue;
    }
    
    // Processar regras Allow
    if (trimmedLine.toLowerCase().startsWith('allow:')) {
      const path = trimmedLine.substring(6).trim();
      if (path !== '') {
        rules.allowedPaths.push(path);
      }
    }
  }
  
  return rules;
}

/**
 * Verifica se um caminho é permitido de acordo com as regras de robots.txt
 * @param {string} path - Caminho a ser verificado
 * @param {Object} rules - Regras parseadas de robots.txt
 * @returns {boolean} - True se o caminho é permitido
 */
function isPathAllowed(path, rules) {
  // Se não houver regras, permitir acesso
  if (!rules || (!rules.disallowedPaths.length && !rules.allowedPaths.length)) {
    return true;
  }
  
  // Verificar regras específicas de permissão primeiro
  for (const allowedPath of rules.allowedPaths) {
    if (path.startsWith(allowedPath)) {
      return true;
    }
  }
  
  // Verificar regras de proibição
  for (const disallowedPath of rules.disallowedPaths) {
    if (path.startsWith(disallowedPath)) {
      return false;
    }
  }
  
  // Se não houver regra específica, permitir acesso
  return true;
}

/**
 * Realiza uma requisição HTTP respeitando limites e práticas éticas
 * @param {string} url - URL para requisição
 * @param {Object} options - Opções da requisição
 * @returns {Promise<Object>} - Resposta da requisição
 */
export async function ethicalFetch(url, options = {}) {
  try {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname;
    
    // Inicializar contador para o domínio
    initDomainCounter(domain);
    
    // Verificar robots.txt
    const isAllowed = await checkRobotsTxt(url);
    if (!isAllowed) {
      throw new Error(`Acesso a ${url} não permitido pelo robots.txt`);
    }
    
    // Verificar limites de requisição
    if (!checkRequestLimits(domain)) {
      throw new Error(`Limite de requisições excedido para ${domain}`);
    }
    
    // Obter headers apropriados
    const headers = {
      ...getRequestHeaders(domain),
      ...(options.headers || {})
    };
    
    // Aplicar delay mínimo
    const config = DOMAIN_CONFIGS[domain] || DOMAIN_CONFIGS.default;
    const now = new Date().getTime();
    const lastRequest = requestCounters[domain].lastRequest;
    const timeToWait = Math.max(0, config.minDelayMs - (now - lastRequest));
    
    if (timeToWait > 0) {
      await new Promise(resolve => setTimeout(resolve, timeToWait));
    }
    
    // Realizar requisição
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    // Registrar requisição
    recordRequest(domain);
    
    return response;
  } catch (error) {
    console.error(`Erro na requisição ética para ${url}:`, error);
    throw error;
  }
}

/**
 * Verifica se uma URL pode ser acessada eticamente
 * @param {string} url - URL a ser verificada
 * @returns {Promise<Object>} - Status da verificação
 */
export async function canAccessEthically(url) {
  try {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname;
    
    // Inicializar contador para o domínio
    initDomainCounter(domain);
    
    // Verificar robots.txt
    const isAllowedByRobots = await checkRobotsTxt(url);
    
    // Verificar limites de requisição
    const isWithinLimits = checkRequestLimits(domain);
    
    // Obter configuração do domínio
    const config = DOMAIN_CONFIGS[domain] || DOMAIN_CONFIGS.default;
    
    // Calcular tempo de espera
    const now = new Date().getTime();
    const lastRequest = requestCounters[domain].lastRequest;
    const timeToWait = Math.max(0, config.minDelayMs - (now - lastRequest));
    
    return {
      canAccess: isAllowedByRobots && isWithinLimits,
      isAllowedByRobots,
      isWithinLimits,
      timeToWait,
      domain,
      config: {
        minDelayMs: config.minDelayMs,
        maxRequestsPerHour: config.maxRequestsPerHour,
        currentHourlyCount: requestCounters[domain].hourlyCount
      }
    };
  } catch (error) {
    console.error(`Erro ao verificar acesso ético para ${url}:`, error);
    return {
      canAccess: false,
      error: error.message
    };
  }
}

/**
 * Atualiza a configuração para um domínio
 * @param {string} domain - Nome do domínio
 * @param {Object} config - Nova configuração
 */
export function updateDomainConfig(domain, config) {
  DOMAIN_CONFIGS[domain] = {
    ...DOMAIN_CONFIGS[domain] || DOMAIN_CONFIGS.default,
    ...config
  };
}

/**
 * Reseta contadores para um domínio
 * @param {string} domain - Nome do domínio (ou 'all' para todos)
 */
export function resetDomainCounters(domain = 'all') {
  if (domain === 'all') {
    // Resetar todos os contadores
    Object.keys(requestCounters).forEach(d => {
      requestCounters[d] = {
        hourlyCount: 0,
        lastReset: new Date().getTime(),
        lastRequest: 0
      };
    });
  } else if (requestCounters[domain]) {
    // Resetar contador específico
    requestCounters[domain] = {
      hourlyCount: 0,
      lastReset: new Date().getTime(),
      lastRequest: 0
    };
  }
}

/**
 * Limpa cache de robots.txt
 * @param {string} domain - Nome do domínio (ou 'all' para todos)
 */
export function clearRobotsTxtCache(domain = 'all') {
  if (domain === 'all') {
    // Limpar todo o cache
    Object.keys(robotsTxtCache).forEach(d => {
      delete robotsTxtCache[d];
    });
  } else if (robotsTxtCache[domain]) {
    // Limpar cache específico
    delete robotsTxtCache[domain];
  }
}

export default {
  ethicalFetch,
  canAccessEthically,
  updateDomainConfig,
  resetDomainCounters,
  clearRobotsTxtCache,
  DOMAIN_CONFIGS
};
