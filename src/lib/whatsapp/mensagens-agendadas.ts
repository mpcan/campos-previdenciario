/**
 * Módulo para gerenciamento de mensagens agendadas do WhatsApp
 * 
 * Este módulo implementa as funcionalidades para:
 * - Criar mensagens agendadas manualmente
 * - Processar regras de automação para criar mensagens agendadas
 * - Enviar mensagens agendadas no momento apropriado
 * - Gerenciar regras de automação de mensagens
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '../supabase/types';
import { formatarTextoMensagem } from './utils';

// Tipos
export type MensagemAgendada = Database['public']['Tables']['mensagens_agendadas']['Row'];
export type RegraAutomacao = Database['public']['Tables']['regras_automacao_mensagens']['Row'];
export type Lead = Database['public']['Tables']['leads']['Row'];
export type ModeloMensagem = Database['public']['Tables']['modelos_mensagem']['Row'];

// Status possíveis para mensagens agendadas
export enum StatusMensagemAgendada {
  AGENDADA = 'Agendada',
  ENVIADA = 'Enviada',
  FALHA = 'Falha',
  CANCELADA = 'Cancelada'
}

// Tipos de eventos que podem disparar regras de automação
export enum EventoGatilho {
  CADASTRO_LEAD = 'CADASTRO_LEAD',
  ATUALIZACAO_STATUS = 'ATUALIZACAO_STATUS',
  DATA_ESPECIFICA = 'DATA_ESPECIFICA'
}

// Interface para criação de mensagem agendada
export interface CriarMensagemAgendadaParams {
  leadId: string;
  conteudo: string;
  dataAgendamento: Date;
  campanhaId?: string;
  modeloId?: string;
  tipo?: string;
  regraAgendamento?: string;
  condicaoEnvio?: Record<string, any>;
  criadoPor?: string;
}

// Interface para criação de regra de automação
export interface CriarRegraAutomacaoParams {
  nome: string;
  descricao?: string;
  eventoGatilho: EventoGatilho;
  diasAposEvento?: number;
  horaEnvio?: string;
  diasSemana?: string[];
  modeloId?: string;
  conteudoPersonalizado?: string;
  condicoes?: Record<string, any>;
  criadoPor?: string;
}

/**
 * Classe para gerenciamento de mensagens agendadas
 */
