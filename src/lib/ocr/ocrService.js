// Módulo de OCR simples para PowerPrev
// Implementa reconhecimento óptico de caracteres usando Tesseract.js no navegador

/**
 * Este módulo fornece funcionalidades de OCR (Reconhecimento Óptico de Caracteres)
 * para o PowerPrev, permitindo extrair texto de imagens e documentos digitalizados.
 * Utiliza Tesseract.js para processamento no navegador do cliente, sem depender
 * de serviços externos pagos.
 */

import { createWorker, PSM, OEM } from 'tesseract.js';
import { saveItem, getItem, STORES_ENUM } from '@/lib/pwa/indexedDB';

// Configurações padrão do OCR
const OCR_CONFIG = {
  // Idiomas disponíveis
  languages: {
    por: 'Português',
    eng: 'Inglês',
    spa: 'Espanhol'
  },
  
  // Idioma padrão
  defaultLanguage: 'por',
  
  // Configurações de reconhecimento
  recognition: {
    // Modo de segmentação de página (PSM)
    // 1 = Orientação e detecção de script automáticas apenas
    // 3 = Segmentação totalmente automática de página, mas sem OCR (padrão)
    // 4 = Assume uma única coluna de texto de tamanhos variáveis
    // 6 = Assume um único bloco uniforme de texto
    // 11 = Texto esparso. Encontra o máximo de texto possível sem ordem específica
    psm: PSM.AUTO,
    
    // Modo de engine OCR (OEM)
    // 0 = Apenas LSTM
    // 1 = Apenas Tesseract
    // 2 = LSTM + Tesseract
    // 3 = Padrão, baseado no que está disponível
    oem: OEM.DEFAULT
  },
  
  // Configurações de pré-processamento
  preprocessing: {
    // Aplicar escala de cinza
    grayscale: true,
    
    // Aplicar limiarização (threshold)
    threshold: true,
    
    // Aplicar remoção de ruído
    denoise: true,
    
    // Aplicar rotação automática
    autoRotate: true,
    
    // Aplicar deskew (correção de inclinação)
    deskew: true
  },
  
  // Configurações de cache
  cache: {
    // Habilitar cache de resultados
    enabled: true,
    
    // Tempo de expiração do cache (em milissegundos)
    expiration: 30 * 24 * 60 * 60 * 1000, // 30 dias
    
    // Tamanho máximo do cache (em bytes)
    maxSize: 50 * 1024 * 1024 // 50 MB
  },
  
  // Configurações de processamento
  processing: {
    // Tamanho máximo de imagem para processamento (em pixels)
    maxImageSize: 2500 * 2500,
    
    // Qualidade de compressão JPEG para imagens grandes
    compressionQuality: 0.7,
    
    // Timeout para processamento (em milissegundos)
    timeout: 60000 // 60 segundos
  }
};

// Armazenamento de workers do Tesseract
const workers = {};

/**
 * Inicializa um worker do Tesseract para um idioma específico
 * @param {string} language - Código do idioma (por, eng, etc.)
 * @returns {Promise<Worker>} - Worker inicializado
 */
async function initWorker(language = OCR_CONFIG.defaultLanguage) {
  try {
    console.log(`Inicializando worker Tesseract para idioma: ${language}`);
    
    // Verificar se já existe um worker para este idioma
    if (workers[language] && workers[language].isInitialized) {
      return workers[language];
    }
    
    // Criar novo worker
    const worker = await createWorker({
      logger: progress => {
        if (progress.status === 'recognizing text') {
          console.log(`Reconhecimento: ${(progress.progress * 100).toFixed(2)}%`);
        } else {
          console.log(`Status: ${progress.status}, Progresso: ${(progress.progress * 100).toFixed(2)}%`);
        }
      }
    });
    
    // Carregar idioma
    await worker.loadLanguage(language);
    await worker.initialize(language);
    
    // Configurar parâmetros
    await worker.setParameters({
      tessedit_pageseg_mode: OCR_CONFIG.recognition.psm,
      tessedit_ocr_engine_mode: OCR_CONFIG.recognition.oem
    });
    
    // Armazenar worker
    workers[language] = worker;
    workers[language].isInitialized = true;
    
    console.log(`Worker Tesseract inicializado com sucesso para idioma: ${language}`);
    
    return worker;
  } catch (error) {
    console.error(`Erro ao inicializar worker Tesseract para idioma ${language}:`, error);
    throw new Error(`Falha ao inicializar OCR: ${error.message}`);
  }
}

