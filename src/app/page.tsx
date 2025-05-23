"use client"

// Componente de interface para o módulo de jurisprudência do PowerPrev
// Implementação da página de busca e visualização de jurisprudências

import React, { useState, useEffect } from 'react';
import { 
  buscarJurisprudencia, 
  marcarFavorito, 
  adicionarAnotacao, 
  obterFavoritos,
  exportarCSV,
  FONTES_ENUM 
} from '@/lib/jurisprudencia/jurisprudenciaService';

export default function JurisprudenciaPage() {
  // Estados
  const [termo, setTermo] = useState('');
  const [fontesSelecionadas, setFontesSelecionadas] = useState(Object.values(FONTES_ENUM));
  const [resultados, setResultados] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState('busca'); // 'busca' ou 'favoritos'
  const [jurisprudenciaSelecionada, setJurisprudenciaSelecionada] = useState(null);
  const [anotacao, setAnotacao] = useState('');
  const [filtroFavoritos, setFiltroFavoritos] = useState('');
  const [favoritos, setFavoritos] = useState([]);
  const [statusConexao, setStatusConexao] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Verificar status de conexão
  useEffect(() => {
    const handleOnline = () => setStatusConexao(true);
    const handleOffline = () => setStatusConexao(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Carregar favoritos ao montar componente ou mudar de aba
  useEffect(() => {
    if (abaAtiva === 'favoritos') {
      carregarFavoritos();
    }
  }, [abaAtiva]);

  // Função para carregar favoritos
  const carregarFavoritos = async () => {
    try {
      const favs = await obterFavoritos();
      setFavoritos(favs);
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
      setErro('Não foi possível carregar os favoritos.');
    }
  };

  // Função para realizar busca
  const realizarBusca = async (e) => {
    e.preventDefault();
    
    if (!termo.trim()) {
      setErro('Digite um termo para busca.');
      return;
    }
    
    setCarregando(true);
    setErro(null);
    
    try {
      const resultadosBusca = await buscarJurisprudencia(termo, fontesSelecionadas);
      setResultados(resultadosBusca);
      
      if (resultadosBusca.length === 0) {
        setErro('Nenhum resultado encontrado para o termo informado.');
      }
    } catch (error) {
      console.error('Erro na busca:', error);
      setErro('Ocorreu um erro ao realizar a busca. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  // Função para marcar/desmarcar favorito
  const alternarFavorito = async (id, favoritoAtual) => {
    try {
      await marcarFavorito(id, !favoritoAtual);
      
      // Atualizar lista de resultados
      setResultados(resultados.map(r => 
        r.id === id ? { ...r, favorito: !favoritoAtual } : r
      ));
      
      // Se estiver na aba de favoritos, atualizar lista
      if (abaAtiva === 'favoritos') {
        await carregarFavoritos();
      }
    } catch (error) {
      console.error('Erro ao marcar favorito:', error);
      setErro('Não foi possível atualizar o favorito.');
    }
  };

  // Função para adicionar anotação
  const salvarAnotacao = async () => {
    if (!jurisprudenciaSelecionada || !anotacao.trim()) {
      return;
    }
    
    try {
      const jurisprudenciaAtualizada = await adicionarAnotacao(jurisprudenciaSelecionada.id, anotacao);
      
      // Atualizar jurisprudência selecionada
      setJurisprudenciaSelecionada(jurisprudenciaAtualizada);
      
      // Atualizar lista de resultados
      setResultados(resultados.map(r => 
        r.id === jurisprudenciaAtualizada.id ? jurisprudenciaAtualizada : r
      ));
      
      // Limpar campo de anotação
      setAnotacao('');
      
      // Se estiver na aba de favoritos, atualizar lista
      if (abaAtiva === 'favoritos') {
        await carregarFavoritos();
      }
    } catch (error) {
      console.error('Erro ao adicionar anotação:', error);
      setErro('Não foi possível adicionar a anotação.');
    }
  };

  // Função para exportar resultados
  const exportarResultados = () => {
    const dadosParaExportar = abaAtiva === 'busca' ? resultados : favoritos;
    
    if (dadosParaExportar.length === 0) {
      setErro('Não há dados para exportar.');
      return;
    }
    
    const csv = exportarCSV(dadosParaExportar);
    
    // Criar blob e link para download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `jurisprudencia-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtrar favoritos
  const favoritosFiltrados = filtroFavoritos
    ? favoritos.filter(f => 
        f.titulo?.toLowerCase().includes(filtroFavoritos.toLowerCase()) ||
        f.ementa?.toLowerCase().includes(filtroFavoritos.toLowerCase()) ||
        f.relator?.toLowerCase().includes(filtroFavoritos.toLowerCase())
      )
    : favoritos;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Jurisprudência Previdenciária</h1>
        <p className="text-gray-600">
          Pesquise decisões judiciais em matéria previdenciária de diversos tribunais.
        </p>
        
        {!statusConexao && (
          <div className="mt-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
            <p className="font-bold">Modo Offline</p>
            <p>Você está trabalhando offline. Apenas resultados previamente consultados estão disponíveis.</p>
          </div>
        )}
      </div>
      
      {/* Abas */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 font-medium ${abaAtiva === 'busca' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setAbaAtiva('busca')}
        >
          Busca
        </button>
        <button
          className={`py-2 px-4 font-medium ${abaAtiva === 'favoritos' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setAbaAtiva('favoritos')}
        >
          Favoritos
        </button>
      </div>
      
      {/* Conteúdo da aba de busca */}
      {abaAtiva === 'busca' && (
        <div>
          {/* Formulário de busca */}
          <form onSubmit={realizarBusca} className="mb-6 bg-white p-6 rounded-lg shadow-md">
            <div className="mb-4">
              <label htmlFor="termo" className="block text-gray-700 font-medium mb-2">
                Termo de busca
              </label>
              <input
                type="text"
                id="termo"
                value={termo}
                onChange={(e) => setTermo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: auxílio-doença, aposentadoria por invalidez, etc."
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Fontes de pesquisa
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(FONTES_ENUM).map(([nome, valor]) => (
                  <label key={valor} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={fontesSelecionadas.includes(valor)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFontesSelecionadas([...fontesSelecionadas, valor]);
                        } else {
                          setFontesSelecionadas(fontesSelecionadas.filter(f => f !== valor));
                        }
                      }}
                      className="form-checkbox h-5 w-5 text-blue-600"
                    />
                    <span className="ml-2 text-gray-700">{nome}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                type="submit"
                disabled={carregando || !statusConexao}
                className={`px-6 py-2 rounded-md font-medium ${
                  carregando || !statusConexao
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {carregando ? 'Buscando...' : 'Buscar'}
              </button>
              
              {resultados.length > 0 && (
                <button
                  type="button"
                  onClick={exportarResultados}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium"
                >
                  Exportar CSV
                </button>
              )}
            </div>
          </form>
          
          {/* Mensagem de erro */}
          {erro && (
            <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
              <p>{erro}</p>
            </div>
          )}
          
          {/* Resultados */}
          {resultados.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {resultados.length} {resultados.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
              </h2>
              
              <div className="space-y-6">
                {resultados.map((resultado) => (
                  <div key={resultado.id} className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">{resultado.titulo}</h3>
                      <button
                        onClick={() => alternarFavorito(resultado.id, resultado.favorito)}
                        className={`p-2 rounded-full ${resultado.favorito ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-gray-500'}`}
                      >
                        <svg className="h-6 w-6" fill={resultado.favorito ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Fonte:</span> {resultado.fonte.toUpperCase()}
                        {resultado.relator && <span> | <span className="font-medium">Relator:</span> {resultado.relator}</span>}
                        {resultado.dataJulgamento && <span> | <span className="font-medium">Data:</span> {resultado.dataJulgamento}</span>}
                      </p>
                    </div>
                    
                    {resultado.ementa && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-700 mb-1">Ementa:</h4>
                        <p className="text-gray-600 text-sm">{resultado.ementa.length > 300 ? `${resultado.ementa.substring(0, 300)}...` : resultado.ementa}</p>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      {resultado.link && (
                        <a
                          href={resultado.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Ver documento completo
                        </a>
                      )}
                      
                      <button
                        onClick={() => setJurisprudenciaSelecionada(resultado)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        {resultado.anotacoes?.length > 0 ? 'Ver/Adicionar anotações' : 'Adicionar anotação'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Conteúdo da aba de favoritos */}
      {abaAtiva === 'favoritos' && (
        <div>
          <div className="mb-6 bg-white p-6 rounded-lg shadow-md">
            <div className="mb-4">
              <label htmlFor="filtroFavoritos" className="block text-gray-700 font-medium mb-2">
                Filtrar favoritos
              </label>
              <input
                type="text"
                id="filtroFavoritos"
                value={filtroFavoritos}
                onChange={(e) => setFiltroFavoritos(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Filtrar por título, ementa ou relator"
              />
            </div>
            
            {favoritos.length > 0 && (
              <button
                type="button"
                onClick={exportarResultados}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium"
              >
                Exportar Favoritos (CSV)
              </button>
            )}
          </div>
          
          {/* Mensagem de erro */}
          {erro && (
            <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
              <p>{erro}</p>
            </div>
          )}
          
          {/* Lista de favoritos */}
          {favoritosFiltrados.length > 0 ? (
            <div className="space-y-6">
              {favoritosFiltrados.map((favorito) => (
                <div key={favorito.id} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{favorito.titulo}</h3>
                    <button
                      onClick={() => alternarFavorito(favorito.id, true)}
                      className="p-2 rounded-full text-yellow-500 hover:text-yellow-600"
                    >
                      <svg className="h-6 w-6" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Fonte:</span> {favorito.fonte.toUpperCase()}
                      {favorito.relator && <span> | <span className="font-medium">Relator:</span> {favorito.relator}</span>}
                      {favorito.dataJulgamento && <span> | <span className="font-medium">Data:</span> {favorito.dataJulgamento}</span>}
                    </p>
                  </div>
                  
                  {favorito.ementa && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-1">Ementa:</h4>
                      <p className="text-gray-600 text-sm">{favorito.ementa.length > 300 ? `${favorito.ementa.substring(0, 300)}...` : favorito.ementa}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    {favorito.link && (
                      <a
                        href={favorito.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Ver documento completo
                      </a>
                    )}
                    
                    <button
                      onClick={() => setJurisprudenciaSelecionada(favorito)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      {favorito.anotacoes?.length > 0 ? 'Ver/Adicionar anotações' : 'Adicionar anotação'}
                    </button>
                  </div>
                  
                  {/* Exibir anotações existentes */}
                  {favorito.anotacoes?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="font-medium text-gray-700 mb-2">Anotações:</h4>
                      <ul className="space-y-2">
                        {favorito.anotacoes.map((nota) => (
                          <li key={nota.id} className="bg-gray-50 p-3 rounded text-sm">
                            <p className="text-gray-600">{nota.texto}</p>
                            <p className="text-gray-400 text-xs mt-1">
                              {new Date(nota.data).toLocaleString()}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <p className="text-gray-600">Você ainda não tem jurisprudências favoritas.</p>
              <p className="text-gray-600 mt-2">
                Realize buscas e marque as jurisprudências como favoritas para acessá-las facilmente.
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Modal de anotações */}
      {jurisprudenciaSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-800">{jurisprudenciaSelecionada.titulo}</h3>
                <button
                  onClick={() => setJurisprudenciaSelecionada(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Anotações existentes */}
              {jurisprudenciaSelecionada.anotacoes?.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-3">Anotações existentes:</h4>
                  <ul className="space-y-3">
                    {jurisprudenciaSelecionada.anotacoes.map((nota) => (
                      <li key={nota.id} className="bg-gray-50 p-4 rounded">
                        <p className="text-gray-600">{nota.texto}</p>
                        <p className="text-gray-400 text-xs mt-2">
                          {new Date(nota.data).toLocaleString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Formulário para nova anotação */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Adicionar nova anotação:</h4>
                <textarea
                  value={anotacao}
                  onChange={(e) => setAnotacao(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                  placeholder="Digite sua anotação aqui..."
                ></textarea>
                
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => setJurisprudenciaSelecionada(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-2 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={salvarAnotacao}
                    disabled={!anotacao.trim()}
                    className={`px-4 py-2 rounded-md ${
                      !anotacao.trim()
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    Salvar Anotação
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
