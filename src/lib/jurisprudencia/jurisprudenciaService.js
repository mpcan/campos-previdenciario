// Módulo de Jurisprudência Básica para PowerPrev
// Implementação de web scraping ético para fontes públicas de jurisprudência previdenciária

import axios from 'axios';
import cheerio from 'cheerio';
import { saveItem, getItem, getAllItems, queryByIndex, STORES_ENUM } from '@/lib/pwa/indexedDB';

// Fontes de jurisprudência
const FONTES = {
  STF: 'stf',
  STJ: 'stj',
  TNU: 'tnu',
  TRF1: 'trf1',
  TRF2: 'trf2',
  TRF3: 'trf3',
  TRF4: 'trf4',
  TRF5: 'trf5'
};

/**
 * Busca jurisprudência em fontes públicas
 * @param {string} termo - Termo de busca
 * @param {Array} fontes - Lista de fontes para buscar
 * @param {boolean} usarCache - Se deve usar cache local
 * @returns {Promise<Array>} - Lista de jurisprudências encontradas
 */
export const buscarJurisprudencia = async (termo, fontes = Object.values(FONTES), usarCache = true) => {
  console.log(`Buscando jurisprudência para "${termo}" nas fontes: ${fontes.join(', ')}`);
  
  // Verificar cache primeiro se solicitado
  let resultadosCache = [];
  if (usarCache) {
    resultadosCache = await buscarJurisprudenciaCache(termo);
    console.log(`Encontrados ${resultadosCache.length} resultados em cache`);
  }
  
  // Se estiver offline, retornar apenas resultados do cache
  if (!navigator.onLine) {
    console.log('Dispositivo offline, retornando apenas resultados em cache');
    return resultadosCache;
  }
  
  // Buscar em fontes online
  const promessasBusca = fontes.map(fonte => {
    switch (fonte) {
      case FONTES.STF:
        return buscarSTF(termo);
      case FONTES.STJ:
        return buscarSTJ(termo);
      case FONTES.TNU:
        return buscarTNU(termo);
      case FONTES.TRF1:
      case FONTES.TRF2:
      case FONTES.TRF3:
      case FONTES.TRF4:
      case FONTES.TRF5:
        return buscarTRF(termo, fonte);
      default:
        console.warn(`Fonte desconhecida: ${fonte}`);
        return Promise.resolve([]);
    }
  });
  
  // Aguardar todas as buscas
  const resultadosPorFonte = await Promise.all(promessasBusca);
  
  // Combinar resultados
  const resultadosOnline = resultadosPorFonte.flat();
  console.log(`Encontrados ${resultadosOnline.length} resultados online`);
  
  // Salvar resultados no cache
  for (const resultado of resultadosOnline) {
    await saveItem(STORES_ENUM.JURISPRUDENCIAS, resultado);
  }
  
  // Combinar resultados online com cache, removendo duplicatas
  const todosResultados = [...resultadosOnline];
  
  // Adicionar resultados do cache que não estão nos resultados online
  for (const resultadoCache of resultadosCache) {
    const jaExiste = todosResultados.some(r => r.id === resultadoCache.id);
    if (!jaExiste) {
      todosResultados.push(resultadoCache);
    }
  }
  
  // Ordenar por data (mais recentes primeiro)
  todosResultados.sort((a, b) => {
    const dataA = new Date(a.data || a.dataJulgamento || a.dataConsulta);
    const dataB = new Date(b.data || b.dataJulgamento || b.dataConsulta);
    return dataB - dataA;
  });
  
  return todosResultados;
};

/**
 * Busca jurisprudência no cache local
 * @param {string} termo - Termo de busca
 * @returns {Promise<Array>} - Lista de jurisprudências encontradas no cache
 */
export const buscarJurisprudenciaCache = async (termo) => {
  try {
    // Obter todas as jurisprudências do cache
    const todasJurisprudencias = await getAllItems(STORES_ENUM.JURISPRUDENCIAS);
    
    // Filtrar por termo de busca
    const termoLower = termo.toLowerCase();
    const resultados = todasJurisprudencias.filter(jurisprudencia => {
      // Buscar em vários campos
      return (
        (jurisprudencia.titulo && jurisprudencia.titulo.toLowerCase().includes(termoLower)) ||
        (jurisprudencia.ementa && jurisprudencia.ementa.toLowerCase().includes(termoLower)) ||
        (jurisprudencia.relator && jurisprudencia.relator.toLowerCase().includes(termoLower)) ||
        (jurisprudencia.numero && jurisprudencia.numero.toLowerCase().includes(termoLower))
      );
    });
    
    return resultados;
  } catch (error) {
    console.error('Erro ao buscar jurisprudência no cache:', error);
    return [];
  }
};

