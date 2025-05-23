/**
 * Módulo para integração com o Sistema de Gerenciamento de Agendamento (SGA) do INSS
 * 
 * Este módulo implementa as funcionalidades para:
 * - Consulta de disponibilidade de agendamentos
 * - Agendamento de atendimentos
 * - Consulta de agendamentos existentes
 * - Cancelamento de agendamentos
 */

import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../supabase/types';

// Tipos
export interface SGAConfig {
  baseUrl: string;
  apiKey: string;
  username: string;
  password: string;
  ambiente: 'homologacao' | 'producao';
}

export interface SGAUnidade {
  id: string;
  nome: string;
  endereco: string;
  cidade: string;
  uf: string;
  cep: string;
  telefone?: string;
}

export interface SGAServico {
  id: string;
  nome: string;
  categoria: string;
  descricao?: string;
}

export interface SGAHorarioDisponivel {
  data: string; // formato YYYY-MM-DD
  hora: string; // formato HH:MM
  unidadeId: string;
  servicoId: string;
}

export interface SGAAgendamento {
  id: string;
  protocolo: string;
  data: string;
  hora: string;
  unidadeId: string;
  servicoId: string;
  cpf: string;
  nome: string;
  email?: string;
  telefone?: string;
  status: 'Agendado' | 'Cancelado' | 'Realizado' | 'Remarcado';
  observacoes?: string;
}

export interface SGAAgendamentoRequest {
  servicoId: string;
  unidadeId: string;
  data: string;
  hora: string;
  cpf: string;
  nome: string;
  email?: string;
  telefone?: string;
  observacoes?: string;
}

export interface SGAResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Classe para integração com o SGA do INSS
 */
export class SGAService {
  private supabase;
  private config: SGAConfig;
  private token: string | null = null;
  private tokenExpiration: Date | null = null;

  constructor(supabaseUrl: string, supabaseKey: string, config: SGAConfig) {
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
    this.config = config;
  }

  /**
   * Autenticação no sistema SGA
   */
  private async authenticate(): Promise<boolean> {
    try {
      // Verificar se o token atual ainda é válido
      if (this.token && this.tokenExpiration && this.tokenExpiration > new Date()) {
        return true;
      }

      // Autenticar e obter novo token
      const response = await axios.post(`${this.config.baseUrl}/auth/login`, {
        username: this.config.username,
        password: this.config.password
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey
        }
      });

      if (response.data.token) {
        this.token = response.data.token;
        // Token válido por 1 hora (ou conforme retornado pela API)
        const expiresIn = response.data.expiresIn || 3600;
        this.tokenExpiration = new Date(Date.now() + expiresIn * 1000);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao autenticar no SGA:', error);
      return false;
    }
  }

