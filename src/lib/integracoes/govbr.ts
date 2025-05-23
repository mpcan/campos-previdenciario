/**
 * Módulo para integração com o Gov.br
 * 
 * Este módulo implementa as funcionalidades para:
 * - Autenticação de usuários via Gov.br
 * - Validação de documentos
 * - Obtenção de dados cadastrais
 * - Assinatura digital de documentos
 */

import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../supabase/types';

// Tipos
export interface GovBrConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  userInfoEndpoint: string;
  certificateEndpoint: string;
  documentValidationEndpoint: string;
  ambiente: 'homologacao' | 'producao';
}

export interface GovBrAuthResult {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  error?: string;
  cpf?: string;
  nome?: string;
  email?: string;
  nivelAutenticacao?: number;
}

export interface GovBrUserInfo {
  sub: string; // CPF
  name: string;
  email: string;
  email_verified: boolean;
  phone_number?: string;
  phone_number_verified?: boolean;
  amr: string[]; // Authentication Method Reference
  profile_level: string; // Nível de autenticação (1, 2 ou 3)
}

export interface GovBrDocumentValidationResult {
  success: boolean;
  documentId?: string;
  status?: string;
  validationDate?: string;
  error?: string;
}

/**
 * Classe para integração com o Gov.br
 */
export class GovBrService {
  private supabase;
  private config: GovBrConfig;

  constructor(supabaseUrl: string, supabaseKey: string, config: GovBrConfig) {
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
    this.config = config;
  }

  /**
   * Gera a URL de autorização para o Gov.br
   */
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      scope: this.config.scope,
      redirect_uri: this.config.redirectUri,
      state
    });

    return `${this.config.authorizationEndpoint}?${params.toString()}`;
  }

  /**
   * Troca o código de autorização por tokens de acesso
   */
  async exchangeCodeForTokens(code: string): Promise<GovBrAuthResult> {
    try {
      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.config.redirectUri
      });

      const response = await axios.post(this.config.tokenEndpoint, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`
        }
      });

      if (response.data.error) {
        return {
          success: false,
          error: response.data.error_description || response.data.error
        };
      }

      // Buscar informações do usuário
      const userInfo = await this.getUserInfo(response.data.access_token);

      return {
        success: true,
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
        cpf: userInfo.sub,
        nome: userInfo.name,
        email: userInfo.email,
        nivelAutenticacao: parseInt(userInfo.profile_level)
      };
    } catch (error) {
      console.error('Erro ao trocar código por tokens:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Obtém informações do usuário autenticado
   */
  async getUserInfo(accessToken: string): Promise<GovBrUserInfo> {
    try {
      const response = await axios.get(this.config.userInfoEndpoint, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao obter informações do usuário:', error);
      throw error;
    }
  }

  /**
   * Valida um documento usando o Gov.br
   */
  async validateDocument(accessToken: string, documentType: string, documentData: string): Promise<GovBrDocumentValidationResult> {
    try {
      const response = await axios.post(this.config.documentValidationEndpoint, {
        documentType,
        documentData
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        documentId: response.data.documentId,
        status: response.data.status,
        validationDate: response.data.validationDate
      };
    } catch (error) {
      console.error('Erro ao validar documento:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Assina um documento usando o Gov.br
   */
  async signDocument(accessToken: string, documentId: string, signatureType: string): Promise<any> {
    try {
      // Esta é uma implementação simulada, pois a API real do Gov.br para assinatura
      // pode ter requisitos específicos que não estão documentados publicamente
      const response = await axios.post(`${this.config.certificateEndpoint}/sign`, {
        documentId,
        signatureType
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        signatureId: response.data.signatureId,
        status: response.data.status,
        signatureDate: response.data.signatureDate
      };
    } catch (error) {
      console.error('Erro ao assinar documento:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Salva os dados de integração do usuário com Gov.br
   */
  async saveUserIntegration(userId: string, govBrData: GovBrAuthResult): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('integracao_govbr')
        .upsert({
          usuario_id: userId,
          cpf: govBrData.cpf,
          nome: govBrData.nome,
          email: govBrData.email,
          nivel_autenticacao: govBrData.nivelAutenticacao,
          access_token: govBrData.accessToken,
          refresh_token: govBrData.refreshToken,
          expira_em: new Date(Date.now() + (govBrData.expiresIn || 0) * 1000).toISOString(),
          ultima_autenticacao: new Date().toISOString(),
          ativo: true
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao salvar integração do usuário:', error);
      return false;
    }
  }

  /**
   * Verifica se o token de acesso do usuário ainda é válido
   */
  async isTokenValid(userId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('integracao_govbr')
        .select('expira_em, access_token')
        .eq('usuario_id', userId)
        .eq('ativo', true)
        .single();

      if (error || !data) return false;

      // Verificar se o token ainda é válido (com margem de segurança de 5 minutos)
      const expiresAt = new Date(data.expira_em).getTime();
      const now = Date.now() + 5 * 60 * 1000; // Adiciona 5 minutos de margem

      return expiresAt > now && !!data.access_token;
    } catch (error) {
      console.error('Erro ao verificar validade do token:', error);
      return false;
    }
  }

  /**
   * Atualiza o token de acesso usando o refresh token
   */
  async refreshAccessToken(userId: string): Promise<boolean> {
    try {
      // Buscar refresh token do usuário
      const { data, error } = await this.supabase
        .from('integracao_govbr')
        .select('refresh_token')
        .eq('usuario_id', userId)
        .eq('ativo', true)
        .single();

      if (error || !data || !data.refresh_token) return false;

      // Trocar refresh token por novo access token
      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: data.refresh_token
      });

      const response = await axios.post(this.config.tokenEndpoint, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`
        }
      });

      if (response.data.error) {
        console.error('Erro ao atualizar token:', response.data.error_description || response.data.error);
        return false;
      }

      // Atualizar tokens no banco de dados
      const { error: updateError } = await this.supabase
        .from('integracao_govbr')
        .update({
          access_token: response.data.access_token,
          refresh_token: response.data.refresh_token || data.refresh_token,
          expira_em: new Date(Date.now() + response.data.expires_in * 1000).toISOString(),
          ultima_autenticacao: new Date().toISOString()
        })
        .eq('usuario_id', userId);

      if (updateError) throw updateError;
      return true;
    } catch (error) {
      console.error('Erro ao atualizar token de acesso:', error);
      return false;
    }
  }

  /**
   * Obtém o token de acesso válido para um usuário
   */
  async getValidAccessToken(userId: string): Promise<string | null> {
    try {
      // Verificar se o token atual é válido
      const isValid = await this.isTokenValid(userId);
      
      // Se não for válido, tentar atualizar
      if (!isValid) {
        const refreshed = await this.refreshAccessToken(userId);
        if (!refreshed) return null;
      }
      
      // Buscar token atualizado
      const { data, error } = await this.supabase
        .from('integracao_govbr')
        .select('access_token')
        .eq('usuario_id', userId)
        .eq('ativo', true)
        .single();
        
      if (error || !data) return null;
      return data.access_token;
    } catch (error) {
      console.error('Erro ao obter token de acesso válido:', error);
      return null;
    }
  }
}

