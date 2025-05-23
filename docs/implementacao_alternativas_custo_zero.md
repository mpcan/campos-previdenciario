# Guia de Implementação - Alternativas de Custo Zero para PowerPrev

Este documento fornece instruções práticas e detalhadas para implementar as alternativas de custo zero identificadas na análise crítica do projeto PowerPrev.

## 1. PWA com Modo Offline (Prioridade 1)

### 1.1 Configuração Inicial

```javascript
// Em next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true
});

module.exports = withPWA({
  // outras configurações
});
```

### 1.2 Service Worker para Caching

Crie um arquivo `public/sw.js`:

```javascript
const CACHE_NAME = 'powerprev-v1';
const urlsToCache = [
  '/',
  '/dashboard',
  '/clientes',
  '/processos',
  '/static/styles/main.css',
  '/static/scripts/main.js',
  '/static/images/logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return response;
          });
      })
  );
});
```

### 1.3 Armazenamento Local com IndexedDB

```javascript
// src/lib/indexedDB.ts
export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('PowerPrevDB', 1);
    
    request.onerror = (event) => {
      reject('Erro ao abrir banco de dados');
    };
    
    request.onsuccess = (event) => {
      const db = request.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = request.result;
      
      // Criar stores para dados offline
      db.createObjectStore('clientes', { keyPath: 'id' });
      db.createObjectStore('processos', { keyPath: 'id' });
      db.createObjectStore('mensagens', { keyPath: 'id' });
      db.createObjectStore('pendingSyncs', { keyPath: 'id', autoIncrement: true });
    };
  });
};

export const saveToIndexedDB = (storeName, data) => {
  return new Promise((resolve, reject) => {
    initDB().then((db) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(false);
    });
  });
};

export const getFromIndexedDB = (storeName, id) => {
  return new Promise((resolve, reject) => {
    initDB().then((db) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(null);
    });
  });
};

export const getAllFromIndexedDB = (storeName) => {
  return new Promise((resolve, reject) => {
    initDB().then((db) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject([]);
    });
  });
};
```

### 1.4 Sincronização Seletiva

```javascript
// src/lib/syncManager.ts
import { getAllFromIndexedDB, saveToIndexedDB } from './indexedDB';
import { supabaseClient } from './supabase/client';

export const syncData = async () => {
  if (!navigator.onLine) return false;
  
  try {
    // Sincronizar dados pendentes
    const pendingSyncs = await getAllFromIndexedDB('pendingSyncs');
    
    for (const sync of pendingSyncs) {
      const { table, operation, data, id } = sync;
      
      if (operation === 'insert') {
        await supabaseClient.from(table).insert(data);
      } else if (operation === 'update') {
        await supabaseClient.from(table).update(data).eq('id', data.id);
      } else if (operation === 'delete') {
        await supabaseClient.from(table).delete().eq('id', data.id);
      }
      
      // Remover da fila após sincronização
      const db = await initDB();
      const transaction = db.transaction('pendingSyncs', 'readwrite');
      const store = transaction.objectStore('pendingSyncs');
      store.delete(id);
    }
    
    // Baixar dados atualizados (apenas dados essenciais)
    const tables = ['clientes', 'processos', 'mensagens'];
    
    for (const table of tables) {
      // Limitar quantidade de dados baixados
      const { data, error } = await supabaseClient
        .from(table)
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(100);
      
      if (!error && data) {
        // Armazenar localmente
        for (const item of data) {
          await saveToIndexedDB(table, item);
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Erro na sincronização:', error);
    return false;
  }
};

// Adicionar à fila de sincronização quando offline
export const queueForSync = async (table, operation, data) => {
  await saveToIndexedDB('pendingSyncs', {
    table,
    operation,
    data,
    timestamp: new Date().toISOString()
  });
};

// Verificar conexão e sincronizar quando online
export const setupSyncListeners = () => {
  window.addEventListener('online', () => {
    syncData();
  });
  
  // Tentar sincronizar periodicamente
  setInterval(() => {
    if (navigator.onLine) {
      syncData();
    }
  }, 5 * 60 * 1000); // A cada 5 minutos
};
```

## 2. Jurisprudência Básica (Prioridade 2)

### 2.1 Web Scraping Ético

```javascript
// src/lib/jurisprudencia/scraper.ts
import axios from 'axios';
import cheerio from 'cheerio';
import { saveToIndexedDB } from '../indexedDB';

// Função para extrair jurisprudências do STJ
export const scrapSTJ = async (termo) => {
  try {
    const url = `https://scon.stj.jus.br/SCON/pesquisar.jsp?b=ACOR&livre=${encodeURIComponent(termo)}`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    const resultados = [];
    
    $('.docTitulo').each((i, element) => {
      const titulo = $(element).text().trim();
      const link = $(element).find('a').attr('href');
      const dataJulgamento = $(element).next('.docDados').find('span:contains("Data do Julgamento:")').text();
      const relator = $(element).next('.docDados').find('span:contains("Relator:")').text();
      
      resultados.push({
        id: `stj-${Date.now()}-${i}`,
        titulo,
        link,
        dataJulgamento,
        relator,
        fonte: 'STJ',
        termo,
        dataConsulta: new Date().toISOString()
      });
    });
    
    // Armazenar resultados localmente
    for (const resultado of resultados) {
      await saveToIndexedDB('jurisprudencias', resultado);
    }
    
    return resultados;
  } catch (error) {
    console.error('Erro ao consultar STJ:', error);
    return [];
  }
};

// Função para extrair jurisprudências do TRF
export const scrapTRF = async (termo) => {
  // Implementação similar para TRF
};
```

### 2.2 Sistema de Busca Básico

```javascript
// src/lib/jurisprudencia/search.ts
import { getAllFromIndexedDB, saveToIndexedDB } from '../indexedDB';
import { scrapSTJ, scrapTRF } from './scraper';

