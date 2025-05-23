/**
 * Módulo para gerenciamento de métricas de campanhas de WhatsApp
 * 
 * Este módulo implementa as funcionalidades para:
 * - Calcular métricas detalhadas de campanhas de WhatsApp
 * - Gerar relatórios de desempenho de campanhas
 * - Identificar melhores horários para envio de mensagens
 * - Analisar taxas de resposta e conversão
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '../supabase/types';

// Tipos
export type MetricaCampanha = Database['public']['Tables']['metricas_campanhas']['Row'];
export type Campanha = Database['public']['Tables']['campanhas_whatsapp']['Row'];

// Interface para resumo de métricas
export interface ResumoCampanha {
  id: string;
  nome: string;
  dataEnvio: string | null;
  totalLeads: number;
  totalEnviadas: number;
  totalEntregues: number;
  totalLidas: number;
  totalRespondidas: number;
  taxaEntrega: number;
  taxaLeitura: number;
  taxaResposta: number;
  taxaConversao: number;
  tempoMedioResposta: number | null;
  melhorHorarioEnvio: string | null;
}

// Interface para métricas diárias
export interface MetricaDiaria {
  data: string;
  enviadas: number;
  entregues: number;
  lidas: number;
  respondidas: number;
  conversoes: number;
}

// Interface para métricas por horário
export interface MetricaPorHorario {
  hora: string;
  enviadas: number;
  taxaResposta: number;
  tempoMedioResposta: number | null;
}

/**
 * Classe para gerenciamento de métricas de campanhas
 */
