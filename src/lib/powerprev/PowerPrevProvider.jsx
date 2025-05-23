// Componente de integração para o PowerPrev
// Integra todas as funcionalidades implementadas em um sistema coeso

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

// Importar componentes e serviços
import { RegisterServiceWorker } from '@/components/pwa/RegisterServiceWorker';
import { OfflineSyncManager } from '@/components/pwa/OfflineSyncManager';
import { PWAProvider } from '@/components/pwa/PWAProvider';
import ocrService from '@/lib/ocr/ocrService';
import auditService from '@/lib/security/auditService';
import localDataEncryption from '@/lib/security/localDataEncryption';
import apiLimitsMonitor from '@/lib/security/apiLimitsMonitor';
import ethicalWebScraping from '@/lib/security/ethicalWebScraping';
import dataBackupRecovery from '@/lib/security/dataBackupRecovery';

// Contexto do PowerPrev
export const PowerPrevContext = React.createContext({});

/**
 * Provedor principal do PowerPrev
 * Integra todas as funcionalidades implementadas
 */
export const PowerPrevProvider = ({ children }) => {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [systemStatus, setSystemStatus] = useState({
    apiLimits: null,
    storageUsage: null,
    lastBackup: null,
    pendingSyncs: 0
  });

  // Inicializar sistema
  useEffect(() => {
    const initSystem = async () => {
      try {
        console.log('Inicializando PowerPrev...');
        
        // Verificar status online
        setIsOnline(navigator.onLine);
        
        // Configurar listeners de conectividade
        window.addEventListener('online', () => setIsOnline(true));
        window.addEventListener('offline', () => setIsOnline(false));
        
        // Verificar limites de API
        const apiLimits = await apiLimitsMonitor.checkAllLimits();
        
        // Verificar uso de armazenamento
        const storageUsage = await apiLimitsMonitor.checkIndexedDBUsage();
        
        // Obter informações de backup
        const backupsList = await dataBackupRecovery.getAutoBackupsList();
        const lastBackup = backupsList.length > 0 ? backupsList[0] : null;
        
        // Atualizar status do sistema
        setSystemStatus({
          apiLimits,
          storageUsage,
          lastBackup,
          pendingSyncs: 0
        });
        
        // Configurar backup automático
        const autoBackup = dataBackupRecovery.setupAutoBackup({
          onBackupComplete: (result) => {
            console.log('Backup automático concluído:', result);
            setSystemStatus(prev => ({
              ...prev,
              lastBackup: {
                timestamp: new Date().toISOString(),
                size: result.size
              }
            }));
          }
        });
        
        // Registrar inicialização no log de auditoria
        await auditService.logAuditEvent(
          auditService.AUDIT_CONFIG.eventTypes.ADMIN,
          auditService.AUDIT_CONFIG.entities.SISTEMA,
          'system',
          { action: 'initialize', version: '1.0.0' }
        );
        
        setIsInitialized(true);
        console.log('PowerPrev inicializado com sucesso!');
      } catch (error) {
        console.error('Erro ao inicializar PowerPrev:', error);
      }
    };
    
    initSystem();
    
    // Cleanup
    return () => {
      window.removeEventListener('online', () => setIsOnline(true));
      window.removeEventListener('offline', () => setIsOnline(false));
    };
  }, []);
  
  // Monitorar mudanças de rota
  useEffect(() => {
    const handleRouteChange = async (url) => {
      try {
        // Registrar navegação no log de auditoria
        await auditService.logAuditEvent(
          auditService.AUDIT_CONFIG.eventTypes.ADMIN,
          auditService.AUDIT_CONFIG.entities.SISTEMA,
          'navigation',
          { route: url }
        );
      } catch (error) {
        console.error('Erro ao registrar navegação:', error);
      }
    };
    
    router.events.on('routeChangeComplete', handleRouteChange);
    
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);
  
  // Verificar limites de API periodicamente
  useEffect(() => {
    const checkLimits = async () => {
      try {
        const apiLimits = await apiLimitsMonitor.checkAllLimits();
        
        setSystemStatus(prev => ({
          ...prev,
          apiLimits
        }));
      } catch (error) {
        console.error('Erro ao verificar limites de API:', error);
      }
    };
    
    const intervalId = setInterval(checkLimits, 30 * 60 * 1000); // 30 minutos
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Funções de utilidade
  const encryptSensitiveData = async (data, fields) => {
    if (!currentUser) return data;
    
    const password = localDataEncryption.generateAppPassword(currentUser.id);
    return await localDataEncryption.encryptSensitiveFields(data, fields, password);
  };
  
  const decryptSensitiveData = async (data, fields) => {
    if (!currentUser) return data;
    
    const password = localDataEncryption.generateAppPassword(currentUser.id);
    return await localDataEncryption.decryptSensitiveFields(data, fields, password);
  };
  
  // Criar backup manual
  const createBackup = async () => {
    try {
      const result = await dataBackupRecovery.createFullBackup();
      
      // Registrar no log de auditoria
      await auditService.logAuditEvent(
        auditService.AUDIT_CONFIG.eventTypes.EXPORT,
        auditService.AUDIT_CONFIG.entities.SISTEMA,
        'backup',
        { size: result.size, fileName: result.fileName }
      );
      
      setSystemStatus(prev => ({
        ...prev,
        lastBackup: {
          timestamp: new Date().toISOString(),
          size: result.size
        }
      }));
      
      return result;
    } catch (error) {
      console.error('Erro ao criar backup:', error);
      throw error;
    }
  };
  
  // Restaurar backup
  const restoreBackup = async (backupSource) => {
    try {
      const result = await dataBackupRecovery.restoreFromBackup(backupSource);
      
      // Registrar no log de auditoria
      await auditService.logAuditEvent(
        auditService.AUDIT_CONFIG.eventTypes.IMPORT,
        auditService.AUDIT_CONFIG.entities.SISTEMA,
        'restore',
        { success: result.success, stores: result.restoredStores }
      );
      
      return result;
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      throw error;
    }
  };
  
  // Reconhecer texto em imagem
  const recognizeText = async (image, options) => {
    try {
      const result = await ocrService.recognizeText(image, options);
      
      // Registrar no log de auditoria
      await auditService.logAuditEvent(
        auditService.AUDIT_CONFIG.eventTypes.CREATE,
        auditService.AUDIT_CONFIG.entities.DOCUMENTO,
        'ocr',
        { confidence: result.confidence, language: result.language }
      );
      
      return result;
    } catch (error) {
      console.error('Erro ao reconhecer texto:', error);
      throw error;
    }
  };
  
  // Buscar jurisprudência com web scraping ético
  const searchJurisprudence = async (query, source) => {
    try {
      // Verificar se pode acessar eticamente
      const url = `https://jurisprudencia.${source}.jus.br/search?q=${encodeURIComponent(query)}`;
      const canAccess = await ethicalWebScraping.canAccessEthically(url);
      
      if (!canAccess.canAccess) {
        throw new Error(`Acesso não permitido: ${canAccess.error || 'Limite de requisições excedido'}`);
      }
      
      // Fazer requisição ética
      const response = await ethicalWebScraping.ethicalFetch(url);
      const html = await response.text();
      
      // Processar resultados (implementação simplificada)
      const results = extractJurisprudenceResults(html, source);
      
      // Registrar no log de auditoria
      await auditService.logAuditEvent(
        auditService.AUDIT_CONFIG.eventTypes.ADMIN,
        auditService.AUDIT_CONFIG.entities.SISTEMA,
        'jurisprudence_search',
        { query, source, resultsCount: results.length }
      );
      
      return results;
    } catch (error) {
      console.error('Erro ao buscar jurisprudência:', error);
      throw error;
    }
  };
  
  // Função auxiliar para extrair resultados de jurisprudência
  const extractJurisprudenceResults = (html, source) => {
    // Implementação simplificada - em produção, usar parser HTML adequado
    const results = [];
    
    // Simular extração de resultados
    for (let i = 1; i <= 5; i++) {
      results.push({
        id: `${source}_${Date.now()}_${i}`,
        title: `Resultado ${i} para busca em ${source}`,
        summary: 'Resumo da decisão judicial...',
        date: new Date().toISOString(),
        court: source.toUpperCase(),
        url: `https://jurisprudencia.${source}.jus.br/document/${i}`
      });
    }
    
    return results;
  };
  
  // Valor do contexto
  const contextValue = {
    isOnline,
    isInitialized,
    currentUser,
    systemStatus,
    
    // Autenticação
    setCurrentUser,
    
    // Criptografia
    encryptSensitiveData,
    decryptSensitiveData,
    
    // Backup e recuperação
    createBackup,
    restoreBackup,
    
    // OCR
    recognizeText,
    
    // Jurisprudência
    searchJurisprudence,
    
    // Auditoria
    logAuditEvent: auditService.logAuditEvent,
    searchAuditEvents: auditService.searchAuditEvents,
    exportAuditLogs: auditService.exportAuditLogs,
    
    // Monitoramento
    checkApiLimits: apiLimitsMonitor.checkAllLimits
  };
  
  return (
    <PowerPrevContext.Provider value={contextValue}>
      <PWAProvider>
        <RegisterServiceWorker />
        <OfflineSyncManager />
        {children}
      </PWAProvider>
    </PowerPrevContext.Provider>
  );
};

// Hook para usar o contexto do PowerPrev
export const usePowerPrev = () => {
  const context = React.useContext(PowerPrevContext);
  
  if (!context) {
    throw new Error('usePowerPrev deve ser usado dentro de um PowerPrevProvider');
  }
  
  return context;
};

export default {
  PowerPrevProvider,
  usePowerPrev
};