export const searchJurisprudencia = async (termo, fontes = ['local', 'stj', 'trf']) => {
  const resultados = [];
  
  // Buscar primeiro no cache local
  if (fontes.includes('local')) {
    const cached = await getAllFromIndexedDB('jurisprudencias');
    const filteredCache = cached.filter(item => 
      item.titulo.toLowerCase().includes(termo.toLowerCase()) ||
      (item.ementa && item.ementa.toLowerCase().includes(termo.toLowerCase()))
    );
    resultados.push(...filteredCache);
  }
  
  // Se online e solicitado, buscar em fontes externas
  if (navigator.onLine) {
    if (fontes.includes('stj')) {
      const stjResults = await scrapSTJ(termo);
      resultados.push(...stjResults);
    }
    
    if (fontes.includes('trf')) {
      const trfResults = await scrapTRF(termo);
      resultados.push(...trfResults);
    }
  }
  
  // Remover duplicados
  const uniqueResults = resultados.filter((item, index, self) =>
    index === self.findIndex((t) => t.titulo === item.titulo)
  );
  
  return uniqueResults;
};

// Salvar jurisprudência como favorita
export const saveJurisprudenciaFavorita = async (jurisprudencia) => {
  jurisprudencia.favorito = true;
  await saveToIndexedDB('jurisprudencias', jurisprudencia);
  return true;
};

// Adicionar anotação a uma jurisprudência
export const addAnotacao = async (jurisprudenciaId, anotacao) => {
  const jurisprudencia = await getFromIndexedDB('jurisprudencias', jurisprudenciaId);
  if (!jurisprudencia) return false;
  
  jurisprudencia.anotacoes = jurisprudencia.anotacoes || [];
  jurisprudencia.anotacoes.push({
    texto: anotacao,
    data: new Date().toISOString()
  });
  
  await saveToIndexedDB('jurisprudencias', jurisprudencia);
  return true;
};
```

## 3. OCR Simples (Prioridade 3)

### 3.1 Integração com Tesseract.js

```javascript
// src/lib/ocr/documentScanner.ts
import Tesseract from 'tesseract.js';
import { saveToIndexedDB } from '../indexedDB';

export const processDocument = async (imageFile, documentType = 'generic') => {
  try {
    // Mostrar progresso ao usuário
    const progressCallback = (progress) => {
      console.log('Progresso OCR:', progress);
      // Atualizar UI com progresso
    };
    
    // Processar imagem com Tesseract
    const result = await Tesseract.recognize(
      imageFile,
      'por', // Português
      { 
        logger: progressCallback,
        // Otimizações para melhorar performance
        workerOptions: {
          corePath: '/tesseract/tesseract-core.wasm.js',
          langPath: '/tesseract/lang-data'
        }
      }
    );
    
    const extractedText = result.data.text;
    
    // Extrair dados específicos baseado no tipo de documento
    let extractedData = {};
    
    if (documentType === 'cnis') {
      extractedData = extractCNISData(extractedText);
    } else if (documentType === 'laudo') {
      extractedData = extractLaudoData(extractedText);
    } else {
      extractedData = { fullText: extractedText };
    }
    
    // Salvar resultado
    const documentData = {
      id: `doc-${Date.now()}`,
      type: documentType,
      extractedText,
      extractedData,
      confidence: result.data.confidence,
      processedAt: new Date().toISOString()
    };
    
    await saveToIndexedDB('documentos_processados', documentData);
    return documentData;
    
  } catch (error) {
    console.error('Erro no processamento OCR:', error);
    return null;
  }
};

// Funções específicas para extrair dados de diferentes tipos de documentos
const extractCNISData = (text) => {
  // Extrair NIT/PIS
  const nitMatch = text.match(/NIT:\s*(\d+)/i) || text.match(/PIS\/PASEP:\s*(\d+)/i);
  const nit = nitMatch ? nitMatch[1] : null;
  
  // Extrair nome
  const nomeMatch = text.match(/Nome:\s*([^\n]+)/i);
  const nome = nomeMatch ? nomeMatch[1].trim() : null;
  
  // Extrair data de nascimento
  const nascimentoMatch = text.match(/Nascimento:\s*(\d{2}\/\d{2}\/\d{4})/i);
  const dataNascimento = nascimentoMatch ? nascimentoMatch[1] : null;
  
  // Extrair vínculos
  const vinculos = [];
  const vinculosMatches = text.matchAll(/Período:\s*(\d{2}\/\d{2}\/\d{4})\s*a\s*(\d{2}\/\d{2}\/\d{4}|\d{2}\/\d{2}\/----)\s*Empregador:\s*([^\n]+)/gi);
  
  for (const match of vinculosMatches) {
    vinculos.push({
      inicio: match[1],
      fim: match[2],
      empregador: match[3].trim()
    });
  }
  
  return {
    nit,
    nome,
    dataNascimento,
    vinculos
  };
};

const extractLaudoData = (text) => {
  // Implementação similar para laudos médicos
  // ...
};
```

### 3.2 Processamento em Lote

```javascript
// src/lib/ocr/batchProcessor.ts
import { getAllFromIndexedDB, saveToIndexedDB } from '../indexedDB';
import { processDocument } from './documentScanner';

export const queueDocumentForProcessing = async (imageFile, documentType, metadata = {}) => {
  // Adicionar à fila de processamento
  await saveToIndexedDB('ocr_queue', {
    id: `queue-${Date.now()}`,
    file: imageFile,
    documentType,
    metadata,
    status: 'pending',
    createdAt: new Date().toISOString()
  });
  
  // Iniciar processamento se possível
  processQueue();
  
  return true;
};

// Processar documentos na fila um por um
export const processQueue = async () => {
  // Verificar se já está processando
  const processingStatus = localStorage.getItem('ocr_processing');
  if (processingStatus === 'true') return;
  
  localStorage.setItem('ocr_processing', 'true');
  
  try {
    // Obter próximo documento da fila
    const queue = await getAllFromIndexedDB('ocr_queue');
    const pendingItems = queue.filter(item => item.status === 'pending')
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    if (pendingItems.length === 0) {
      localStorage.setItem('ocr_processing', 'false');
      return;
    }
    
    const nextItem = pendingItems[0];
    
    // Atualizar status
    nextItem.status = 'processing';
    await saveToIndexedDB('ocr_queue', nextItem);
    
    // Processar documento
    const result = await processDocument(nextItem.file, nextItem.documentType);
    
    if (result) {
      // Associar metadados
      result.metadata = nextItem.metadata;
      await saveToIndexedDB('documentos_processados', result);
      
      // Marcar como concluído
      nextItem.status = 'completed';
      nextItem.resultId = result.id;
    } else {
      // Marcar como falha
      nextItem.status = 'failed';
      nextItem.error = 'Falha no processamento OCR';
    }
    
    await saveToIndexedDB('ocr_queue', nextItem);
    
    // Continuar processando a fila
    localStorage.setItem('ocr_processing', 'false');
    processQueue();
    
  } catch (error) {
    console.error('Erro no processamento em lote:', error);
    localStorage.setItem('ocr_processing', 'false');
  }
};