/**
 * Busca jurisprudência no STF
 * @param {string} termo - Termo de busca
 * @returns {Promise<Array>} - Lista de jurisprudências encontradas
 */
export const buscarSTF = async (termo) => {
  try {
    console.log(`Buscando no STF: "${termo}"`);
    
    // URL de busca do STF
    const url = `https://jurisprudencia.stf.jus.br/pages/search?base=acordaos&pesquisa_inteiro_teor=false&sinonimo=true&plural=true&radicais=false&buscaExata=true&page=1&pageSize=10&queryString=${encodeURIComponent(termo)}`;
    
    // Realizar requisição
    const response = await axios.get(url);
    const html = response.data;
    
    // Parsear HTML
    const $ = cheerio.load(html);
    const resultados = [];
    
    // Extrair resultados
    $('.result-container').each((index, element) => {
      const titulo = $(element).find('.title').text().trim();
      const ementa = $(element).find('.ementa').text().trim();
      const relator = $(element).find('.relator').text().trim();
      const dataJulgamento = $(element).find('.date').text().trim();
      const link = $(element).find('.title a').attr('href');
      
      // Criar ID único
      const id = `stf-${Date.now()}-${index}`;
      
      resultados.push({
        id,
        titulo,
        ementa,
        relator,
        dataJulgamento,
        link,
        fonte: FONTES.STF,
        termo,
        dataConsulta: new Date().toISOString(),
        favorito: false
      });
    });
    
    console.log(`Encontrados ${resultados.length} resultados no STF`);
    return resultados;
  } catch (error) {
    console.error('Erro ao buscar no STF:', error);
    return [];
  }
};

/**
 * Busca jurisprudência no STJ
 * @param {string} termo - Termo de busca
 * @returns {Promise<Array>} - Lista de jurisprudências encontradas
 */
export const buscarSTJ = async (termo) => {
  try {
    console.log(`Buscando no STJ: "${termo}"`);
    
    // URL de busca do STJ
    const url = `https://scon.stj.jus.br/SCON/pesquisar.jsp?b=ACOR&livre=${encodeURIComponent(termo)}`;
    
    // Realizar requisição
    const response = await axios.get(url);
    const html = response.data;
    
    // Parsear HTML
    const $ = cheerio.load(html);
    const resultados = [];
    
    // Extrair resultados
    $('.docTitulo').each((index, element) => {
      const titulo = $(element).text().trim();
      const link = $(element).find('a').attr('href');
      
      // Extrair informações adicionais
      const docDados = $(element).next('.docDados');
      const dataJulgamento = docDados.find('span:contains("Data do Julgamento:")').text().replace('Data do Julgamento:', '').trim();
      const relator = docDados.find('span:contains("Relator:")').text().replace('Relator:', '').trim();
      
      // Extrair ementa
      const ementa = docDados.next('.docEmenta').text().trim();
      
      // Criar ID único
      const id = `stj-${Date.now()}-${index}`;
      
      resultados.push({
        id,
        titulo,
        ementa,
        relator,
        dataJulgamento,
        link,
        fonte: FONTES.STJ,
        termo,
        dataConsulta: new Date().toISOString(),
        favorito: false
      });
    });
    
    console.log(`Encontrados ${resultados.length} resultados no STJ`);
    return resultados;
  } catch (error) {
    console.error('Erro ao buscar no STJ:', error);
    return [];
  }
};

/**
 * Busca jurisprudência na TNU
 * @param {string} termo - Termo de busca
 * @returns {Promise<Array>} - Lista de jurisprudências encontradas
 */