export class MetricasCampanhasService {
  private supabase;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
  }

  /**
   * Busca resumo de métricas para todas as campanhas
   */
  async buscarResumoCampanhas(): Promise<ResumoCampanha[]> {
    const { data, error } = await this.supabase
      .from('campanhas_whatsapp')
      .select(`
        id,
        nome,
        data_envio,
        total_leads,
        enviados,
        falhas,
        respostas,
        taxa_entrega,
        taxa_leitura,
        taxa_resposta,
        taxa_conversao,
        melhor_horario_envio
      `)
      .order('data_envio', { ascending: false });

    if (error) {
      console.error('Erro ao buscar resumo de campanhas:', error);
      return [];
    }

    return (data || []).map(campanha => ({
      id: campanha.id,
      nome: campanha.nome,
      dataEnvio: campanha.data_envio,
      totalLeads: campanha.total_leads || 0,
      totalEnviadas: campanha.enviados || 0,
      totalEntregues: Math.round(((campanha.enviados || 0) * (campanha.taxa_entrega || 0)) / 100),
      totalLidas: Math.round(((campanha.enviados || 0) * (campanha.taxa_leitura || 0)) / 100),
      totalRespondidas: campanha.respostas || 0,
      taxaEntrega: campanha.taxa_entrega || 0,
      taxaLeitura: campanha.taxa_leitura || 0,
      taxaResposta: campanha.taxa_resposta || 0,
      taxaConversao: campanha.taxa_conversao || 0,
      tempoMedioResposta: null, // Será preenchido com dados da tabela de métricas
      melhorHorarioEnvio: campanha.melhor_horario_envio
    }));
  }

  /**
   * Busca métricas detalhadas para uma campanha específica
   */
  async buscarMetricasCampanha(campanhaId: string): Promise<MetricaCampanha[]> {
    const { data, error } = await this.supabase
      .from('metricas_campanhas')
      .select('*')
      .eq('campanha_id', campanhaId)
      .order('data_referencia', { ascending: true });

    if (error) {
      console.error('Erro ao buscar métricas da campanha:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Busca métricas diárias para uma campanha
   */
  async buscarMetricasDiarias(campanhaId: string): Promise<MetricaDiaria[]> {
    const metricas = await this.buscarMetricasCampanha(campanhaId);
    
    return metricas.map(metrica => ({
      data: new Date(metrica.data_referencia).toLocaleDateString(),
      enviadas: metrica.total_enviadas,
      entregues: metrica.total_entregues,
      lidas: metrica.total_lidas,
      respondidas: metrica.total_respondidas,
      conversoes: metrica.conversoes
    }));
  }

  /**
   * Calcula métricas por horário para identificar melhores momentos de envio
   */
  async calcularMetricasPorHorario(campanhaId: string): Promise<MetricaPorHorario[]> {
    // Esta função requer uma consulta mais complexa que será implementada no backend
    // Por enquanto, vamos fazer uma simulação com dados da tabela de métricas
    
    const { data: campanha, error: campanhaError } = await this.supabase
      .from('campanhas_whatsapp')
      .select('melhor_horario_envio')
      .eq('id', campanhaId)
      .single();
      
    if (campanhaError) {
      console.error('Erro ao buscar campanha:', campanhaError);
      return [];
    }
    
    // Criar dados simulados baseados no melhor horário
    const melhorHora = campanha.melhor_horario_envio ? 
      parseInt(campanha.melhor_horario_envio.split(':')[0]) : 
      12;
    
    const horas: MetricaPorHorario[] = [];
    
    // Gerar dados para cada hora do dia
    for (let i = 8; i <= 20; i++) {
      const horaFormatada = `${i.toString().padStart(2, '0')}:00`;
      const proximidadeMelhorHora = 1 - Math.min(Math.abs(i - melhorHora) / 12, 1);
      
      horas.push({
        hora: horaFormatada,
        enviadas: Math.floor(Math.random() * 50) + 10,
        taxaResposta: Math.min(Math.max((Math.random() * 20 + 10) * proximidadeMelhorHora, 5), 40),
        tempoMedioResposta: Math.floor(Math.random() * 120) + 30
      });
    }
    
    // Ordenar por taxa de resposta (melhor primeiro)
    return horas.sort((a, b) => b.taxaResposta - a.taxaResposta);
  }

  /**
   * Calcula métricas completas para uma campanha
   */
  async calcularMetricasCampanha(campanhaId: string): Promise<boolean> {
    try {
      // Chamar a função RPC do Supabase para calcular métricas
      const { data, error } = await this.supabase
        .rpc('calcular_metricas_campanha', { campanha_id_param: campanhaId });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Erro ao calcular métricas da campanha:', error);
      return false;
    }
  }

  /**
   * Busca detalhes de conversão para uma campanha
   */
  async buscarDetalhesConversao(campanhaId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('leads')
      .select(`
        id,
        nome,
        telefone,
        email,
        status,
        data_conversao,
        origem_conversao
      `)
      .eq('campanha_conversao', campanhaId);

    if (error) {
      console.error('Erro ao buscar detalhes de conversão:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Gera relatório comparativo entre campanhas
   */
  async gerarRelatorioComparativo(campanhasIds: string[]): Promise<any> {
    if (!campanhasIds.length) return null;

    const { data, error } = await this.supabase
      .from('campanhas_whatsapp')
      .select(`
        id,
        nome,
        data_envio,
        total_leads,
        enviados,
        taxa_entrega,
        taxa_leitura,
        taxa_resposta,
        taxa_conversao
      `)
      .in('id', campanhasIds);

    if (error) {
      console.error('Erro ao gerar relatório comparativo:', error);
      return null;
    }

    // Organizar dados para comparação
    const comparativo = {
      campanhas: data || [],
      metricas: [
        { nome: 'Taxa de Entrega', chave: 'taxa_entrega' },
        { nome: 'Taxa de Leitura', chave: 'taxa_leitura' },
        { nome: 'Taxa de Resposta', chave: 'taxa_resposta' },
        { nome: 'Taxa de Conversão', chave: 'taxa_conversao' }
      ],
      dados: [] as any[]
    };

    // Formatar dados para gráficos comparativos
    comparativo.metricas.forEach(metrica => {
      const dadosMetrica = {
        nome: metrica.nome,
        dados: comparativo.campanhas.map(campanha => ({
          campanha: campanha.nome,
          valor: campanha[metrica.chave as keyof typeof campanha] || 0
        }))
      };
      comparativo.dados.push(dadosMetrica);
    });

    return comparativo;
  }

  /**
   * Identifica o melhor horário para envio de mensagens baseado em dados históricos
   */
  async identificarMelhorHorarioEnvio(): Promise<string | null> {
    try {
      // Esta é uma consulta complexa que seria melhor implementada como uma função no banco de dados
      // Por enquanto, vamos fazer uma consulta simplificada
      
      const { data, error } = await this.supabase
        .from('mensagens_whatsapp')
        .select(`
          data_envio,
          data_leitura,
          tempo_resposta
        `)
        .eq('direcao', 'Saída')
        .not('data_leitura', 'is', null)
        .order('tempo_resposta', { ascending: true })
        .limit(1000);

      if (error) throw error;

      if (!data || data.length === 0) return null;

      // Agrupar por hora do dia
      const horasEficacia = new Map<number, { total: number, soma: number, count: number }>();
      
      data.forEach(msg => {
        if (!msg.data_envio) return;
        
        const hora = new Date(msg.data_envio).getHours();
        const tempoResposta = msg.tempo_resposta || 0;
        
        if (!horasEficacia.has(hora)) {
          horasEficacia.set(hora, { total: 0, soma: 0, count: 0 });
        }
        
        const atual = horasEficacia.get(hora)!;
        atual.total += 1;
        atual.soma += tempoResposta;
        atual.count += msg.data_leitura ? 1 : 0;
      });
      
      // Calcular eficácia (combinação de taxa de leitura e tempo de resposta)
      let melhorHora = 12; // padrão meio-dia
      let melhorPontuacao = -1;
      
      horasEficacia.forEach((dados, hora) => {
        if (dados.total < 10) return; // ignorar horas com poucos dados
        
        const taxaLeitura = dados.count / dados.total;
        const tempoMedioResposta = dados.soma / dados.count;
        
        // Fórmula de pontuação: maior taxa de leitura e menor tempo de resposta
        const pontuacao = taxaLeitura * 100 - (tempoMedioResposta / 60);
        
        if (pontuacao > melhorPontuacao) {
          melhorPontuacao = pontuacao;
          melhorHora = hora;
        }
      });
      
      return `${melhorHora.toString().padStart(2, '0')}:00:00`;
    } catch (error) {
      console.error('Erro ao identificar melhor horário de envio:', error);
      return null;
    }
  }
}

// Utilitário para criar instância do serviço
export function createMetricasCampanhasService(): MetricasCampanhasService {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return new MetricasCampanhasService(supabaseUrl, supabaseKey);
}

// Exportar uma instância padrão para uso direto
export const metricasCampanhasService = createMetricasCampanhasService();