// Verificar e processar a fila periodicamente
export const setupQueueProcessor = () => {
  // Processar ao iniciar
  processQueue();
  
  // Verificar a cada minuto
  setInterval(() => {
    processQueue();
  }, 60 * 1000);
};
```

### 3.3 Validação Manual

```javascript
// src/components/ocr/DocumentValidator.tsx
import React, { useState, useEffect } from 'react';
import { getFromIndexedDB, saveToIndexedDB } from '../../lib/indexedDB';

export const DocumentValidator = ({ documentId }) => {
  const [document, setDocument] = useState(null);
  const [editedData, setEditedData] = useState({});
  
  useEffect(() => {
    const loadDocument = async () => {
      const doc = await getFromIndexedDB('documentos_processados', documentId);
      setDocument(doc);
      setEditedData(doc.extractedData || {});
    };
    
    loadDocument();
  }, [documentId]);
  
  const handleChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSave = async () => {
    if (!document) return;
    
    // Atualizar documento com dados validados
    document.extractedData = editedData;
    document.validated = true;
    document.validatedAt = new Date().toISOString();
    
    await saveToIndexedDB('documentos_processados', document);
    
    // Notificar usuário
    alert('Documento validado com sucesso!');
  };
  
  if (!document) return <div>Carregando...</div>;
  
  return (
    <div className="document-validator">
      <h2>Validação de Documento</h2>
      
      <div className="original-text">
        <h3>Texto Extraído</h3>
        <pre>{document.extractedText}</pre>
      </div>
      
      <div className="data-editor">
        <h3>Dados Extraídos</h3>
        
        {document.type === 'cnis' && (
          <>
            <div className="form-group">
              <label>NIT/PIS:</label>
              <input 
                type="text" 
                value={editedData.nit || ''} 
                onChange={(e) => handleChange('nit', e.target.value)} 
              />
            </div>
            
            <div className="form-group">
              <label>Nome:</label>
              <input 
                type="text" 
                value={editedData.nome || ''} 
                onChange={(e) => handleChange('nome', e.target.value)} 
              />
            </div>
            
            <div className="form-group">
              <label>Data de Nascimento:</label>
              <input 
                type="text" 
                value={editedData.dataNascimento || ''} 
                onChange={(e) => handleChange('dataNascimento', e.target.value)} 
              />
            </div>
            
            <h4>Vínculos</h4>
            {(editedData.vinculos || []).map((vinculo, index) => (
              <div key={index} className="vinculo-item">
                <div className="form-group">
                  <label>Início:</label>
                  <input 
                    type="text" 
                    value={vinculo.inicio || ''} 
                    onChange={(e) => {
                      const newVinculos = [...editedData.vinculos];
                      newVinculos[index].inicio = e.target.value;
                      handleChange('vinculos', newVinculos);
                    }} 
                  />
                </div>
                
                <div className="form-group">
                  <label>Fim:</label>
                  <input 
                    type="text" 
                    value={vinculo.fim || ''} 
                    onChange={(e) => {
                      const newVinculos = [...editedData.vinculos];
                      newVinculos[index].fim = e.target.value;
                      handleChange('vinculos', newVinculos);
                    }} 
                  />
                </div>
                
                <div className="form-group">
                  <label>Empregador:</label>
                  <input 
                    type="text" 
                    value={vinculo.empregador || ''} 
                    onChange={(e) => {
                      const newVinculos = [...editedData.vinculos];
                      newVinculos[index].empregador = e.target.value;
                      handleChange('vinculos', newVinculos);
                    }} 
                  />
                </div>
              </div>
            ))}
          </>
        )}
        
        <button onClick={handleSave} className="btn-primary">
          Salvar Validação
        </button>
      </div>
    </div>
  );
};
```

## 4. Auditoria Básica (Prioridade 5)

### 4.1 Implementação de Merkle Trees

```javascript
// src/lib/auditoria/merkleTree.ts
import crypto from 'crypto';

export class MerkleTree {
  constructor(leaves = []) {
    // Se as folhas não são hashes, convertê-las
    this.leaves = leaves.map(leaf => 
      typeof leaf === 'string' && leaf.startsWith('0x') 
        ? leaf 
        : this.hash(JSON.stringify(leaf))
    );
    this.layers = [this.leaves];
    this.buildTree();
  }
  
  hash(data) {
    return '0x' + crypto.createHash('sha256').update(data).digest('hex');
  }
  
  buildTree() {
    // Já temos as folhas como primeira camada
    let currentLayer = this.leaves;
    
    // Construir a árvore até chegar à raiz
    while (currentLayer.length > 1) {
      const nextLayer = [];
      
      for (let i = 0; i < currentLayer.length; i += 2) {
        if (i + 1 < currentLayer.length) {
          // Concatenar e fazer hash dos dois nós
          const combined = currentLayer[i] + currentLayer[i + 1].slice(2); // Remover '0x' do segundo hash
          nextLayer.push(this.hash(combined));
        } else {
          // Se sobrar um nó, levá-lo para a próxima camada
          nextLayer.push(currentLayer[i]);
        }
      }
      
      // Adicionar a nova camada à árvore
      this.layers.push(nextLayer);
      currentLayer = nextLayer;
    }
  }
  
  getRoot() {
    return this.layers[this.layers.length - 1][0];
  }
  