export const buscarTNU = async (termo) => {
  try {
    console.log(`Buscando na TNU: "${termo}"`);
    
    // URL de busca da TNU
    const url = `https://www2.jf.jus.br/juris/tnu/Resposta?tipo=1&livre=${encodeURIComponent(termo)}`;
    
    // Realizar requisição
    const response = await axios.get(url);
    const html = response.data;
    
    // Parsear HTML
    const $ = cheerio.load(html);
    const resultados = [];
    
    // Extrair resultados
    $('table.resultadoJuris tr:not(:first-child)').each((index, element) => {
      const colunas = $(element).find('td');
      
      const numero = $(colunas[0]).text().trim();
      const relator = $(colunas[1]).text().trim();
      const dataJulgamento = $(colunas[2]).text().trim();
      const titulo = `PEDILEF ${numero}`;
      
      // Link para o documento
      const link = $(colunas[0]).find('a').attr('href');
      
      // Criar ID único
      const id = `tnu-${Date.now()}-${index}`;
      
      resultados.push({
        id,
        titulo,
        numero,
        relator,
        dataJulgamento,
        link,
        fonte: FONTES.TNU,
        termo,
        dataConsulta: new Date().toISOString(),
        favorito: false
      });
    });
    
    console.log(`Encontrados ${resultados.length} resultados na TNU`);
    return resultados;
  } catch (error) {
    console.error('Erro ao buscar na TNU:', error);
    return [];
  }
};

/**
 * Busca jurisprudência em um TRF específico
 * @param {string} termo - Termo de busca
 * @param {string} trf - Código do TRF (trf1, trf2, etc.)
 * @returns {Promise<Array>} - Lista de jurisprudências encontradas
 */
export const buscarTRF = async (termo, trf) => {
  try {
    console.log(`Buscando no ${trf.toUpperCase()}: "${termo}"`);
    
    // URLs de busca dos TRFs
    const urlsPorTRF = {
      [FONTES.TRF1]: `https://jurisprudencia.trf1.jus.br/busca/?q=${encodeURIComponent(termo)}`,
      [FONTES.TRF2]: `https://jurisprudencia.trf2.jus.br/search?q=${encodeURIComponent(termo)}`,
      [FONTES.TRF3]: `https://web.trf3.jus.br/base-textual/Home/ListaResumida?np=${encodeURIComponent(termo)}`,
      [FONTES.TRF4]: `https://jurisprudencia.trf4.jus.br/pesquisa/pesquisa.php?tipo=1&livreConsulta=${encodeURIComponent(termo)}`,
      [FONTES.TRF5]: `https://www4.trf5.jus.br/Jurisprudencia/JurisServlet?op=Pesquisar&tipo=1&expressao=${encodeURIComponent(termo)}`
    };
    
    // Verificar se o TRF é suportado
    if (!urlsPorTRF[trf]) {
      console.warn(`TRF não suportado: ${trf}`);
      return [];
    }
    
    // Realizar requisição
    const response = await axios.get(urlsPorTRF[trf]);
    const html = response.data;
    
    // Parsear HTML (cada TRF tem uma estrutura diferente)
    const $ = cheerio.load(html);
    const resultados = [];
    
    // Extrair resultados de acordo com o TRF
    switch (trf) {
      case FONTES.TRF1:
        $('.documento').each((index, element) => {
          const titulo = $(element).find('.titulo-documento').text().trim();
          const ementa = $(element).find('.ementa').text().trim();
          const metadados = $(element).find('.metadados').text().trim();
          
          // Extrair relator e data de julgamento dos metadados
          const relatorMatch = metadados.match(/Relator\(a\):\s*([^,]+)/i);
          const dataMatch = metadados.match(/Data da Decisão:\s*(\d{2}\/\d{2}\/\d{4})/i);
          
          const relator = relatorMatch ? relatorMatch[1].trim() : '';
          const dataJulgamento = dataMatch ? dataMatch[1].trim() : '';
          
          // Link para o documento
          const link = $(element).find('.titulo-documento a').attr('href');
          
          // Criar ID único
          const id = `trf1-${Date.now()}-${index}`;
          
          resultados.push({
            id,
            titulo,
            ementa,
            relator,
            dataJulgamento,
            link,
            fonte: FONTES.TRF1,
            termo,
            dataConsulta: new Date().toISOString(),
            favorito: false
          });
        });
        break;
        
      case FONTES.TRF2:
        // Implementação para TRF2
        $('.search-result').each((index, element) => {
          const titulo = $(element).find('h3').text().trim();
          const ementa = $(element).find('.ementa').text().trim();
          const relator = $(element).find('.relator').text().replace('Relator:', '').trim();
          const dataJulgamento = $(element).find('.data-julgamento').text().replace('Data de Julgamento:', '').trim();
          const link = $(element).find('h3 a').attr('href');
          
          // Criar ID único
          const id = `trf2-${Date.now()}-${index}`;
          
          resultados.push({
            id,
            titulo,
            ementa,
            relator,
            dataJulgamento,
            link,
            fonte: FONTES.TRF2,
            termo,
            dataConsulta: new Date().toISOString(),
            favorito: false
          });
        });
        break;
        
      // Implementações para os demais TRFs seguiriam padrão similar
      // Omitidas para brevidade
        
      default:
        console.warn(`Extração não implementada para ${trf.toUpperCase()}`);
    }
    
    console.log(`Encontrados ${resultados.length} resultados no ${trf.toUpperCase()}`);
    return resultados;
  } catch (error) {
    console.error(`Erro ao buscar no ${trf.toUpperCase()}:`, error);
    return [];
  }
};

