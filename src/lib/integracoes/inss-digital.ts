/**
 * Módulo para integração com o INSS Digital
 * 
 * Este módulo implementa as funcionalidades para:
 * - Consulta de benefícios
 * - Consulta de processos administrativos
 * - Envio de documentos
 * - Acompanhamento de requerimentos
 */

import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../supabase/types';

// Tipos
export interface INSSDigitalConfig {
  baseUrl: string;
  apiKey: string;
  clientId: string;
  clientSecret: string;
  ambiente: 'homologacao' | 'producao';
}

export interface INSSBeneficio {
  nb: string; // Número do benefício
  tipo: string;
  situacao: string;
  dib: string; // Data de início do benefício
  dcb?: string; // Data de cessação do benefício
  valorAtual?: number;
  titular: {
    cpf: string;
    nome: string;
    dataNascimento: string;
  };
}

export interface INSSProcesso {
  protocolo: string;
  tipo: string;
  situacao: string;
  dataAbertura: string;
  dataAtualizacao: string;
  unidade: string;
  servico: string;
  documentos: INSSDocumento[];
}

export interface INSSDocumento {
  id: string;
  tipo: string;
  nome: string;
  dataEnvio: string;
  tamanho: number;
  status: string;
}

export interface INSSRequerimento {
  protocolo: string;
  servico: string;
  situacao: string;
  dataRequerimento: string;
  dataAtualizacao: string;
  resultado?: string;
  observacoes?: string;
}

export interface INSSResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Classe para integração com o INSS Digital
 */
export class INSSDigitalService {
  private supabase;
  private config: INSSDigitalConfig;
  private token: string | null = null;
  private tokenExpiration: Date | null = null;

  constructor(supabaseUrl: string, supabaseKey: string, config: INSSDigitalConfig) {
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
    this.config = config;
  }

  /**
   * Autenticação no sistema INSS Digital
   */
  private async authenticate(): Promise<boolean> {
    try {
      // Verificar se o token atual ainda é válido
      if (this.token && this.tokenExpiration && this.tokenExpiration > new Date()) {
        return true;
      }

      // Autenticar e obter novo token
      const params = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret
      });