  getProof(index) {
    if (index < 0 || index >= this.leaves.length) {
      throw new Error('Índice fora dos limites');
    }
    
    const proof = [];
    let currentIndex = index;
    
    for (let i = 0; i < this.layers.length - 1; i++) {
      const layer = this.layers[i];
      const isRightNode = currentIndex % 2 === 0;
      const pairIndex = isRightNode ? currentIndex + 1 : currentIndex - 1;
      
      if (pairIndex < layer.length) {
        proof.push({
          position: isRightNode ? 'right' : 'left',
          data: layer[pairIndex]
        });
      }
      
      // Índice para a próxima camada
      currentIndex = Math.floor(currentIndex / 2);
    }
    
    return proof;
  }
  
  verify(leaf, proof, root) {
    // Converter leaf para hash se necessário
    let currentHash = typeof leaf === 'string' && leaf.startsWith('0x') 
      ? leaf 
      : this.hash(JSON.stringify(leaf));
    
    // Aplicar cada elemento da prova
    for (const { position, data } of proof) {
      if (position === 'left') {
        // O elemento da prova está à esquerda
        currentHash = this.hash(data + currentHash.slice(2));
      } else {
        // O elemento da prova está à direita
        currentHash = this.hash(currentHash + data.slice(2));
      }
    }
    
    // Verificar se chegamos à raiz esperada
    return currentHash === root;
  }
  
  addLeaf(leaf) {
    const leafHash = typeof leaf === 'string' && leaf.startsWith('0x') 
      ? leaf 
      : this.hash(JSON.stringify(leaf));
    
    this.leaves.push(leafHash);
    this.layers = [this.leaves];
    this.buildTree();
    
    return this.leaves.length - 1; // Retorna o índice da nova folha
  }
}
```

### 4.2 Logs Imutáveis

```javascript
// src/lib/auditoria/auditLog.ts
import { supabaseClient } from '../supabase/client';
import { MerkleTree } from './merkleTree';
import { saveToIndexedDB, getAllFromIndexedDB } from '../indexedDB';

// Armazenar logs localmente e criar árvore Merkle
let merkleTree = null;

export const initAuditLog = async () => {
  // Carregar logs existentes
  const logs = await getAllFromIndexedDB('audit_logs');
  
  // Inicializar árvore Merkle com logs existentes
  merkleTree = new MerkleTree(logs);
  
  return merkleTree.getRoot();
};

export const addAuditLog = async (action, details, userId) => {
  const timestamp = new Date().toISOString();
  
  // Criar entrada de log
  const logEntry = {
    id: `log-${Date.now()}`,
    action,
    details,
    userId,
    timestamp,
    clientIp: 'client-side', // Será preenchido pelo servidor se sincronizado
  };
  
  // Adicionar à árvore Merkle
  if (!merkleTree) {
    await initAuditLog();
  }
  
  const leafIndex = merkleTree.addLeaf(logEntry);
  const proof = merkleTree.getProof(leafIndex);
  const root = merkleTree.getRoot();
  
  // Adicionar prova e raiz ao log
  logEntry.merkleProof = proof;
  logEntry.merkleRoot = root;
  
  // Salvar localmente
  await saveToIndexedDB('audit_logs', logEntry);
  
  // Se online, enviar para o servidor
  if (navigator.onLine) {
    try {
      await supabaseClient.from('audit_logs').insert(logEntry);
    } catch (error) {
      console.error('Erro ao sincronizar log de auditoria:', error);
      // Marcar para sincronização posterior
      await saveToIndexedDB('pendingSyncs', {
        table: 'audit_logs',
        operation: 'insert',
        data: logEntry,
        timestamp
      });
    }
  } else {
    // Marcar para sincronização posterior
    await saveToIndexedDB('pendingSyncs', {
      table: 'audit_logs',
      operation: 'insert',
      data: logEntry,
      timestamp
    });
  }
  
  return logEntry;
};

export const verifyLogIntegrity = async (logId) => {
  // Obter log específico
  const log = await getFromIndexedDB('audit_logs', logId);
  if (!log || !log.merkleProof || !log.merkleRoot) {
    return false;
  }
  
  // Verificar integridade
  if (!merkleTree) {
    await initAuditLog();
  }
  
  // Remover campos de verificação para obter o hash original
  const { merkleProof, merkleRoot, ...logData } = log;
  
  return merkleTree.verify(logData, merkleProof, merkleRoot);
};

// Verificar integridade de todos os logs
export const verifyAllLogs = async () => {
  const logs = await getAllFromIndexedDB('audit_logs');
  const results = [];
  
  for (const log of logs) {
    const isValid = await verifyLogIntegrity(log.id);
    results.push({
      id: log.id,
      action: log.action,
      timestamp: log.timestamp,
      isValid
    });
  }
  
  return results;
};
```

### 4.3 Timestamping Público

```javascript
// src/lib/auditoria/timestamping.ts
import axios from 'axios';
import { saveToIndexedDB, getFromIndexedDB } from '../indexedDB';

// Usar serviço gratuito de timestamping
export const createPublicTimestamp = async (data) => {
  try {
    // Calcular hash dos dados
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(dataString);
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Enviar para serviço de timestamping gratuito
    const response = await axios.post('https://freetsa.org/tsr', {
      hash: hashHex,
      hashAlg: 'sha256'
    });
    
    // Salvar resposta do timestamp
    const timestamp = {
      id: `ts-${Date.now()}`,
      dataHash: hashHex,
      timestamp: new Date().toISOString(),
      tsResponse: response.data,
      verified: true
    };
    
    await saveToIndexedDB('timestamps', timestamp);
    return timestamp;
    
  } catch (error) {
    console.error('Erro ao criar timestamp público:', error);
    
    // Fallback: criar timestamp local
    const timestamp = {
      id: `ts-${Date.now()}`,
      dataHash: hashHex,
      timestamp: new Date().toISOString(),
      localOnly: true,
      verified: false
    };
    
    await saveToIndexedDB('timestamps', timestamp);
    return timestamp;
  }
};

