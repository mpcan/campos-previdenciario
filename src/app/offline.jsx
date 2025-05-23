// Página offline para PowerPrev
// Esta página será exibida quando o usuário estiver offline e tentar acessar uma página não cacheada

import React from 'react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center">
          <svg 
            className="h-24 w-24 text-yellow-500 mx-auto mb-4" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M13 10V3L4 14h7v7l9-11h-7z" 
            />
          </svg>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Você está offline</h1>
          
          <p className="text-gray-600 mb-6">
            Não foi possível carregar esta página porque você está sem conexão com a internet.
          </p>
          
          <div className="space-y-4">
            <button 
              onClick={() => window.location.reload()} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
            >
              Tentar novamente
            </button>
            
            <button 
              onClick={() => window.location.href = '/dashboard'} 
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition duration-200"
            >
              Ir para o Dashboard
            </button>
          </div>
        </div>
        
        <div className="mt-8 border-t pt-6">
          <h2 className="font-semibold text-gray-700 mb-2">Recursos disponíveis offline:</h2>
          <ul className="list-disc pl-5 text-gray-600 space-y-1">
            <li>Dashboard principal</li>
            <li>Clientes já visualizados</li>
            <li>Processos já visualizados</li>
            <li>Documentos baixados</li>
          </ul>
        </div>
        
        <div className="mt-6 text-sm text-gray-500 text-center">
          <p>PowerPrev - Trabalhando para você mesmo offline</p>
        </div>
      </div>
    </div>
  );
}