/**
 * Marca uma jurisprudência como favorita
 * @param {string} id - ID da jurisprudência
 * @param {boolean} favorito - Status de favorito
 * @returns {Promise<Object>} - Jurisprudência atualizada
 */
export const marcarFavorito = async (id, favorito = true) => {
  try {
    // Obter jurisprudência
    const jurisprudencia = await getItem(STORES_ENUM.JURISPRUDENCIAS, id);
    
    if (!jurisprudencia) {
      throw new Error(`Jurisprudência não encontrada: ${id}`);
    }
    
    // Atualizar status de favorito
    jurisprudencia.favorito = favorito;
    
    // Salvar alteração
    await saveItem(STORES_ENUM.JURISPRUDENCIAS, jurisprudencia);
    
    return jurisprudencia;
  } catch (error) {
    console.error('Erro ao marcar favorito:', error);
    throw error;
  }
};

/**
 * Adiciona uma anotação a uma jurisprudência
 * @param {string} id - ID da jurisprudência
 * @param {string} anotacao - Texto da anotação
 * @returns {Promise<Object>} - Jurisprudência atualizada
 */
export const adicionarAnotacao = async (id, anotacao) => {
  try {
    // Obter jurisprudência
    const jurisprudencia = await getItem(STORES_ENUM.JURISPRUDENCIAS, id);
    
    if (!jurisprudencia) {
      throw new Error(`Jurisprudência não encontrada: ${id}`);
    }
    
    // Inicializar array de anotações se não existir
    if (!jurisprudencia.anotacoes) {
      jurisprudencia.anotacoes = [];
    }
    
    // Adicionar nova anotação
    jurisprudencia.anotacoes.push({
      id: `anotacao-${Date.now()}`,
      texto: anotacao,
      data: new Date().toISOString()
    });
    
    // Salvar alteração
    await saveItem(STORES_ENUM.JURISPRUDENCIAS, jurisprudencia);
    
    return jurisprudencia;
  } catch (error) {
    console.error('Erro ao adicionar anotação:', error);
    throw error;
  }
};

/**
 * Obtém todas as jurisprudências favoritas
 * @returns {Promise<Array>} - Lista de jurisprudências favoritas
 */
export const obterFavoritos = async () => {
  try {
    // Buscar por índice de favoritos
    return await queryByIndex(STORES_ENUM.JURISPRUDENCIAS, 'favorito', true);
  } catch (error) {
    console.error('Erro ao obter favoritos:', error);
    return [];
  }
};

/**
 * Exporta jurisprudências para formato CSV
 * @param {Array} jurisprudencias - Lista de jurisprudências para exportar
 * @returns {string} - Conteúdo CSV
 */
export const exportarCSV = (jurisprudencias) => {
  // Cabeçalho CSV
  const cabecalho = [
    'Título',
    'Ementa',
    'Relator',
    'Data de Julgamento',
    'Fonte',
    'Link',
    'Favorito',
    'Data da Consulta'
  ].join(',');
  
  // Linhas de dados
  const linhas = jurisprudencias.map(j => {
    return [
      `"${(j.titulo || '').replace(/"/g, '""')}"`,
      `"${(j.ementa || '').replace(/"/g, '""')}"`,
      `"${(j.relator || '').replace(/"/g, '""')}"`,
      `"${(j.dataJulgamento || '').replace(/"/g, '""')}"`,
      `"${(j.fonte || '').replace(/"/g, '""')}"`,
      `"${(j.link || '').replace(/"/g, '""')}"`,
      j.favorito ? 'Sim' : 'Não',
      `"${(j.dataConsulta || '').replace(/"/g, '""')}"`
    ].join(',');
  });
  
  // Combinar cabeçalho e linhas
  return [cabecalho, ...linhas].join('\n');
};

// Exportar constantes e funções
export const FONTES_ENUM = FONTES;

export default {
  buscarJurisprudencia,
  buscarJurisprudenciaCache,
  marcarFavorito,
  adicionarAnotacao,
  obterFavoritos,
  exportarCSV,
  FONTES: FONTES_ENUM
};