// Verificar timestamp
export const verifyTimestamp = async (timestampId) => {
  const timestamp = await getFromIndexedDB('timestamps', timestampId);
  if (!timestamp) return false;
  
  // Se for apenas local, não podemos verificar externamente
  if (timestamp.localOnly) return false;
  
  try {
    // Verificar com o serviço de timestamping
    const response = await axios.post('https://freetsa.org/verify', {
      tsResponse: timestamp.tsResponse
    });
    
    // Atualizar status de verificação
    timestamp.verified = response.data.verified === true;
    timestamp.lastVerified = new Date().toISOString();
    
    await saveToIndexedDB('timestamps', timestamp);
    return timestamp.verified;
    
  } catch (error) {
    console.error('Erro ao verificar timestamp:', error);
    return false;
  }
};
```

## 5. Acessibilidade WCAG (Prioridade 4)

### 5.1 Componentes Acessíveis

```javascript
// src/components/ui/button.tsx
import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline text-primary',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    // Garantir que botões sempre tenham um texto acessível
    const ensureAccessibleLabel = () => {
      if (!props.children && !props['aria-label'] && !props['aria-labelledby']) {
        console.warn('Button without accessible label');
      }
    };
    
    React.useEffect(() => {
      ensureAccessibleLabel();
    }, [props.children, props['aria-label'], props['aria-labelledby']]);
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
```

### 5.2 Ferramentas de Verificação

```javascript
// src/lib/accessibility/checker.ts
import { axe } from 'axe-core';

// Verificar acessibilidade da página atual
export const checkAccessibility = async () => {
  return new Promise((resolve) => {
    // Executar axe no DOM atual
    axe.run(document, { reporter: 'v2' }, (err, results) => {
      if (err) {
        console.error('Erro ao verificar acessibilidade:', err);
        resolve({
          passes: [],
          violations: [],
          error: err.message
        });
        return;
      }
      
      // Processar resultados
      const processedResults = {
        passes: results.passes.map(pass => ({
          id: pass.id,
          description: pass.description,
          help: pass.help,
          helpUrl: pass.helpUrl,
          nodes: pass.nodes.map(node => ({
            html: node.html,
            target: node.target
          }))
        })),
        violations: results.violations.map(violation => ({
          id: violation.id,
          impact: violation.impact,
          description: violation.description,
          help: violation.help,
          helpUrl: violation.helpUrl,
          nodes: violation.nodes.map(node => ({
            html: node.html,
            target: node.target,
            failureSummary: node.failureSummary
          }))
        })),
        timestamp: new Date().toISOString()
      };
      
      // Salvar resultados para referência
      localStorage.setItem('lastAccessibilityCheck', JSON.stringify(processedResults));
      
      resolve(processedResults);
    });
  });
};

// Verificar elemento específico
export const checkElementAccessibility = async (selector) => {
  const element = document.querySelector(selector);
  if (!element) {
    return {
      error: `Elemento não encontrado: ${selector}`
    };
  }
  
  return new Promise((resolve) => {
    axe.run(element, { reporter: 'v2' }, (err, results) => {
      if (err) {
        console.error('Erro ao verificar acessibilidade do elemento:', err);
        resolve({
          passes: [],
          violations: [],
          error: err.message
        });
        return;
      }
      
      resolve({
        passes: results.passes,
        violations: results.violations,
        timestamp: new Date().toISOString()
      });
    });
  });
};

// Gerar relatório de acessibilidade
export const generateAccessibilityReport = async () => {
  const results = await checkAccessibility();
  
  // Contar problemas por categoria
  const categoryCounts = {};
  
  results.violations.forEach(violation => {
    const category = violation.id.split('.')[0];
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  });
  
  // Calcular pontuação de acessibilidade (simplificada)
  const totalIssues = results.violations.length;
  const criticalIssues = results.violations.filter(v => v.impact === 'critical').length;
  const seriousIssues = results.violations.filter(v => v.impact === 'serious').length;
  
  // Pontuação de 0-100, onde 100 é perfeito
  const score = Math.max(0, 100 - (criticalIssues * 10) - (seriousIssues * 5) - (totalIssues * 2));
  
  return {
    score,
    totalIssues,
    criticalIssues,
    seriousIssues,
    categoryCounts,
    topIssues: results.violations.slice(0, 5),
    timestamp: results.timestamp
  };
};
```

### 5.3 Implementação Progressiva

```javascript
// src/lib/accessibility/implementation.ts
import { saveToIndexedDB, getAllFromIndexedDB } from '../indexedDB';
import { generateAccessibilityReport } from './checker';

// Níveis de conformidade WCAG
const WCAG_LEVELS = {
  A: 'A',
  AA: 'AA',
  AAA: 'AAA'
};

// Requisitos por nível
const REQUIREMENTS = {
  [WCAG_LEVELS.A]: [
    { id: 'text-alternatives', description: 'Alternativas de texto para conteúdo não textual' },
    { id: 'keyboard-accessible', description: 'Funcionalidade disponível a partir do teclado' },
    { id: 'enough-time', description: 'Tempo suficiente para ler e usar o conteúdo' },
    { id: 'seizures', description: 'Não projetar conteúdo de forma conhecida por causar convulsões' },
    { id: 'navigable', description: 'Fornecer maneiras de ajudar os usuários a navegar e encontrar conteúdo' },
    { id: 'readable', description: 'Tornar o texto legível e compreensível' },
    { id: 'predictable', description: 'Fazer páginas da Web aparecerem e operarem de maneiras previsíveis' },
    { id: 'input-assistance', description: 'Ajudar os usuários a evitar e corrigir erros' }
  ],
  [WCAG_LEVELS.AA]: [
    { id: 'distinguishable', description: 'Facilitar a visualização e audição de conteúdo' },
    { id: 'compatible', description: 'Maximizar compatibilidade com tecnologias assistivas' },
    { id: 'contrast', description: 'Contraste mínimo de 4.5:1 para texto normal e 3:1 para texto grande' }
  ],
  [WCAG_LEVELS.AAA]: [
    { id: 'sign-language', description: 'Fornecer interpretação em linguagem de sinais para todo conteúdo de áudio' },
    { id: 'extended-audio', description: 'Fornecer descrição de áudio estendida para vídeo' },
    { id: 'contrast-enhanced', description: 'Contraste de 7:1 para texto normal e 4.5:1 para texto grande' },
    { id: 'low-background', description: 'Áudio de fundo baixo ou ausente' }
  ]
};