  /**
   * Método auxiliar para fazer requisições autenticadas
   */
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any
  ): Promise<SGAResponse<T>> {
    try {
      // Garantir que estamos autenticados
      const authenticated = await this.authenticate();
      if (!authenticated) {
        return {
          success: false,
          error: 'Falha na autenticação com o SGA'
        };
      }

      // Configurar a requisição
      const config = {
        method,
        url: `${this.config.baseUrl}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey,
          'Authorization': `Bearer ${this.token}`
        },
        data: method !== 'GET' ? data : undefined
      };

      // Executar a requisição
      const response = await axios(config);

      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error(`Erro na requisição ${method} ${endpoint}:`, error);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Erro desconhecido'
      };
    }
  }

  /**
   * Busca unidades de atendimento disponíveis
   */
  async buscarUnidades(uf?: string, cidade?: string): Promise<SGAResponse<SGAUnidade[]>> {
    let endpoint = '/unidades';
    const params = [];
    
    if (uf) params.push(`uf=${encodeURIComponent(uf)}`);
    if (cidade) params.push(`cidade=${encodeURIComponent(cidade)}`);
    
    if (params.length > 0) {
      endpoint += `?${params.join('&')}`;
    }
    
    return this.request<SGAUnidade[]>('GET', endpoint);
  }

  /**
   * Busca serviços disponíveis
   */
  async buscarServicos(categoria?: string): Promise<SGAResponse<SGAServico[]>> {
    let endpoint = '/servicos';
    
    if (categoria) {
      endpoint += `?categoria=${encodeURIComponent(categoria)}`;
    }
    
    return this.request<SGAServico[]>('GET', endpoint);
  }

  /**
   * Busca horários disponíveis para agendamento
   */
  async buscarHorariosDisponiveis(
    servicoId: string,
    unidadeId: string,
    dataInicio: string,
    dataFim: string
  ): Promise<SGAResponse<SGAHorarioDisponivel[]>> {
    const endpoint = `/agendamentos/horarios-disponiveis?servicoId=${encodeURIComponent(servicoId)}&unidadeId=${encodeURIComponent(unidadeId)}&dataInicio=${encodeURIComponent(dataInicio)}&dataFim=${encodeURIComponent(dataFim)}`;
    
    return this.request<SGAHorarioDisponivel[]>('GET', endpoint);
  }

  /**
   * Realiza um agendamento
   */
  async realizarAgendamento(
    agendamento: SGAAgendamentoRequest
  ): Promise<SGAResponse<SGAAgendamento>> {
    return this.request<SGAAgendamento>('POST', '/agendamentos', agendamento);
  }

  /**
   * Consulta agendamentos por CPF
   */
  async consultarAgendamentosPorCPF(cpf: string): Promise<SGAResponse<SGAAgendamento[]>> {
    const endpoint = `/agendamentos/cpf/${encodeURIComponent(cpf)}`;
    
    return this.request<SGAAgendamento[]>('GET', endpoint);
  }

  /**
   * Consulta um agendamento específico por protocolo
   */
  async consultarAgendamentoPorProtocolo(protocolo: string): Promise<SGAResponse<SGAAgendamento>> {
    const endpoint = `/agendamentos/protocolo/${encodeURIComponent(protocolo)}`;
    
    return this.request<SGAAgendamento>('GET', endpoint);
  }

  /**
   * Cancela um agendamento
   */
  async cancelarAgendamento(
    protocolo: string,
    motivo: string
  ): Promise<SGAResponse<{ success: boolean }>> {
    return this.request<{ success: boolean }>('DELETE', `/agendamentos/${encodeURIComponent(protocolo)}`, { motivo });
  }

  /**
   * Salva um agendamento no banco de dados local
   */
  async salvarAgendamentoLocal(
    agendamento: SGAAgendamento,
    processoId?: string,
    clienteId?: string,
    usuarioId?: string
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('agendamentos_sga')
        .insert({
          protocolo: agendamento.protocolo,
          data: agendamento.data,
          hora: agendamento.hora,
          unidade_id: agendamento.unidadeId,
          servico_id: agendamento.servicoId,
          cpf: agendamento.cpf,
          nome: agendamento.nome,
          email: agendamento.email,
          telefone: agendamento.telefone,
          status: agendamento.status,
          observacoes: agendamento.observacoes,
          processo_id: processoId,
          cliente_id: clienteId,
          criado_por: usuarioId
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao salvar agendamento local:', error);
      return false;
    }
  }

  /**
   * Atualiza o status de um agendamento local
   */
  async atualizarStatusAgendamentoLocal(
    protocolo: string,
    status: 'Agendado' | 'Cancelado' | 'Realizado' | 'Remarcado',
    observacoes?: string
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('agendamentos_sga')
        .update({
          status,
          observacoes: observacoes,
          atualizado_em: new Date().toISOString()
        })
        .eq('protocolo', protocolo);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao atualizar status do agendamento local:', error);
      return false;
    }
  }

  /**
   * Busca agendamentos locais por cliente
   */
  async buscarAgendamentosLocaisPorCliente(clienteId: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('agendamentos_sga')
        .select(`
          *,
          processo:processos(id, numero, tipo, beneficio_tipo),
          cliente:clientes(id, nome, cpf)
        `)
        .eq('cliente_id', clienteId)
        .order('data', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar agendamentos locais por cliente:', error);
      return [];
    }
  }

  /**
   * Busca agendamentos locais por processo
   */
  async buscarAgendamentosLocaisPorProcesso(processoId: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('agendamentos_sga')
        .select(`
          *,
          processo:processos(id, numero, tipo, beneficio_tipo),
          cliente:clientes(id, nome, cpf)
        `)
        .eq('processo_id', processoId)
        .order('data', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar agendamentos locais por processo:', error);
      return [];
    }
  }
}

// Configurações para ambientes de homologação e produção
const sgaConfigs = {
  homologacao: {
    baseUrl: 'https://api-sga.homologacao.inss.gov.br/api/v1',
    apiKey: process.env.SGA_API_KEY_HML || '',
    username: process.env.SGA_USERNAME_HML || '',
    password: process.env.SGA_PASSWORD_HML || '',
    ambiente: 'homologacao' as const
  },
  producao: {
    baseUrl: 'https://api-sga.inss.gov.br/api/v1',
    apiKey: process.env.SGA_API_KEY || '',
    username: process.env.SGA_USERNAME || '',
    password: process.env.SGA_PASSWORD || '',
    ambiente: 'producao' as const
  }
};

// Utilitário para criar instância do serviço
export function createSGAService(ambiente: 'homologacao' | 'producao' = 'homologacao'): SGAService {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return new SGAService(supabaseUrl, supabaseKey, sgaConfigs[ambiente]);
}

// Exportar uma instância padrão para uso direto
export const sgaService = createSGAService(
  (process.env.SGA_AMBIENTE || 'homologacao') as 'homologacao' | 'producao'
);
