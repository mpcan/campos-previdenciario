// Definição de tipos para as tabelas do Supabase
// Estes tipos serão usados para tipagem estática no TypeScript

export type Usuario = {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  permissoes: Record<string, any>;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
};

export type Cliente = {
  id: string;
  nome: string;
  cpf: string | null;
  rg: string | null;
  data_nascimento: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  telefone: string | null;
  email: string | null;
  profissao: string | null;
  estado_civil: string | null;
  observacoes: string | null;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
};

export type Processo = {
  id: string;
  cliente_id: string;
  responsavel_id: string;
  numero: string | null;
  tipo: 'Administrativo' | 'Judicial';
  beneficio_tipo: string | null;
  status: string;
  data_entrada: string;
  data_distribuicao: string | null;
  vara: string | null;
  comarca: string | null;
  juiz: string | null;
  observacoes: string | null;
  criado_em: string;
  atualizado_em: string;
};

export type Atendimento = {
  id: string;
  cliente_id: string;
  processo_id: string | null;
  responsavel_id: string;
  data: string;
  hora_inicio: string;
  hora_fim: string | null;
  tipo: string;
  status: string;
  observacoes: string | null;
  criado_em: string;
  atualizado_em: string;
};

export type Pericia = {
  id: string;
  processo_id: string;
  cliente_id: string;
  data: string;
  hora: string;
  local: string | null;
  perito: string | null;
  status: string;
  resultado: string | null;
  observacoes: string | null;
  criado_em: string;
  atualizado_em: string;
};

export type Documento = {
  id: string;
  processo_id: string;
  nome: string;
  tipo: string;
  caminho_arquivo: string;
  status: string;
  criado_em: string;
  atualizado_em: string;
};

export type Tarefa = {
  id: string;
  responsavel_id: string;
  processo_id: string | null;
  titulo: string;
  descricao: string | null;
  data_vencimento: string;
  prioridade: 'Baixa' | 'Média' | 'Alta' | 'Urgente';
  status: string;
  criado_em: string;
  atualizado_em: string;
};

export type EventoAgenda = {
  id: string;
  usuario_id: string;
  processo_id: string | null;
  cliente_id: string | null;
  titulo: string;
  descricao: string | null;
  inicio: string;
  fim: string;
  local: string | null;
  tipo: string;
  notificar: boolean;
  id_google_calendar: string | null;
  criado_em: string;
  atualizado_em: string;
};

export type Honorario = {
  id: string;
  processo_id: string;
  cliente_id: string;
  valor: number;
  tipo: 'Inicial' | 'Êxito' | 'Parcela';
  data_vencimento: string;
  data_pagamento: string | null;
  status: string;
  forma_pagamento: string | null;
  observacoes: string | null;
  criado_em: string;
  atualizado_em: string;
};

export type Lead = {
  id: string;
  nome: string;
  telefone: string;
  email: string | null;
  beneficio_interesse: string | null;
  origem: string | null;
  status: string;
  cidade: string | null;
  estado: string | null;
  observacoes: string | null;
  criado_em: string;
  atualizado_em: string;
};

export type CampanhaWhatsapp = {
  id: string;
  criador_id: string;
  nome: string;
  descricao: string | null;
  mensagem_template: string;
  data_criacao: string;
  data_envio: string | null;
  status: string;
  total_leads: number;
  enviados: number;
  falhas: number;
  respostas: number;
  criado_em: string;
  atualizado_em: string;
};

export type MensagemWhatsapp = {
  id: string;
  campanha_id: string;
  lead_id: string;
  mensagem: string;
  status: 'Pendente' | 'Enviado' | 'Falhou';
  data_envio: string | null;
  data_leitura: string | null;
  resposta: string | null;
  criado_em: string;
  atualizado_em: string;
};

export type CalculoPrevidenciario = {
  id: string;
  processo_id: string;
  tipo: string;
  data_calculo: string;
  rmi: number | null;
  rma: number | null;
  atrasados: number | null;
  periodo_calculo: string | null;
  observacoes: string | null;
  criado_em: string;
  atualizado_em: string;
};

// Definição de tipos para as tabelas do banco de dados
export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: Usuario;
        Insert: Omit<Usuario, 'id' | 'criado_em' | 'atualizado_em'>;
        Update: Partial<Omit<Usuario, 'id' | 'criado_em' | 'atualizado_em'>>;
      };
      clientes: {
        Row: Cliente;
        Insert: Omit<Cliente, 'id' | 'criado_em' | 'atualizado_em'>;
        Update: Partial<Omit<Cliente, 'id' | 'criado_em' | 'atualizado_em'>>;
      };
      processos: {
        Row: Processo;
        Insert: Omit<Processo, 'id' | 'criado_em' | 'atualizado_em'>;
        Update: Partial<Omit<Processo, 'id' | 'criado_em' | 'atualizado_em'>>;
      };
      atendimentos: {
        Row: Atendimento;
        Insert: Omit<Atendimento, 'id' | 'criado_em' | 'atualizado_em'>;
        Update: Partial<Omit<Atendimento, 'id' | 'criado_em' | 'atualizado_em'>>;
      };
      pericias: {
        Row: Pericia;
        Insert: Omit<Pericia, 'id' | 'criado_em' | 'atualizado_em'>;
        Update: Partial<Omit<Pericia, 'id' | 'criado_em' | 'atualizado_em'>>;
      };
      documentos: {
        Row: Documento;
        Insert: Omit<Documento, 'id' | 'criado_em' | 'atualizado_em'>;
        Update: Partial<Omit<Documento, 'id' | 'criado_em' | 'atualizado_em'>>;
      };
      tarefas: {
        Row: Tarefa;
        Insert: Omit<Tarefa, 'id' | 'criado_em' | 'atualizado_em'>;
        Update: Partial<Omit<Tarefa, 'id' | 'criado_em' | 'atualizado_em'>>;
      };
      eventos_agenda: {
        Row: EventoAgenda;
        Insert: Omit<EventoAgenda, 'id' | 'criado_em' | 'atualizado_em'>;
        Update: Partial<Omit<EventoAgenda, 'id' | 'criado_em' | 'atualizado_em'>>;
      };
      honorarios: {
        Row: Honorario;
        Insert: Omit<Honorario, 'id' | 'criado_em' | 'atualizado_em'>;
        Update: Partial<Omit<Honorario, 'id' | 'criado_em' | 'atualizado_em'>>;
      };
      leads: {
        Row: Lead;
        Insert: Omit<Lead, 'id' | 'criado_em' | 'atualizado_em'>;
        Update: Partial<Omit<Lead, 'id' | 'criado_em' | 'atualizado_em'>>;
      };
      campanhas_whatsapp: {
        Row: CampanhaWhatsapp;
        Insert: Omit<CampanhaWhatsapp, 'id' | 'criado_em' | 'atualizado_em'>;
        Update: Partial<Omit<CampanhaWhatsapp, 'id' | 'criado_em' | 'atualizado_em'>>;
      };
      mensagens_whatsapp: {
        Row: MensagemWhatsapp;
        Insert: Omit<MensagemWhatsapp, 'id' | 'criado_em' | 'atualizado_em'>;
        Update: Partial<Omit<MensagemWhatsapp, 'id' | 'criado_em' | 'atualizado_em'>>;
      };
      calculos_previdenciarios: {
        Row: CalculoPrevidenciario;
        Insert: Omit<CalculoPrevidenciario, 'id' | 'criado_em' | 'atualizado_em'>;
        Update: Partial<Omit<CalculoPrevidenciario, 'id' | 'criado_em' | 'atualizado_em'>>;
      };
    };
  };
}