// Rastrear progresso de implementação
export const trackAccessibilityProgress = async () => {
  // Verificar estado atual
  const report = await generateAccessibilityReport();
  
  // Obter progresso anterior
  const previousProgress = await getAllFromIndexedDB('accessibility_progress');
  
  // Calcular progresso por nível
  const progress = {
    id: `progress-${Date.now()}`,
    timestamp: new Date().toISOString(),
    score: report.score,
    levels: {
      [WCAG_LEVELS.A]: calculateLevelProgress(WCAG_LEVELS.A, report),
      [WCAG_LEVELS.AA]: calculateLevelProgress(WCAG_LEVELS.AA, report),
      [WCAG_LEVELS.AAA]: calculateLevelProgress(WCAG_LEVELS.AAA, report)
    },
    issues: report.totalIssues,
    criticalIssues: report.criticalIssues
  };
  
  // Salvar progresso
  await saveToIndexedDB('accessibility_progress', progress);
  
  return progress;
};

// Calcular progresso para um nível específico
const calculateLevelProgress = (level, report) => {
  // Simplificação: estimar progresso com base na pontuação geral
  // Em uma implementação real, seria necessário mapear cada requisito WCAG
  // para as verificações específicas do axe-core
  
  switch (level) {
    case WCAG_LEVELS.A:
      // Nível A é mais básico, então damos mais peso à pontuação
      return Math.min(100, report.score * 1.2);
    
    case WCAG_LEVELS.AA:
      // Nível AA é mais exigente
      return Math.min(100, report.score * 0.9);
    
    case WCAG_LEVELS.AAA:
      // Nível AAA é o mais rigoroso
      return Math.min(100, report.score * 0.7);
    
    default:
      return 0;
  }
};

// Gerar plano de implementação progressiva
export const generateImplementationPlan = async () => {
  const progress = await trackAccessibilityProgress();
  
  // Determinar próximos passos com base no progresso atual
  const nextSteps = [];
  
  // Priorizar nível A primeiro
  if (progress.levels[WCAG_LEVELS.A] < 100) {
    const remainingA = REQUIREMENTS[WCAG_LEVELS.A].filter((req, index) => {
      // Simplificação: estimar quais requisitos estão incompletos
      // baseado na porcentagem de progresso
      const completedCount = Math.floor(REQUIREMENTS[WCAG_LEVELS.A].length * (progress.levels[WCAG_LEVELS.A] / 100));
      return index >= completedCount;
    });
    
    nextSteps.push({
      level: WCAG_LEVELS.A,
      requirements: remainingA,
      priority: 'Alta'
    });
  }
  
  // Em seguida, nível AA
  if (progress.levels[WCAG_LEVELS.A] >= 90 && progress.levels[WCAG_LEVELS.AA] < 100) {
    const remainingAA = REQUIREMENTS[WCAG_LEVELS.AA].filter((req, index) => {
      const completedCount = Math.floor(REQUIREMENTS[WCAG_LEVELS.AA].length * (progress.levels[WCAG_LEVELS.AA] / 100));
      return index >= completedCount;
    });
    
    nextSteps.push({
      level: WCAG_LEVELS.AA,
      requirements: remainingAA,
      priority: progress.levels[WCAG_LEVELS.A] >= 95 ? 'Alta' : 'Média'
    });
  }
  
  // Por último, nível AAA
  if (progress.levels[WCAG_LEVELS.AA] >= 90 && progress.levels[WCAG_LEVELS.AAA] < 100) {
    const remainingAAA = REQUIREMENTS[WCAG_LEVELS.AAA].filter((req, index) => {
      const completedCount = Math.floor(REQUIREMENTS[WCAG_LEVELS.AAA].length * (progress.levels[WCAG_LEVELS.AAA] / 100));
      return index >= completedCount;
    });
    
    nextSteps.push({
      level: WCAG_LEVELS.AAA,
      requirements: remainingAAA,
      priority: progress.levels[WCAG_LEVELS.AA] >= 95 ? 'Média' : 'Baixa'
    });
  }
  
  return {
    currentProgress: progress,
    nextSteps,
    estimatedTimeToComplete: estimateTimeToComplete(progress)
  };
};

// Estimar tempo para completar implementação
const estimateTimeToComplete = (progress) => {
  // Simplificação: estimar com base no progresso atual
  const remainingA = 100 - progress.levels[WCAG_LEVELS.A];
  const remainingAA = 100 - progress.levels[WCAG_LEVELS.AA];
  const remainingAAA = 100 - progress.levels[WCAG_LEVELS.AAA];
  
  // Estimar dias necessários (valores arbitrários para exemplo)
  const daysA = Math.ceil(remainingA * 0.1);
  const daysAA = Math.ceil(remainingAA * 0.15);
  const daysAAA = Math.ceil(remainingAAA * 0.2);
  
  return {
    [WCAG_LEVELS.A]: daysA,
    [WCAG_LEVELS.AA]: daysAA,
    [WCAG_LEVELS.AAA]: daysAAA,
    total: daysA + daysAA + daysAAA
  };
};
```

## 6. Otimizações Gerais

### 6.1 Compressão de Dados

```javascript
// src/lib/utils/compression.ts
import pako from 'pako';

// Comprimir dados para armazenamento
export const compressData = (data) => {
  try {
    const stringData = typeof data === 'string' ? data : JSON.stringify(data);
    const compressed = pako.deflate(stringData, { to: 'string' });
    return {
      compressed: true,
      data: btoa(compressed), // Base64 encode para armazenamento seguro
      originalSize: stringData.length,
      compressedSize: compressed.length
    };
  } catch (error) {
    console.error('Erro ao comprimir dados:', error);
    return {
      compressed: false,
      data: typeof data === 'string' ? data : JSON.stringify(data)
    };
  }
};

// Descomprimir dados
export const decompressData = (compressedObj) => {
  if (!compressedObj || !compressedObj.compressed) {
    return compressedObj?.data || compressedObj;
  }
  
  try {
    const decompressed = pako.inflate(atob(compressedObj.data), { to: 'string' });
    return JSON.parse(decompressed);
  } catch (error) {
    console.error('Erro ao descomprimir dados:', error);
    return null;
  }
};