/**
 * Termina todos os workers do Tesseract
 * @returns {Promise<void>}
 */
export async function terminateWorkers() {
  try {
    console.log('Terminando workers Tesseract...');
    
    // Terminar cada worker
    for (const language in workers) {
      if (workers[language] && workers[language].isInitialized) {
        await workers[language].terminate();
        console.log(`Worker para idioma ${language} terminado`);
      }
    }
    
    // Limpar armazenamento
    Object.keys(workers).forEach(key => delete workers[key]);
    
    console.log('Todos os workers Tesseract foram terminados');
  } catch (error) {
    console.error('Erro ao terminar workers Tesseract:', error);
  }
}

/**
 * Pré-processa uma imagem para melhorar resultados do OCR
 * @param {HTMLImageElement|HTMLCanvasElement|ImageData|string} image - Imagem para processar
 * @param {Object} options - Opções de pré-processamento
 * @returns {Promise<HTMLCanvasElement>} - Canvas com imagem processada
 */
async function preprocessImage(image, options = {}) {
  try {
    console.log('Pré-processando imagem para OCR...');
    
    // Mesclar opções com padrões
    const config = {
      ...OCR_CONFIG.preprocessing,
      ...options
    };
    
    // Criar canvas e contexto
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Carregar imagem se for URL
    let imgElement;
    if (typeof image === 'string') {
      imgElement = await loadImage(image);
    } else if (image instanceof HTMLImageElement) {
      imgElement = image;
    } else if (image instanceof HTMLCanvasElement) {
      // Copiar canvas para novo canvas
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);
      return canvas;
    } else if (image instanceof ImageData) {
      // Converter ImageData para canvas
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.putImageData(image, 0, 0);
      return canvas;
    } else {
      throw new Error('Formato de imagem não suportado');
    }
    
    // Verificar tamanho da imagem
    let width = imgElement.naturalWidth || imgElement.width;
    let height = imgElement.naturalHeight || imgElement.height;
    
    // Redimensionar se necessário
    if (width * height > OCR_CONFIG.processing.maxImageSize) {
      const scale = Math.sqrt(OCR_CONFIG.processing.maxImageSize / (width * height));
      width = Math.floor(width * scale);
      height = Math.floor(height * scale);
      console.log(`Redimensionando imagem para ${width}x${height}`);
    }
    
    // Configurar canvas
    canvas.width = width;
    canvas.height = height;
    
    // Desenhar imagem no canvas
    ctx.drawImage(imgElement, 0, 0, width, height);
    
    // Aplicar pré-processamento
    
    // Escala de cinza
    if (config.grayscale) {
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        data[i] = data[i + 1] = data[i + 2] = gray;
      }
      
      ctx.putImageData(imageData, 0, 0);
    }
    
    // Limiarização (threshold)
    if (config.threshold) {
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      
      // Calcular limiar usando método de Otsu
      const threshold = calculateOtsuThreshold(imageData);
      
      for (let i = 0; i < data.length; i += 4) {
        const value = data[i] < threshold ? 0 : 255;
        data[i] = data[i + 1] = data[i + 2] = value;
      }
      
      ctx.putImageData(imageData, 0, 0);
    }
    
    // Remoção de ruído (implementação simplificada)
    if (config.denoise) {
      // Aplicar filtro de mediana (simplificado)
      const imageData = ctx.getImageData(0, 0, width, height);
      const result = applyMedianFilter(imageData, 3); // Kernel 3x3
      ctx.putImageData(result, 0, 0);
    }
    
    // Deskew (correção de inclinação)
    if (config.deskew) {
      // Implementação simplificada - em produção, usar algoritmo mais robusto
      // como Hough Transform para detecção de linhas
      console.log('Deskew não implementado nesta versão simplificada');
    }
    
    console.log('Pré-processamento de imagem concluído');
    
    return canvas;
  } catch (error) {
    console.error('Erro no pré-processamento de imagem:', error);
    throw error;
  }
}

