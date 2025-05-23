// Módulo de verificação de viabilidade de marca no INPI para PowerPrev
// Implementa busca de anterioridade e análise de distintividade

/**
 * Este módulo fornece funcionalidades para verificar a viabilidade de registro
 * da marca "PowerPrev" no Instituto Nacional da Propriedade Industrial (INPI).
 * Realiza busca de anterioridade, análise de distintividade e verificação de
 * disponibilidade de domínio.
 */

// Configuração da busca
const SEARCH_CONFIG = {
  // Classes NICE relevantes para software jurídico/previdenciário
  niceClasses: [
    {
      code: '9',
      description: 'Aparelhos e instrumentos científicos, de pesquisa, navegação, topografia, fotográficos, cinematográficos, audiovisuais, ópticos, de pesagem, medição, sinalização, detecção, teste, inspeção, salvamento e ensino; aparelhos e instrumentos para conduzir, interruptor, transformar, acumular, regular ou controlar a distribuição ou uso de eletricidade; aparelhos e instrumentos para gravar, transmitir, reproduzir ou processar som, imagens ou dados; suportes gravados e baixáveis, software de computador, suportes de gravação e armazenamento virgens digitais ou analógicos; mecanismos para aparelhos operados com moedas; caixas registradoras, dispositivos de cálculo; computadores e dispositivos periféricos de computador; roupas de mergulho, máscaras de mergulhadores, tampões de ouvidos para mergulhadores, clipes nasais para mergulhadores e nadadores, luvas para mergulhadores, aparelhos respiratórios para natação subaquática; aparelhos de extinção de incêndio.'
    },
    {
      code: '42',
      description: 'Serviços científicos e tecnológicos e pesquisa e design relacionados a estes; serviços de análise industrial, pesquisa industrial e design industrial; serviços de controle de qualidade e autenticação; design e desenvolvimento de hardware e software de computador.'
    },
    {
      code: '45',
      description: 'Serviços jurídicos; serviços de segurança para proteção física de bens tangíveis e indivíduos; serviços pessoais e sociais prestados por terceiros para atender às necessidades dos indivíduos.'
    }
  ],
  
  // Termos de busca para verificação de anterioridade
  searchTerms: [
    'PowerPrev',
    'Power Prev',
    'Powerprev',
    'Power-Prev',
    'Prevpower',
    'Prev Power',
    'Prev-Power'
  ],
  
  // Termos similares para verificação de colidência
  similarTerms: [
    'Prevgest',
    'Prevsoft',
    'Powergest',
    'Powerlaw',
    'Prevlaw',
    'Powerjur',
    'Prevjur'
  ]
};

/**
 * Realiza busca de anterioridade no INPI
 * @returns {Promise<Object>} - Resultados da busca
 */