// Versão aprimorada do IndexedDB para usar compressão
export const saveCompressedToIndexedDB = async (storeName, data) => {
  // Comprimir apenas objetos grandes
  const shouldCompress = typeof data === 'object' && 
    JSON.stringify(data).length > 1024; // Comprimir apenas se > 1KB
  
  const dataToStore = shouldCompress ? 
    compressData(data) : 
    { compressed: false, data };
  
  return saveToIndexedDB(storeName, dataToStore);
};

export const getCompressedFromIndexedDB = async (storeName, id) => {
  const compressedObj = await getFromIndexedDB(storeName, id);
  if (!compressedObj) return null;
  
  return compressedObj.compressed ? 
    decompressData(compressedObj) : 
    compressedObj.data || compressedObj;
};
```

### 6.2 Estratégia de Cache

```javascript
// src/lib/utils/cacheStrategy.ts
import { saveToIndexedDB, getFromIndexedDB, getAllFromIndexedDB } from '../indexedDB';

// Configurações de cache por tipo de dados
const CACHE_CONFIG = {
  'clientes': {
    maxItems: 100,
    ttl: 7 * 24 * 60 * 60 * 1000, // 7 dias
    priority: 'high'
  },
  'processos': {
    maxItems: 50,
    ttl: 3 * 24 * 60 * 60 * 1000, // 3 dias
    priority: 'high'
  },
  'jurisprudencias': {
    maxItems: 200,
    ttl: 30 * 24 * 60 * 60 * 1000, // 30 dias
    priority: 'medium'
  },
  'documentos_processados': {
    maxItems: 20,
    ttl: 14 * 24 * 60 * 60 * 1000, // 14 dias
    priority: 'low'
  }
};

// Gerenciar cache inteligente
export const manageCache = async () => {
  // Verificar uso de armazenamento
  const usageEstimate = await estimateStorageUsage();
  
  // Se estiver próximo do limite, limpar cache
  if (usageEstimate.percentUsed > 80) {
    await cleanupCache();
  }
};

// Estimar uso de armazenamento
const estimateStorageUsage = async () => {
  // Obter tamanho aproximado de cada store
  const stores = Object.keys(CACHE_CONFIG);
  let totalSize = 0;
  const storeStats = {};
  
  for (const store of stores) {
    const items = await getAllFromIndexedDB(store);
    let storeSize = 0;
    
    for (const item of items) {
      const itemSize = estimateObjectSize(item);
      storeSize += itemSize;
    }
    
    storeStats[store] = {
      count: items.length,
      size: storeSize,
      config: CACHE_CONFIG[store]
    };
    
    totalSize += storeSize;
  }
  
  // Estimar uso total (500MB é o limite do Supabase Free)
  const maxStorage = 500 * 1024 * 1024; // 500MB em bytes
  const percentUsed = (totalSize / maxStorage) * 100;
  
  return {
    totalSize,
    maxStorage,
    percentUsed,
    stores: storeStats
  };
};

// Estimar tamanho de um objeto
const estimateObjectSize = (obj) => {
  const jsonString = JSON.stringify(obj);
  return jsonString.length * 2; // Aproximação: 2 bytes por caractere
};

// Limpar cache com base em prioridades
const cleanupCache = async () => {
  const stores = Object.keys(CACHE_CONFIG).sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[CACHE_CONFIG[a].priority] - priorityOrder[CACHE_CONFIG[b].priority];
  });
  
  // Começar limpando stores de baixa prioridade
  for (const store of stores) {
    const config = CACHE_CONFIG[store];
    const items = await getAllFromIndexedDB(store);
    
    // Verificar TTL
    const now = Date.now();
    const expiredItems = items.filter(item => {
      const timestamp = new Date(item.timestamp || item.createdAt || item.updatedAt).getTime();
      return now - timestamp > config.ttl;
    });
    
    // Remover itens expirados
    const db = await initDB();
    const transaction = db.transaction(store, 'readwrite');
    const objectStore = transaction.objectStore(store);
    
    for (const item of expiredItems) {
      objectStore.delete(item.id);
    }
    
    // Se ainda precisamos remover mais itens
    if (items.length - expiredItems.length > config.maxItems) {
      // Ordenar por data (mais antigos primeiro)
      const remainingItems = items
        .filter(item => !expiredItems.includes(item))
        .sort((a, b) => {
          const timestampA = new Date(a.timestamp || a.createdAt || a.updatedAt).getTime();
          const timestampB = new Date(b.timestamp || b.createdAt || b.updatedAt).getTime();
          return timestampA - timestampB;
        });
      
      // Remover itens excedentes
      const itemsToRemove = remainingItems.slice(0, remainingItems.length - config.maxItems);
      
      for (const item of itemsToRemove) {
        objectStore.delete(item.id);
      }
    }
  }
};

// Configurar limpeza periódica
export const setupCacheManagement = () => {
  // Verificar cache ao iniciar
  manageCache();
  
  // Verificar periodicamente
  setInterval(() => {
    manageCache();
  }, 12 * 60 * 60 * 1000); // A cada 12 horas
};
```

### 6.3 Monitoramento de Recursos

```javascript
// src/lib/utils/resourceMonitor.ts
import { supabaseClient } from '../supabase/client';

// Limites do plano gratuito
const FREE_TIER_LIMITS = {
  storage: 500 * 1024 * 1024, // 500MB
  dailyRequests: 500, // 500 requisições por dia
  bandwidth: 2 * 1024 * 1024 * 1024, // 2GB por mês
  rows: 50000 // 50.000 linhas
};

// Contador de requisições
let requestCount = 0;

// Inicializar monitoramento
export const initResourceMonitor = () => {
  // Carregar contagem de requisições do dia
  const today = new Date().toISOString().split('T')[0];
  const storedCount = localStorage.getItem(`requestCount_${today}`);
  
  if (storedCount) {
    requestCount = parseInt(storedCount, 10);
  } else {
    requestCount = 0;
    localStorage.setItem(`requestCount_${today}`, '0');
  }
  
  // Monitorar requisições Supabase
  const originalFetch = window.fetch;
  window.fetch = function(url, options) {
    // Verificar se é uma requisição para o Supabase
    if (url.toString().includes(supabaseClient.supabaseUrl)) {
      trackRequest();
    }
    
    return originalFetch.apply(this, arguments);
  };
  
  // Verificar uso de armazenamento
  checkStorageUsage();
  
  return {
    requestCount,
    limits: FREE_TIER_LIMITS
  };
};