// Configurações para ambientes de homologação e produção
const govBrConfigs = {
  homologacao: {
    clientId: process.env.GOVBR_CLIENT_ID_HML || '',
    clientSecret: process.env.GOVBR_CLIENT_SECRET_HML || '',
    redirectUri: process.env.GOVBR_REDIRECT_URI_HML || '',
    scope: 'openid email profile govbr_confiabilidades',
    authorizationEndpoint: 'https://sso.staging.acesso.gov.br/authorize',
    tokenEndpoint: 'https://sso.staging.acesso.gov.br/token',
    userInfoEndpoint: 'https://sso.staging.acesso.gov.br/userinfo',
    certificateEndpoint: 'https://api.staging.acesso.gov.br/certificate',
    documentValidationEndpoint: 'https://api.staging.acesso.gov.br/document/validate',
    ambiente: 'homologacao' as const
  },
  producao: {
    clientId: process.env.GOVBR_CLIENT_ID || '',
    clientSecret: process.env.GOVBR_CLIENT_SECRET || '',
    redirectUri: process.env.GOVBR_REDIRECT_URI || '',
    scope: 'openid email profile govbr_confiabilidades',
    authorizationEndpoint: 'https://sso.acesso.gov.br/authorize',
    tokenEndpoint: 'https://sso.acesso.gov.br/token',
    userInfoEndpoint: 'https://sso.acesso.gov.br/userinfo',
    certificateEndpoint: 'https://api.acesso.gov.br/certificate',
    documentValidationEndpoint: 'https://api.acesso.gov.br/document/validate',
    ambiente: 'producao' as const
  }
};

// Utilitário para criar instância do serviço
export function createGovBrService(ambiente: 'homologacao' | 'producao' = 'homologacao'): GovBrService {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return new GovBrService(supabaseUrl, supabaseKey, govBrConfigs[ambiente]);
}

// Exportar uma instância padrão para uso direto
export const govBrService = createGovBrService(
  (process.env.GOVBR_AMBIENTE || 'homologacao') as 'homologacao' | 'producao'
);