      const response = await axios.post(`${this.config.baseUrl}/auth/token`, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-API-Key': this.config.apiKey
        }
      });

      if (response.data.access_token) {
        this.token = response.data.access_token;
        // Token válido por tempo definido pela API (ou 1 hora por padrão)
        const expiresIn = response.data.expires_in || 3600;
        this.tokenExpiration = new Date(Date.now() + expiresIn * 1000);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao autenticar no INSS Digital:', error);
      return false;
    }
  }

  /**
   * Método auxiliar para fazer requisições autenticadas
   */
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    contentType: string = 'application/json'
  ): Promise<INSSResponse<T>> {
    try {
      // Garantir que estamos autenticados
      const authenticated = await this.authenticate();
      if (!authenticated) {
        return {
          success: false,
          error: 'Falha na autenticação com o INSS Digital'
        };
      }

      // Configurar a requisição
      const config = {
        method,
        url: `${this.config.baseUrl}${endpoint}`,
        headers: {
          'Content-Type': contentType,
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
   * Consulta benefícios por CPF
   */
  async consultarBeneficiosPorCPF(cpf: string): Promise<INSSResponse<INSSBeneficio[]>> {
    const endpoint = `/beneficios/cpf/${cpf.replace(/\D/g, '')}`;
    return this.request<INSSBeneficio[]>('GET', endpoint);
  }

  /**
   * Consulta detalhes de um benefício específico
   */
  async consultarBeneficio(nb: string): Promise<INSSResponse<INSSBeneficio>> {
    const endpoint = `/beneficios/${nb.replace(/\D/g, '')}`;
    return this.request<INSSBeneficio>('GET', endpoint);
  }

  /**
   * Consulta processos administrativos por CPF
   */
  async consultarProcessosPorCPF(cpf: string): Promise<INSSResponse<INSSProcesso[]>> {
    const endpoint = `/processos/cpf/${cpf.replace(/\D/g, '')}`;
    return this.request<INSSProcesso[]>('GET', endpoint);
  }

  /**
   * Consulta detalhes de um processo específico
   */
  async consultarProcesso(protocolo: string): Promise<INSSResponse<INSSProcesso>> {
    const endpoint = `/processos/${protocolo}`;
    return this.request<INSSProcesso>('GET', endpoint);
  }

  /**
   * Envia um documento para um processo
   */
  async enviarDocumento(
    protocolo: string,
    tipo: string,
    nome: string,
    arquivo: Buffer,
    mimeType: string
  ): Promise<INSSResponse<INSSDocumento>> {
    const endpoint = `/processos/${protocolo}/documentos`;
    
    // Criar FormData para envio do arquivo
    const formData = new FormData();
    formData.append('tipo', tipo);
    formData.append('nome', nome);
    
    // Criar Blob a partir do Buffer
    const blob = new Blob([arquivo], { type: mimeType });
    formData.append('arquivo', blob, nome);
    
    return this.request<INSSDocumento>('POST', endpoint, formData, 'multipart/form-data');
  }

  /**
   * Consulta requerimentos por CPF
   */
  async consultarRequerimentosPorCPF(cpf: string): Promise<INSSResponse<INSSRequerimento[]>> {
    const endpoint = `/requerimentos/cpf/${cpf.replace(/\D/g, '')}`;
    return this.request<INSSRequerimento[]>('GET', endpoint);
  }

  /**
   * Consulta detalhes de um requerimento específico
   */
  async consultarRequerimento(protocolo: string): Promise<INSSResponse<INSSRequerimento>> {
    const endpoint = `/requerimentos/${protocolo}`;
    return this.request<INSSRequerimento>('GET', endpoint);
  }

  /**
   * Salva uma consulta de benefício no banco de dados local
   */
  async salvarConsultaBeneficioLocal(
    beneficio: INSSBeneficio,
    processoId?: string,
    clienteId?: string,
    usuarioId?: string
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('consultas_inss')
        .insert({
          tipo: 'Benefício',
          numero_beneficio: beneficio.nb,
          tipo_beneficio: beneficio.tipo,
          situacao: beneficio.situacao,
          data_inicio: beneficio.dib,
          data_fim: beneficio.dcb,
          valor_atual: beneficio.valorAtual,
          cpf_titular: beneficio.titular.cpf,
          nome_titular: beneficio.titular.nome,
          data_consulta: new Date().toISOString(),
          processo_id: processoId,
          cliente_id: clienteId,
          realizado_por: usuarioId,
          dados_completos: beneficio
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao salvar consulta de benefício local:', error);
      return false;
    }
  }

  /**
   * Salva um envio de documento no banco de dados local
   */
  async salvarEnvioDocumentoLocal(
    protocolo: string,
    documento: INSSDocumento,
    processoId?: string,
    clienteId?: string,
    usuarioId?: string
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('envios_inss')
        .insert({
          protocolo_processo: protocolo,
          documento_id: documento.id,
          tipo_documento: documento.tipo,
          nome_documento: documento.nome,
          data_envio: documento.dataEnvio,
          tamanho: documento.tamanho,
          status: documento.status,
          processo_id: processoId,
          cliente_id: clienteId,
          enviado_por: usuarioId
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao salvar envio de documento local:', error);
      return false;
    }
  }

  /**
   * Busca consultas de benefícios locais por cliente
   */
  async buscarConsultasBeneficiosPorCliente(clienteId: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('consultas_inss')
        .select(`
          *,
          processo:processos(id, numero, tipo, beneficio_tipo),
          cliente:clientes(id, nome, cpf)
        `)
        .eq('cliente_id', clienteId)
        .eq('tipo', 'Benefício')
        .order('data_consulta', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar consultas de benefícios por cliente:', error);
      return [];
    }
  }

  /**
   * Busca envios de documentos locais por processo
   */
  async buscarEnviosDocumentosPorProcesso(processoId: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('envios_inss')
        .select(`
          *,
          processo:processos(id, numero, tipo, beneficio_tipo),
          cliente:clientes(id, nome, cpf)
        `)
        .eq('processo_id', processoId)
        .order('data_envio', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar envios de documentos por processo:', error);
      return [];
    }
  }
}

// Configurações para ambientes de homologação e produção
const inssDigitalConfigs = {
  homologacao: {
    baseUrl: 'https://api-inssdigital.homologacao.inss.gov.br/api/v1',
    apiKey: process.env.INSS_API_KEY_HML || '',
    clientId: process.env.INSS_CLIENT_ID_HML || '',
    clientSecret: process.env.INSS_CLIENT_SECRET_HML || '',
    ambiente: 'homologacao' as const
  },
  producao: {
    baseUrl: 'https://api-inssdigital.inss.gov.br/api/v1',
    apiKey: process.env.INSS_API_KEY || '',
    clientId: process.env.INSS_CLIENT_ID || '',
    clientSecret: process.env.INSS_CLIENT_SECRET || '',
    ambiente: 'producao' as const
  }
};

// Utilitário para criar instância do serviço
export function createINSSDigitalService(ambiente: 'homologacao' | 'producao' = 'homologacao'): INSSDigitalService {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return new INSSDigitalService(supabaseUrl, supabaseKey, inssDigitalConfigs[ambiente]);
}

// Exportar uma instância padrão para uso direto
export const inssDigitalService = createINSSDigitalService(
  (process.env.INSS_AMBIENTE || 'homologacao') as 'homologacao' | 'producao'
);