export async function searchTrademarkAvailability() {
  try {
    console.log('Iniciando busca de anterioridade no INPI...');
    
    // Implementação simulada - em produção, usar API do INPI ou web scraping
    
    // Resultados simulados
    const results = {
      exactMatches: [],
      similarMatches: [],
      searchDate: new Date().toISOString(),
      status: 'success'
    };
    
    // Simular busca para termos exatos
    for (const term of SEARCH_CONFIG.searchTerms) {
      // Simular resultado para "PowerPrev"
      if (term === 'PowerPrev') {
        // Não encontrado - disponível
        console.log(`Termo "${term}" não encontrado no INPI`);
      }
      // Simular resultado para variações
      else if (term === 'Power Prev' || term === 'Powerprev') {
        // Encontrar marca similar
        results.similarMatches.push({
          term,
          registrationNumber: term === 'Power Prev' ? '912345678' : '923456789',
          owner: term === 'Power Prev' ? 'Empresa de Software Ltda' : 'Consultoria Previdenciária S.A.',
          status: 'Registrada',
          niceClass: term === 'Power Prev' ? '9' : '45',
          filingDate: term === 'Power Prev' ? '2020-05-15' : '2019-08-22',
          similarity: 'média'
        });
        
        console.log(`Termo similar "${term}" encontrado no INPI`);
      }
    }
    
    // Simular busca para termos similares
    for (const term of SEARCH_CONFIG.similarTerms) {
      // Simular alguns resultados
      if (['Prevgest', 'Powerlaw', 'Prevlaw'].includes(term)) {
        results.similarMatches.push({
          term,
          registrationNumber: `9${Math.floor(10000000 + Math.random() * 90000000)}`,
          owner: `Empresa ${term} Ltda`,
          status: 'Registrada',
          niceClass: Math.random() > 0.5 ? '9' : '42',
          filingDate: `202${Math.floor(Math.random() * 3)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
          similarity: 'baixa'
        });
        
        console.log(`Termo similar "${term}" encontrado no INPI`);
      }
    }
    
    console.log('Busca de anterioridade concluída');
    
    return results;
  } catch (error) {
    console.error('Erro na busca de anterioridade:', error);
    throw error;
  }
}

/**
 * Analisa distintividade da marca
 * @param {string} trademark - Marca a ser analisada
 * @returns {Promise<Object>} - Resultado da análise
 */
export async function analyzeDistinctiveness(trademark = 'PowerPrev') {
  try {
    console.log(`Analisando distintividade da marca "${trademark}"...`);
    
    // Implementação simulada - em produção, usar algoritmo mais sofisticado
    
    // Verificar se é termo genérico
    const genericTerms = ['software', 'sistema', 'app', 'aplicativo', 'programa', 'gestão', 'gerenciamento'];
    const isGeneric = genericTerms.some(term => trademark.toLowerCase().includes(term.toLowerCase()));
    
    // Verificar se é termo descritivo
    const descriptiveTerms = ['prev', 'previdência', 'previdenciário', 'jurídico', 'advocacia', 'advogado', 'processo'];
    const isDescriptive = descriptiveTerms.some(term => trademark.toLowerCase().includes(term.toLowerCase()));
    
    // Verificar se é termo sugestivo
    const suggestiveTerms = ['power', 'força', 'potência', 'pro', 'expert', 'master', 'smart'];
    const isSuggestive = suggestiveTerms.some(term => trademark.toLowerCase().includes(term.toLowerCase()));
    
    // Calcular pontuação de distintividade
    let distinctivenessScore = 0;
    
    if (isGeneric) {
      distinctivenessScore -= 30;
    }
    
    if (isDescriptive) {
      distinctivenessScore -= 20;
    }
    
    if (isSuggestive) {
      distinctivenessScore += 10;
    }
    
    // Ajustar com base no comprimento da marca
    if (trademark.length < 4) {
      distinctivenessScore -= 10;
    } else if (trademark.length > 10) {
      distinctivenessScore += 5;
    }
    
    // Ajustar com base na combinação de palavras
    if (trademark.includes(' ') || trademark.includes('-')) {
      distinctivenessScore += 5;
    }
    
    // Normalizar pontuação (0-100)
    distinctivenessScore = Math.max(0, Math.min(100, distinctivenessScore + 50));
    
    // Determinar categoria de distintividade
    let distinctivenessCategory;
    if (distinctivenessScore >= 80) {
      distinctivenessCategory = 'Alta';
    } else if (distinctivenessScore >= 50) {
      distinctivenessCategory = 'Média';
    } else {
      distinctivenessCategory = 'Baixa';
    }
    
    // Resultado da análise
    const result = {
      trademark,
      distinctivenessScore,
      distinctivenessCategory,
      isGeneric,
      isDescriptive,
      isSuggestive,
      analysis: {
        strengths: [],
        weaknesses: [],
        recommendations: []
      }
    };
    
    // Adicionar pontos fortes
    if (!isGeneric) {
      result.analysis.strengths.push('Não utiliza termos genéricos');
    }
    
    if (isSuggestive) {
      result.analysis.strengths.push('Utiliza termos sugestivos que indicam qualidade');
    }
    
    if (trademark.length >= 5 && trademark.length <= 10) {
      result.analysis.strengths.push('Comprimento adequado para memorização');
    }
    
    // Adicionar pontos fracos
    if (isGeneric) {
      result.analysis.weaknesses.push('Contém termos genéricos que reduzem distintividade');
    }
    
    if (isDescriptive) {
      result.analysis.weaknesses.push('Contém termos descritivos que podem dificultar registro');
    }
    
    // Adicionar recomendações
    if (isGeneric || isDescriptive) {
      result.analysis.recommendations.push('Considerar adicionar elementos fantasiosos para aumentar distintividade');
    }
    
    if (distinctivenessScore < 50) {
      result.analysis.recommendations.push('Considerar alterações para aumentar distintividade');
    } else if (distinctivenessScore >= 50 && distinctivenessScore < 80) {
      result.analysis.recommendations.push('Marca com distintividade média, pode enfrentar alguns desafios no registro');
    } else {
      result.analysis.recommendations.push('Marca com boa distintividade, favorável para registro');
    }
    
    console.log('Análise de distintividade concluída');
    
    return result;
  } catch (error) {
    console.error('Erro na análise de distintividade:', error);
    throw error;
  }
}

/**
 * Verifica disponibilidade de domínio
 * @param {string} domain - Domínio a ser verificado (sem extensão)
 * @param {Array} extensions - Extensões a verificar
 * @returns {Promise<Object>} - Resultado da verificação
 */
export async function checkDomainAvailability(domain = 'powerprev', extensions = ['.com.br', '.com', '.net', '.org', '.app']) {
  try {
    console.log(`Verificando disponibilidade do domínio "${domain}"...`);
    
    // Implementação simulada - em produção, usar API de registradores
    
    const results = {
      domain,
      checkDate: new Date().toISOString(),
      availability: {}
    };
    
    // Simular verificação para cada extensão
    for (const extension of extensions) {
      const fullDomain = `${domain}${extension}`;
      
      // Simular disponibilidade
      let isAvailable;
      
      if (fullDomain === 'powerprev.com.br') {
        isAvailable = true; // Disponível
      } else if (fullDomain === 'powerprev.com') {
        isAvailable = false; // Indisponível
      } else {
        // Aleatório para outras extensões
        isAvailable = Math.random() > 0.3;
      }
      
      results.availability[extension] = {
        fullDomain,
        isAvailable,
        registrar: isAvailable ? null : 'Registro.br',
        expiryDate: isAvailable ? null : `202${Math.floor(Math.random() * 5) + 3}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`
      };
      
      console.log(`Domínio ${fullDomain}: ${isAvailable ? 'Disponível' : 'Indisponível'}`);
    }
    
    console.log('Verificação de domínio concluída');
    
    return results;
  } catch (error) {
    console.error('Erro na verificação de domínio:', error);
    throw error;
  }
}

/**
 * Estima custos de registro de marca
 * @param {Array} niceClasses - Classes NICE para registro
 * @returns {Promise<Object>} - Estimativa de custos
 */
export async function estimateRegistrationCosts(niceClasses = ['9', '42']) {
  try {
    console.log('Estimando custos de registro de marca...');
    
    // Valores atualizados para 2025 (simulados)
    const fees = {
      filing: {
        electronic: 415, // Pedido eletrônico
        paper: 590 // Pedido em papel
      },
      perClass: 200, // Taxa por classe adicional
      examination: 0, // Incluído na taxa de depósito
      registration: 745, // Concessão de registro
      appeal: 475, // Recurso administrativo
      renewal: 1610, // Renovação (10 anos)
      attorneyFees: {
        min: 2500,
        max: 5000
      }
    };
    
    // Calcular custos
    const classesCount = niceClasses.length;
    const additionalClassesFee = Math.max(0, classesCount - 1) * fees.perClass;
    
    const costs = {
      filingFee: fees.filing.electronic,
      additionalClassesFee,
      registrationFee: fees.registration,
      totalOfficialFees: fees.filing.electronic + additionalClassesFee + fees.registration,
      estimatedAttorneyFees: {
        min: fees.attorneyFees.min,
        max: fees.attorneyFees.max
      },
      totalEstimated: {
        min: fees.filing.electronic + additionalClassesFee + fees.registration + fees.attorneyFees.min,
        max: fees.filing.electronic + additionalClassesFee + fees.registration + fees.attorneyFees.max
      },
      renewalFee: fees.renewal, // A cada 10 anos
      currency: 'BRL',
      notes: [
        'Valores baseados na tabela de retribuições do INPI para 2025',
        'Custos de advogado são estimativas e podem variar',
        'Taxas adicionais podem ser aplicáveis em caso de oposições ou exigências',
        'Renovação necessária a cada 10 anos'
      ]
    };
    
    console.log('Estimativa de custos concluída');
    
    return costs;
  } catch (error) {
    console.error('Erro na estimativa de custos:', error);
    throw error;
  }
}

/**
 * Gera relatório completo de viabilidade
 * @param {string} trademark - Marca a ser analisada
 * @param {string} domain - Domínio a ser verificado
 * @returns {Promise<Object>} - Relatório completo
 */
export async function generateViabilityReport(trademark = 'PowerPrev', domain = 'powerprev') {
  try {
    console.log(`Gerando relatório de viabilidade para "${trademark}"...`);
    
    // Realizar todas as verificações
    const trademarkSearch = await searchTrademarkAvailability();
    const distinctivenessAnalysis = await analyzeDistinctiveness(trademark);
    const domainCheck = await checkDomainAvailability(domain);
    const costEstimate = await estimateRegistrationCosts();
    
    // Analisar resultados
    const hasExactMatches = trademarkSearch.exactMatches.length > 0;
    const hasSimilarMatches = trademarkSearch.similarMatches.length > 0;
    const distinctivenessScore = distinctivenessAnalysis.distinctivenessScore;
    const primaryDomainAvailable = domainCheck.availability['.com.br']?.isAvailable || false;
    
    // Determinar viabilidade geral
    let overallViability;
    let riskLevel;
    
    if (hasExactMatches) {
      overallViability = 'Baixa';
      riskLevel = 'Alto';
    } else if (hasSimilarMatches && distinctivenessScore < 50) {
      overallViability = 'Média-Baixa';
      riskLevel = 'Médio-Alto';
    } else if (hasSimilarMatches || distinctivenessScore < 50) {
      overallViability = 'Média';
      riskLevel = 'Médio';
    } else if (!primaryDomainAvailable) {
      overallViability = 'Média-Alta';
      riskLevel = 'Médio-Baixo';
    } else {
      overallViability = 'Alta';
      riskLevel = 'Baixo';
    }
    
    // Compilar relatório
    const report = {
      trademark,
      domain,
      reportDate: new Date().toISOString(),
      overallViability,
      riskLevel,
      trademarkSearch,
      distinctivenessAnalysis,
      domainCheck,
      costEstimate,
      recommendations: []
    };
    
    // Adicionar recomendações
    if (hasExactMatches) {
      report.recommendations.push('Considerar alteração da marca devido a registros idênticos existentes');
    }
    
    if (hasSimilarMatches) {
      report.recommendations.push('Realizar análise jurídica detalhada das marcas similares para avaliar risco de oposição');
    }
    
    if (distinctivenessScore < 50) {
      report.recommendations.push('Considerar modificações para aumentar distintividade da marca');
    }
    
    if (!primaryDomainAvailable) {
      const availableExtensions = Object.entries(domainCheck.availability)
        .filter(([_, data]) => data.isAvailable)
        .map(([ext]) => ext);
      
      if (availableExtensions.length > 0) {
        report.recommendations.push(`Considerar registro do domínio com extensões disponíveis: ${availableExtensions.join(', ')}`);
      } else {
        report.recommendations.push('Considerar alteração do nome de domínio devido à indisponibilidade');
      }
    }
    
    // Adicionar próximos passos
    report.nextSteps = [];
    
    if (overallViability !== 'Baixa') {
      report.nextSteps.push('Consultar advogado especializado em propriedade intelectual');
      report.nextSteps.push('Preparar documentação para pedido de registro no INPI');
      
      if (primaryDomainAvailable) {
        report.nextSteps.push('Registrar domínio principal imediatamente');
      }
      
      report.nextSteps.push('Considerar registro em múltiplas classes para proteção ampla');
    } else {
      report.nextSteps.push('Reconsiderar nome da marca');
      report.nextSteps.push('Realizar nova busca de viabilidade após alterações');
    }
    
    console.log('Relatório de viabilidade concluído');
    
    return report;
  } catch (error) {
    console.error('Erro na geração do relatório de viabilidade:', error);
    throw error;
  }
}

export default {
  searchTrademarkAvailability,
  analyzeDistinctiveness,
  checkDomainAvailability,
  estimateRegistrationCosts,
  generateViabilityReport,
  SEARCH_CONFIG
};