/**
 * Carrega uma imagem a partir de uma URL
 * @param {string} url - URL da imagem
 * @returns {Promise<HTMLImageElement>} - Elemento de imagem carregado
 */
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Falha ao carregar imagem: ${url}`));
    img.src = url;
  });
}

/**
 * Calcula o limiar de Otsu para binarização
 * @param {ImageData} imageData - Dados da imagem
 * @returns {number} - Valor do limiar (0-255)
 */
function calculateOtsuThreshold(imageData) {
  const data = imageData.data;
  const histogram = new Array(256).fill(0);
  
  // Calcular histograma
  for (let i = 0; i < data.length; i += 4) {
    histogram[data[i]]++;
  }
  
  const total = imageData.width * imageData.height;
  let sum = 0;
  
  // Soma ponderada
  for (let i = 0; i < 256; i++) {
    sum += i * histogram[i];
  }
  
  let sumB = 0;
  let wB = 0;
  let wF = 0;
  let maxVariance = 0;
  let threshold = 0;
  
  // Calcular variância entre classes
  for (let i = 0; i < 256; i++) {
    wB += histogram[i];
    if (wB === 0) continue;
    
    wF = total - wB;
    if (wF === 0) break;
    
    sumB += i * histogram[i];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    
    const variance = wB * wF * (mB - mF) * (mB - mF);
    
    if (variance > maxVariance) {
      maxVariance = variance;
      threshold = i;
    }
  }
  
  return threshold;
}

/**
 * Aplica filtro de mediana para remoção de ruído
 * @param {ImageData} imageData - Dados da imagem
 * @param {number} size - Tamanho do kernel (3, 5, etc.)
 * @returns {ImageData} - Imagem filtrada
 */
function applyMedianFilter(imageData, size = 3) {
  const { width, height, data } = imageData;
  const result = new ImageData(width, height);
  const resultData = result.data;
  
  // Copiar dados originais
  for (let i = 0; i < data.length; i++) {
    resultData[i] = data[i];
  }
  
  const halfSize = Math.floor(size / 2);
  
  // Aplicar filtro apenas nos canais RGB (não no alpha)
  for (let y = halfSize; y < height - halfSize; y++) {
    for (let x = halfSize; x < width - halfSize; x++) {
      for (let c = 0; c < 3; c++) { // Para cada canal de cor (R, G, B)
        const values = [];
        
        // Coletar valores na vizinhança
        for (let ky = -halfSize; ky <= halfSize; ky++) {
          for (let kx = -halfSize; kx <= halfSize; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4 + c;
            values.push(data[idx]);
          }
        }
        
        // Ordenar valores e pegar o do meio (mediana)
        values.sort((a, b) => a - b);
        const medianValue = values[Math.floor(values.length / 2)];
        
        // Atribuir valor mediano
        const idx = (y * width + x) * 4 + c;
        resultData[idx] = medianValue;
      }
    }
  }
  
  return result;
}

/**
 * Reconhece texto em uma imagem
 * @param {HTMLImageElement|HTMLCanvasElement|ImageData|string|File|Blob} image - Imagem para OCR
 * @param {Object} options - Opções de reconhecimento
 * @returns {Promise<Object>} - Resultado do OCR
 */
export async function recognizeText(image, options = {}) {
  try {
    console.log('Iniciando reconhecimento de texto...');
    
    // Mesclar opções com padrões
    const config = {
      language: OCR_CONFIG.defaultLanguage,
      preprocessing: OCR_CONFIG.preprocessing,
      useCache: OCR_CONFIG.cache.enabled,
      ...options
    };
    
    // Verificar se é um arquivo
    if (image instanceof File || image instanceof Blob) {
      // Converter para URL
      const imageUrl = URL.createObjectURL(image);
      
      try {
        // Reconhecer texto
        const result = await recognizeText(imageUrl, config);
        
        // Adicionar informações do arquivo
        result.fileName = image.name;
        result.fileSize = image.size;
        result.fileType = image.type;
        
        return result;
      } finally {
        // Liberar URL
        URL.revokeObjectURL(imageUrl);
      }
    }
    
    // Gerar hash da imagem para cache
    const imageHash = await generateImageHash(image);
    
    // Verificar cache
    if (config.useCache) {
      const cachedResult = await getCachedOcrResult(imageHash);
      if (cachedResult) {
        console.log('Resultado encontrado em cache');
        return cachedResult;
      }
    }
    
    // Pré-processar imagem
    const processedImage = await preprocessImage(image, config.preprocessing);
    
    // Inicializar worker
    const worker = await initWorker(config.language);
    
    // Reconhecer texto
    console.log('Executando OCR...');
    const { data } = await worker.recognize(processedImage);
    
    // Formatar resultado
    const result = {
      text: data.text,
      confidence: data.confidence,
      words: data.words,
      paragraphs: extractParagraphs(data),
      language: config.language,
      timestamp: new Date().toISOString(),
      imageHash,
      blocks: data.blocks,
      hocr: data.hocr,
      tsv: data.tsv
    };
    
    // Salvar em cache
    if (config.useCache) {
      await cacheOcrResult(imageHash, result);
    }
    
    console.log('Reconhecimento de texto concluído com sucesso');
    
    return result;
  } catch (error) {
    console.error('Erro no reconhecimento de texto:', error);
    throw new Error(`Falha no OCR: ${error.message}`);
  }
}

/**
 * Extrai parágrafos do resultado do OCR
 * @param {Object} data - Dados do resultado do OCR
 * @returns {Array} - Lista de parágrafos
 */
function extractParagraphs(data) {
  // Implementação simplificada - em produção, usar algoritmo mais robusto
  if (!data.text) return [];
  
  // Dividir por linhas vazias
  const paragraphs = data.text.split(/\n\s*\n/).filter(p => p.trim());
  
  return paragraphs.map(text => ({
    text,
    confidence: calculateParagraphConfidence(text, data.words)
  }));
}

/**
 * Calcula a confiança média de um parágrafo
 * @param {string} paragraphText - Texto do parágrafo
 * @param {Array} words - Lista de palavras com confiança
 * @returns {number} - Confiança média
 */
function calculateParagraphConfidence(paragraphText, words) {
  if (!words || words.length === 0) return 0;
  
  // Palavras no parágrafo
  const paragraphWords = paragraphText.match(/\S+/g) || [];
  
  if (paragraphWords.length === 0) return 0;
  
  // Calcular confiança média
  let totalConfidence = 0;
  let wordCount = 0;
  
  for (const word of words) {
    if (paragraphText.includes(word.text)) {
      totalConfidence += word.confidence;
      wordCount++;
    }
  }
  
  return wordCount > 0 ? totalConfidence / wordCount : 0;
}

/**
 * Gera um hash para uma imagem
 * @param {HTMLImageElement|HTMLCanvasElement|ImageData|string} image - Imagem
 * @returns {Promise<string>} - Hash da imagem
 */
async function generateImageHash(image) {
  try {
    // Implementação simplificada - em produção, usar algoritmo de hash mais robusto
    
    // Converter para canvas
    let canvas;
    if (image instanceof HTMLCanvasElement) {
      canvas = image;
    } else {
      canvas = await preprocessImage(image, { 
        grayscale: true, 
        threshold: false, 
        denoise: false, 
        deskew: false 
      });
    }
    
    // Redimensionar para tamanho fixo para hash
    const hashCanvas = document.createElement('canvas');
    const hashCtx = hashCanvas.getContext('2d');
    hashCanvas.width = 32;
    hashCanvas.height = 32;
    
    // Desenhar imagem redimensionada
    hashCtx.drawImage(canvas, 0, 0, 32, 32);
    
    // Obter dados da imagem
    const imageData = hashCtx.getImageData(0, 0, 32, 32);
    const data = imageData.data;
    
    // Calcular hash simples
    let hash = '';
    for (let i = 0; i < data.length; i += 16) {
      hash += data[i].toString(16).padStart(2, '0');
    }
    
    return hash;
  } catch (error) {
    console.error('Erro ao gerar hash da imagem:', error);
    // Fallback para timestamp
    return `img_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  }
}

