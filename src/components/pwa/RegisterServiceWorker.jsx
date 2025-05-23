// Componente de registro do Service Worker para PowerPrev
// Implementação para integrar PWA na aplicação Next.js

import { useEffect, useState } from 'react';

export function RegisterServiceWorker() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Registrar o service worker quando o componente montar
      registerServiceWorker();

      // Verificar status de conexão inicial
      setOfflineReady(navigator.onLine === false);

      // Configurar listeners para eventos de online/offline
      window.addEventListener('online', handleOnlineStatus);
      window.addEventListener('offline', handleOnlineStatus);

      // Limpar listeners quando o componente desmontar
      return () => {
        window.removeEventListener('online', handleOnlineStatus);
        window.removeEventListener('offline', handleOnlineStatus);
      };
    }
  }, []);

  // Função para registrar o service worker
  const registerServiceWorker = async () => {
    try {
      const reg = await navigator.serviceWorker.register('/serviceWorker.js');
      console.log('Service Worker registrado com sucesso:', reg.scope);
      
      setRegistration(reg);
      setIsRegistered(true);

      // Verificar se há uma nova versão do service worker
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Há uma nova versão disponível
            setUpdateAvailable(true);
          }
        });
      });

      // Configurar listener para mensagens do service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'OFFLINE_READY') {
          setOfflineReady(true);
        }
      });
    } catch (error) {
      console.error('Erro ao registrar Service Worker:', error);
    }
  };

  // Função para atualizar o service worker
  const updateServiceWorker = async () => {
    if (registration && registration.waiting) {
      // Enviar mensagem para o service worker atualizar
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Recarregar a página para usar o novo service worker
      window.location.reload();
    }
  };

  // Função para lidar com mudanças no status de conexão
  const handleOnlineStatus = () => {
    setOfflineReady(navigator.onLine === false);
    
    // Notificar o usuário sobre a mudança de status
    if (navigator.onLine) {
      // Dispositivo está online novamente
      showNotification('Conexão restaurada', 'Você está online novamente. Seus dados serão sincronizados automaticamente.');
      
      // Iniciar sincronização de dados pendentes
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SYNC_DATA'
        });
      }
    } else {
      // Dispositivo está offline
      showNotification('Modo offline ativado', 'Você está trabalhando offline. Suas alterações serão sincronizadas quando a conexão for restaurada.');
    }
  };

  // Função para mostrar notificações
  const showNotification = (title, message) => {
    // Verificar se o navegador suporta notificações
    if ('Notification' in window) {
      // Verificar permissão
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body: message,
          icon: '/static/images/icons/icon-192x192.png'
        });
      } else if (Notification.permission !== 'denied') {
        // Solicitar permissão
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(title, {
              body: message,
              icon: '/static/images/icons/icon-192x192.png'
            });
          }
        });
      }
    }
  };

  // Renderizar componente de notificação de atualização/offline
  return (
    <>
      {updateAvailable && (
        <div className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white p-4 flex justify-between items-center z-50">
          <p>Uma nova versão está disponível!</p>
          <button 
            onClick={updateServiceWorker}
            className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium"
          >
            Atualizar agora
          </button>
        </div>
      )}
      
      {offlineReady && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white p-2 text-center z-50">
          <p className="text-sm">
            Você está trabalhando offline. Suas alterações serão sincronizadas quando a conexão for restaurada.
          </p>
        </div>
      )}
    </>
  );
}

export default RegisterServiceWorker;