export class MensagensAgendadasService {
  private supabase;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
  }

  /**
   * Cria uma nova mensagem agendada
   */
  async criarMensagemAgendada(params: CriarMensagemAgendadaParams): Promise<MensagemAgendada | null> {
    const { data, error } = await this.supabase
      .from('mensagens_agendadas')
      .insert({
        lead_id: params.leadId,
        campanha_id: params.campanhaId,
        modelo_id: params.modeloId,
        conteudo: params.conteudo,
        tipo: params.tipo || 'Texto',
        data_agendamento: params.dataAgendamento.toISOString(),
        status: StatusMensagemAgendada.AGENDADA,
        regra_agendamento: params.regraAgendamento,
        condicao_envio: params.condicaoEnvio,
        criado_por: params.criadoPor
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar mensagem agendada:', error);
      return null;
    }

    return data;
  }

  /**
   * Cancela uma mensagem agendada
   */
  async cancelarMensagemAgendada(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('mensagens_agendadas')
      .update({
        status: StatusMensagemAgendada.CANCELADA
      })
      .eq('id', id)
      .eq('status', StatusMensagemAgendada.AGENDADA);

    if (error) {
      console.error('Erro ao cancelar mensagem agendada:', error);
      return false;
    }

    return true;
  }

  /**
   * Busca mensagens agendadas por lead
   */
  async buscarMensagensPorLead(leadId: string): Promise<MensagemAgendada[]> {
    const { data, error } = await this.supabase
      .from('mensagens_agendadas')
      .select('*')
      .eq('lead_id', leadId)
      .order('data_agendamento', { ascending: true });

    if (error) {
      console.error('Erro ao buscar mensagens agendadas:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Busca mensagens agendadas pendentes de envio
   */
  async buscarMensagensPendentes(): Promise<MensagemAgendada[]> {
    const { data, error } = await this.supabase
      .from('mensagens_agendadas')
      .select(`
        *,
        lead:leads(id, nome, telefone, email)
      `)
      .eq('status', StatusMensagemAgendada.AGENDADA)
      .lte('data_agendamento', new Date().toISOString())
      .order('data_agendamento', { ascending: true });

    if (error) {
      console.error('Erro ao buscar mensagens pendentes:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Processa e envia mensagens agendadas pendentes
   */
  async processarMensagensPendentes(): Promise<number> {
    const mensagensPendentes = await this.buscarMensagensPendentes();
    let enviadas = 0;

    for (const mensagem of mensagensPendentes) {
      try {
        // Personalizar a mensagem com dados do lead
        const lead = mensagem.lead as unknown as Lead;
        const conteudoPersonalizado = formatarTextoMensagem(mensagem.conteudo, {
          nome: lead.nome,
          telefone: lead.telefone,
          email: lead.email || ''
        });

        // Enviar a mensagem
        const { data, error } = await this.supabase
          .from('mensagens_whatsapp')
          .insert({
            lead_id: mensagem.lead_id,
            campanha_id: mensagem.campanha_id,
            direcao: 'Saída',
            conteudo: conteudoPersonalizado,
            tipo: mensagem.tipo,
            status: 'Enviado',
            data_envio: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;

        // Atualizar status da mensagem agendada
        await this.supabase
          .from('mensagens_agendadas')
          .update({
            status: StatusMensagemAgendada.ENVIADA,
            data_envio: new Date().toISOString()
          })
          .eq('id', mensagem.id);

        // Atualizar data da última interação do lead
        await this.supabase
          .from('leads')
          .update({
            data_ultima_interacao: new Date().toISOString()
          })
          .eq('id', mensagem.lead_id);

        // Registrar interação
        await this.supabase
          .from('interacoes_lead')
          .insert({
            lead_id: mensagem.lead_id,
            tipo: 'Mensagem Agendada',
            descricao: `Mensagem agendada enviada: ${conteudoPersonalizado.substring(0, 100)}${conteudoPersonalizado.length > 100 ? '...' : ''}`,
            data_interacao: new Date().toISOString()
          });

        enviadas++;
      } catch (error) {
        console.error(`Erro ao processar mensagem agendada ${mensagem.id}:`, error);

        // Atualizar status da mensagem para falha
        await this.supabase
          .from('mensagens_agendadas')
          .update({
            status: StatusMensagemAgendada.FALHA,
            erro: error instanceof Error ? error.message : 'Erro desconhecido'
          })
          .eq('id', mensagem.id);
      }
    }

    return enviadas;
  }

  /**
   * Cria uma nova regra de automação
   */
  async criarRegraAutomacao(params: CriarRegraAutomacaoParams): Promise<RegraAutomacao | null> {
    const { data, error } = await this.supabase
      .from('regras_automacao_mensagens')
      .insert({
        nome: params.nome,
        descricao: params.descricao,
        evento_gatilho: params.eventoGatilho,
        dias_apos_evento: params.diasAposEvento,
        hora_envio: params.horaEnvio,
        dias_semana: params.diasSemana,
        modelo_id: params.modeloId,
        conteudo_personalizado: params.conteudoPersonalizado,
        condicoes: params.condicoes,
        ativo: true,
        criado_por: params.criadoPor
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar regra de automação:', error);
      return null;
    }

    return data;
  }

  /**
   * Atualiza uma regra de automação existente
   */
  async atualizarRegraAutomacao(id: string, params: Partial<CriarRegraAutomacaoParams>): Promise<RegraAutomacao | null> {
    const { data, error } = await this.supabase
      .from('regras_automacao_mensagens')
      .update({
        nome: params.nome,
        descricao: params.descricao,
        evento_gatilho: params.eventoGatilho,
        dias_apos_evento: params.diasAposEvento,
        hora_envio: params.horaEnvio,
        dias_semana: params.diasSemana,
        modelo_id: params.modeloId,
        conteudo_personalizado: params.conteudoPersonalizado,
        condicoes: params.condicoes
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar regra de automação:', error);
      return null;
    }

    return data;
  }

  /**
   * Ativa ou desativa uma regra de automação
   */
  async alterarStatusRegraAutomacao(id: string, ativo: boolean): Promise<boolean> {
    const { error } = await this.supabase
      .from('regras_automacao_mensagens')
      .update({ ativo })
      .eq('id', id);

    if (error) {
      console.error('Erro ao alterar status da regra de automação:', error);
      return false;
    }

    return true;
  }

  /**
   * Busca todas as regras de automação
   */
  async buscarRegrasAutomacao(apenasAtivas = false): Promise<RegraAutomacao[]> {
    let query = this.supabase
      .from('regras_automacao_mensagens')
      .select('*')
      .order('nome');

    if (apenasAtivas) {
      query = query.eq('ativo', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar regras de automação:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Processa regras de automação para criar mensagens agendadas
   */
  async processarRegrasAutomacao(): Promise<number> {
    // Chamar a função do banco de dados que processa as regras
    const { data, error } = await this.supabase
      .rpc('criar_mensagens_agendadas_por_regra');

    if (error) {
      console.error('Erro ao processar regras de automação:', error);
      return 0;
    }

    return data || 0;
  }

  /**
   * Cria mensagens agendadas para leads recém-cadastrados
   */
  async criarMensagensParaNovoLead(leadId: string, nome: string): Promise<number> {
    const { data: regras, error: regrasError } = await this.supabase
      .from('regras_automacao_mensagens')
      .select('*')
      .eq('evento_gatilho', EventoGatilho.CADASTRO_LEAD)
      .eq('ativo', true);

    if (regrasError) {
      console.error('Erro ao buscar regras para novo lead:', regrasError);
      return 0;
    }

    let mensagensCriadas = 0;

    for (const regra of regras || []) {
      try {
        // Determinar conteúdo da mensagem
        let conteudo = '';
        
        if (regra.modelo_id) {
          // Buscar conteúdo do modelo
          const { data: modelo, error: modeloError } = await this.supabase
            .from('modelos_mensagem')
            .select('conteudo')
            .eq('id', regra.modelo_id)
            .single();
            
          if (modeloError) throw modeloError;
          conteudo = modelo.conteudo;
        } else {
          conteudo = regra.conteudo_personalizado || '';
        }

        // Personalizar mensagem com nome do lead
        conteudo = conteudo.replace('{{nome}}', nome);

        // Calcular data de agendamento
        const dataAgendamento = new Date();
        if (regra.dias_apos_evento) {
          dataAgendamento.setDate(dataAgendamento.getDate() + regra.dias_apos_evento);
        }

        // Definir hora específica se configurada
        if (regra.hora_envio) {
          const [hora, minuto] = regra.hora_envio.split(':').map(Number);
          dataAgendamento.setHours(hora, minuto, 0, 0);
          
          // Se a hora já passou hoje e estamos agendando para hoje (dias_apos_evento = 0),
          // então agendar para amanhã
          const agora = new Date();
          if (regra.dias_apos_evento === 0 && dataAgendamento < agora) {
            dataAgendamento.setDate(dataAgendamento.getDate() + 1);
          }
        }

        // Criar mensagem agendada
        const { data, error } = await this.supabase
          .from('mensagens_agendadas')
          .insert({
            lead_id: leadId,
            modelo_id: regra.modelo_id,
            conteudo,
            tipo: 'Texto',
            data_agendamento: dataAgendamento.toISOString(),
            status: StatusMensagemAgendada.AGENDADA,
            regra_agendamento: regra.dias_apos_evento ? `D+${regra.dias_apos_evento}` : undefined,
            criado_por: regra.criado_por
          })
          .select();

        if (error) throw error;
        mensagensCriadas++;
      } catch (error) {
        console.error(`Erro ao criar mensagem agendada para regra ${regra.id}:`, error);
      }
    }

    return mensagensCriadas;
  }
}

// Utilitário para criar instância do serviço
export function createMensagensAgendadasService(): MensagensAgendadasService {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return new MensagensAgendadasService(supabaseUrl, supabaseKey);
}

// Função auxiliar para formatar texto de mensagem
export function formatarTextoMensagem(texto: string, dados: Record<string, string>): string {
  let resultado = texto;
  for (const [chave, valor] of Object.entries(dados)) {
    resultado = resultado.replace(new RegExp(`{{${chave}}}`, 'g'), valor || '');
  }
  return resultado;
}

// Exportar uma instância padrão para uso direto
export const mensagensAgendadasService = createMensagensAgendadasService();
