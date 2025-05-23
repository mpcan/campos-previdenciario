// Componente de sincronização offline para PowerPrev
// Implementação para gerenciar sincronização de dados entre IndexedDB e Supabase

import { useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase/client';
import { 
  processSyncQueue, 
  getAllItems, 
  STORES_ENUM,
  cleanupSyncQueue
} from '@/lib/pwa/indexedDB';

export function OfflineSyncManager() {
  const [syncStatus, setSyncStatus] = useState('idle');
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [pendingItems, setPendingItems] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Verificar status de conexão inicial
    setIsOnline(navigator.onLine);

    // Configurar listeners para eventos de online/offline
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    // Verificar itens pendentes ao iniciar
    checkPendingItems();

    // Configurar sincronização periódica
    const syncInterval = setInterval(() => {
      if (navigator.onLine) {
        syncData();
      }
    }, 5 * 60 * 1000); // A cada 5 minutos

    // Limpar listeners e intervalos quando o componente desmontar
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
      clearInterval(syncInterval);
    };
  }, []);

  // Função para lidar com mudanças no status de conexão
  const handleOnlineStatus = () => {
    const online = navigator.onLine;
    setIsOnline(online);
    
    if (online) {
      // Quando ficar online, tentar sincronizar
      syncData();
    }
  };

  // Verificar itens pendentes de sincronização
  const checkPendingItems = async () => {
    try {
      const syncItems = await getAllItems(STORES_ENUM.SYNC_QUEUE);
      const pendingCount = syncItems.filter(item => item.status === 'pending').length;
      setPendingItems(pendingCount);
      return pendingCount;
    } catch (error) {
      console.error('Erro ao verificar itens pendentes:', error);
      return 0;
    }
  };

  // Sincronizar dados com o servidor
  const syncData = async () => {
    if (!navigator.onLine) {
      console.log('Dispositivo offline, sincronização adiada');
      return false;
    }

    try {
      setSyncStatus('syncing');
      
      // Processar fila de sincronização
      await processSyncQueue();
      
      // Atualizar contagem de itens pendentes
      const pendingCount = await checkPendingItems();
      
      // Limpar itens antigos da fila
      await cleanupSyncQueue(7); // Limpar itens concluídos com mais de 7 dias
      
      // Atualizar status
      setSyncStatus(pendingCount > 0 ? 'partial' : 'complete');
      setLastSyncTime(new Date().toISOString());
      
      return true;
    } catch (error) {
      console.error('Erro durante sincronização:', error);
      setSyncStatus('error');
      return false;
    }
  };

  // Forçar sincronização manual
  const forceSyncData = async () => {
    if (!navigator.onLine) {
      alert('Você está offline. A sincronização será realizada quando a conexão for restaurada.');
      return false;
    }

    return syncData();
  };

  // Renderizar componente de status de sincronização
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOnline && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-2 rounded shadow-md">
          <div className="flex items-center">
            <div className="py-1">
              <svg className="h-6 w-6 text-yellow-500 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="font-bold">Modo Offline</p>
              <p className="text-sm">Você está trabalhando offline. Suas alterações serão sincronizadas quando a conexão for restaurada.</p>
            </div>
          </div>
        </div>
      )}

      {pendingItems > 0 && isOnline && (
        <button 
          onClick={forceSyncData}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-md flex items-center"
          disabled={syncStatus === 'syncing'}
        >
          {syncStatus === 'syncing' ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sincronizando...
            </>
          ) : (
            <>
              <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Sincronizar ({pendingItems} {pendingItems === 1 ? 'item pendente' : 'itens pendentes'})
            </>
          )}
        </button>
      )}
    </div>
  );
}

export default OfflineSyncManager;