// Rastrear requisição
const trackRequest = () => {
  requestCount++;
  
  // Atualizar contagem no localStorage
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem(`requestCount_${today}`, requestCount.toString());
  
  // Verificar se está próximo do limite
  if (requestCount > FREE_TIER_LIMITS.dailyRequests * 0.8) {
    console.warn(`Alerta: ${requestCount}/${FREE_TIER_LIMITS.dailyRequests} requisições diárias utilizadas (${Math.round(requestCount / FREE_TIER_LIMITS.dailyRequests * 100)}%)`);
    
    // Notificar usuário se estiver muito próximo do limite
    if (requestCount > FREE_TIER_LIMITS.dailyRequests * 0.9) {
      notifyResourceLimit('requisições', requestCount, FREE_TIER_LIMITS.dailyRequests);
    }
  }
};

// Verificar uso de armazenamento
const checkStorageUsage = async () => {
  try {
    // Estimar uso de armazenamento IndexedDB
    const estimate = await navigator.storage.estimate();
    const usedStorage = estimate.usage || 0;
    const percentUsed = (usedStorage / FREE_TIER_LIMITS.storage) * 100;
    
    console.log(`Uso de armazenamento: ${formatBytes(usedStorage)}/${formatBytes(FREE_TIER_LIMITS.storage)} (${percentUsed.toFixed(1)}%)`);
    
    // Notificar se estiver próximo do limite
    if (percentUsed > 80) {
      notifyResourceLimit('armazenamento', usedStorage, FREE_TIER_LIMITS.storage);
    }
    
    return {
      used: usedStorage,
      limit: FREE_TIER_LIMITS.storage,
      percent: percentUsed
    };
  } catch (error) {
    console.error('Erro ao verificar uso de armazenamento:', error);
    return null;
  }
};

// Formatar bytes para exibição
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Notificar usuário sobre limite de recursos
const notifyResourceLimit = (resource, used, limit) => {
  const percentUsed = (used / limit) * 100;
  
  // Criar notificação na UI
  const notification = {
    id: `resource-${Date.now()}`,
    type: 'warning',
    title: `Alerta de Uso de ${resource}`,
    message: `Você está utilizando ${percentUsed.toFixed(1)}% do limite de ${resource} do plano gratuito.`,
    actions: [
      {
        label: 'Otimizar',
        action: 'optimize'
      },
      {
        label: 'Ignorar',
        action: 'dismiss'
      }
    ]
  };
  
  // Disparar evento para o sistema de notificações
  const event = new CustomEvent('resource-limit', { detail: notification });
  window.dispatchEvent(event);
};

// Configurar verificações periódicas
export const setupResourceMonitoring = () => {
  // Inicializar
  initResourceMonitor();
  
  // Verificar armazenamento periodicamente
  setInterval(() => {
    checkStorageUsage();
  }, 4 * 60 * 60 * 1000); // A cada 4 horas
};
```

## 7. Implementação Progressiva

### 7.1 Plano de Implementação Faseado

| Fase | Funcionalidade | Prazo Estimado | Complexidade | Prioridade |
|------|----------------|----------------|--------------|------------|
| 1 | PWA Offline Básico | 1 semana | Média | Alta |
| 1 | Otimizações de Armazenamento | 3 dias | Baixa | Alta |
| 1 | Monitoramento de Recursos | 2 dias | Baixa | Alta |
| 2 | Jurisprudência Básica | 2 semanas | Alta | Média |
| 2 | Acessibilidade WCAG A | 1 semana | Média | Média |
| 3 | OCR Simples | 2 semanas | Alta | Média |
| 3 | Acessibilidade WCAG AA | 1 semana | Média | Baixa |
| 4 | Auditoria Básica | 1 semana | Alta | Baixa |
| 4 | Acessibilidade WCAG AAA | 2 semanas | Alta | Baixa |

### 7.2 Instruções de Implementação

1. **Fase 1 (MVP Zero - até 07/05/2025)**:
   - Implementar PWA com Service Workers para recursos estáticos
   - Configurar IndexedDB para armazenamento local de dados essenciais
   - Implementar compressão de dados e estratégia de cache
   - Configurar monitoramento de recursos

2. **Fase 2 (MVP Funcional - até 15/05/2025)**:
   - Implementar scraper básico para jurisprudência
   - Criar sistema de busca e armazenamento local
   - Implementar requisitos de acessibilidade WCAG nível A
   - Melhorar PWA com sincronização seletiva

3. **Fase 3 (Expansão - até 30/05/2025)**:
   - Integrar Tesseract.js para OCR no cliente
   - Implementar processamento em lote e validação manual
   - Melhorar acessibilidade para WCAG nível AA
   - Expandir funcionalidades offline

4. **Fase 4 (Finalização - até 30/06/2025)**:
   - Implementar auditoria com Merkle Trees
   - Adicionar timestamping público para registros críticos
   - Finalizar acessibilidade WCAG nível AAA
   - Otimizações finais e testes abrangentes

## 8. Conclusão

Este guia de implementação fornece instruções detalhadas para desenvolver todas as funcionalidades avançadas do PowerPrev a custo zero, utilizando tecnologias open source e estratégias de otimização. Seguindo esta abordagem progressiva, é possível entregar um sistema robusto e completo sem custos significativos de infraestrutura.

As implementações propostas mantêm a essência das funcionalidades originais, com algumas limitações aceitáveis em termos de escala e performance. O foco em processamento no cliente, armazenamento eficiente e sincronização seletiva permite contornar as restrições dos planos gratuitos.

Recomendamos iniciar com as funcionalidades de maior prioridade (PWA Offline) e progressivamente adicionar os demais recursos conforme o cronograma estabelecido.

---

Data: 25 de abril de 2025