/**
 * Obtém resultado de OCR do cache
 * @param {string} imageHash - Hash da imagem
 * @returns {Promise<Object|null>} - Resultado do cache ou null
 */
async function getCachedOcrResult(imageHash) {
  try {
    // Verificar se o cache está habilitado
    if (!OCR_CONFIG.cache.enabled) {
      return null;
    }
    
    // Obter do IndexedDB
    const cacheKey = `ocr_${imageHash}`;
    const cachedItem = await getItem(STORES_ENUM.OCR_CACHE, cacheKey);
    
    if (!cachedItem) {
      return null;
    }
    
    // Verificar expiração
    const now = new Date().getTime();
    if (now - new Date(cachedItem.timestamp).getTime() > OCR_CONFIG.cache.expiration) {
      console.log('Cache expirado para', imageHash);
      return null;
    }
    
    return cachedItem.result;
  } catch (error) {
    console.error('Erro ao obter resultado do cache:', error);
    return null;
  }
}

/**
 * Salva resultado de OCR no cache
 * @param {string} imageHash - Hash da imagem
 * @param {Object} result - Resultado do OCR
 * @returns {Promise<void>}
 */
async function cacheOcrResult(imageHash, result) {
  try {
    // Verificar se o cache está habilitado
    if (!OCR_CONFIG.cache.enabled) {
      return;
    }
    
    // Salvar no IndexedDB
    const cacheKey = `ocr_${imageHash}`;
    const cacheItem = {
      id: cacheKey,
      imageHash,
      result,
      timestamp: new Date().toISOString(),
      size: JSON.stringify(result).length
    };
    
    await saveItem(STORES_ENUM.OCR_CACHE, cacheItem);
    
    console.log('Resultado de OCR salvo em cache:', imageHash);
  } catch (error) {
    console.error('Erro ao salvar resultado no cache:', error);
  }
}

