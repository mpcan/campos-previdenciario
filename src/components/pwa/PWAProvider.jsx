// Integração do PWA no aplicativo principal PowerPrev
// Este arquivo integra os componentes PWA no layout principal da aplicação

import { RegisterServiceWorker } from '@/components/pwa/RegisterServiceWorker';
import { OfflineSyncManager } from '@/components/pwa/OfflineSyncManager';
import { initializeOfflineSupport } from '@/lib/pwa/indexedDB';
import { useEffect } from 'react';

export function PWAProvider({ children }) {
  useEffect(() => {
    // Inicializar suporte offline quando o componente montar
    const initOffline = async () => {
      try {
        await initializeOfflineSupport();
        console.log('Suporte offline inicializado com sucesso');
      } catch (error) {
        console.error('Erro ao inicializar suporte offline:', error);
      }
    };

    initOffline();
  }, []);

  return (
    <>
      {/* Renderizar componentes PWA */}
      <RegisterServiceWorker />
      <OfflineSyncManager />
      
      {/* Renderizar conteúdo da aplicação */}
      {children}
    </>
  );
}

export default PWAProvider;