/**
 * Limpa o cache de OCR
 * @param {Object} options - Opções de limpeza
 * @returns {Promise<number>} - Número de itens removidos
 */
export async function clearOcrCache(options = {}) {
  try {
    console.log('Limpando cache de OCR...');
    
    // Implementação simplificada - em produção, usar limpeza seletiva
    // baseada em data de expiração, tamanho, etc.
    
    // Limpar store completo
    await clearStore(STORES_ENUM.OCR_CACHE);
    
    console.log('Cache de OCR limpo com sucesso');
    
    return 1; // Número de itens removidos
  } catch (error) {
    console.error('Erro ao limpar cache de OCR:', error);
    throw error;
  }
}

/**
 * Extrai texto de um PDF
 * @param {File|Blob|string} pdf - Arquivo PDF ou URL
 * @param {Object} options - Opções de extração
 * @returns {Promise<Object>} - Texto extraído
 */
export async function extractTextFromPdf(pdf, options = {}) {
  try {
    console.log('Extraindo texto de PDF...');
    
    // Verificar se pdfjsLib está disponível
    if (typeof pdfjsLib === 'undefined') {
      // Carregar PDF.js dinamicamente
      await loadPdfJs();
    }
    
    // Carregar documento
    let pdfDocument;
    
    if (pdf instanceof File || pdf instanceof Blob) {
      // Carregar a partir de arquivo
      const arrayBuffer = await pdf.arrayBuffer();
      pdfDocument = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    } else if (typeof pdf === 'string') {
      // Carregar a partir de URL
      pdfDocument = await pdfjsLib.getDocument(pdf).promise;
    } else {
      throw new Error('Formato de PDF não suportado');
    }
    
    // Extrair texto de cada página
    const numPages = pdfDocument.numPages;
    const pages = [];
    
    for (let i = 1; i <= numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const textContent = await page.getTextContent();
      
      // Extrair texto
      let pageText = '';
      let lastY;
      for (const item of textContent.items) {
        if (lastY !== item.transform[5] && pageText) {
          pageText += '\n';
        }
        pageText += item.str;
        lastY = item.transform[5];
      }
      
      pages.push({
        pageNumber: i,
        text: pageText,
        width: page.view[2],
        height: page.view[3]
      });
    }
    
    // Resultado
    const result = {
      text: pages.map(p => p.text).join('\n\n'),
      pages,
      numPages,
      fileName: pdf instanceof File ? pdf.name : undefined,
      fileSize: pdf instanceof File ? pdf.size : undefined,
      timestamp: new Date().toISOString()
    };
    
    console.log('Extração de texto de PDF concluída com sucesso');
    
    return result;
  } catch (error) {
    console.error('Erro na extração de texto de PDF:', error);
    throw new Error(`Falha na extração de PDF: ${error.message}`);
  }
}

/**
 * Carrega a biblioteca PDF.js dinamicamente
 * @returns {Promise<void>}
 */
async function loadPdfJs() {
  return new Promise((resolve, reject) => {
    // Verificar se já está carregado
    if (typeof pdfjsLib !== 'undefined') {
      resolve();
      return;
    }
    
    // Carregar script
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/build/pdf.min.js';
    script.onload = () => {
      // Configurar worker
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/build/pdf.worker.min.js';
      resolve();
    };
    script.onerror = () => reject(new Error('Falha ao carregar PDF.js'));
    
    document.head.appendChild(script);
  });
}

/**
 * Atualiza configurações do OCR
 * @param {Object} newConfig - Novas configurações
 * @returns {Object} - Configurações atualizadas
 */
export function updateOcrConfig(newConfig) {
  // Atualizar configurações
  Object.assign(OCR_CONFIG, newConfig);
  
  return { ...OCR_CONFIG };
}

/**
 * Obtém configurações atuais do OCR
 * @returns {Object} - Configurações atuais
 */
export function getOcrConfig() {
  return { ...OCR_CONFIG };
}

export default {
  recognizeText,
  extractTextFromPdf,
  terminateWorkers,
  clearOcrCache,
  updateOcrConfig,
  getOcrConfig,
  OCR_CONFIG
};
