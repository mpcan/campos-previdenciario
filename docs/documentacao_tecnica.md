# Documentação Técnica - Sistema PrevGestão (Versão Revisada)

## 1. Visão Geral do Sistema

O PrevGestão é um sistema web completo para escritórios jurídicos previdenciários, desenvolvido para otimizar a gestão de processos, clientes, documentos, finanças e comunicação, com foco especial em atuação contra o INSS. O sistema foi construído utilizando tecnologias modernas como React, Next.js, Tailwind CSS e Supabase, proporcionando uma experiência de usuário fluida e responsiva. Esta versão revisada inclui funcionalidades avançadas de automação de mensagens via WhatsApp e integrações específicas para a área previdenciária.

### 1.1 Arquitetura do Sistema

O PrevGestão segue uma arquitetura cliente-servidor moderna:

- **Frontend**: Aplicação Single Page Application (SPA) desenvolvida com React e Next.js
- **Backend**: Serviços serverless e banco de dados PostgreSQL fornecidos pelo Supabase
- **Autenticação**: Sistema seguro com suporte a autenticação de dois fatores (2FA)
- **Armazenamento**: Armazenamento de arquivos no Supabase Storage
- **Integrações**: APIs externas como WhatsApp Business API e Google Calendar

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│    Frontend     │◄───►│  Supabase APIs  │◄───►│   PostgreSQL    │
│  (Next.js/React)│     │  (Backend)      │     │   Database      │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        ▲                       ▲
        │                       │
        ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │
│  External APIs  │     │  Supabase       │
│  (WhatsApp,     │     │  Storage        │
│  Google Calendar)│     │                 │
│                 │     │                 │
└─────────────────┘     └─────────────────┘
```

### 1.2 Principais Módulos

O sistema é composto pelos seguintes módulos principais:

1. **Gestão Jurídica**: Gerenciamento de clientes, processos, atendimentos, perícias e documentos
2. **Financeiro**: Controle de honorários, receitas e despesas
3. **Agenda e Tarefas**: Gerenciamento de compromissos e atividades
4. **Leads + WhatsApp**: Captação de leads, automação de comunicação via WhatsApp, mensagens agendadas e métricas avançadas
5. **Relatórios e Dashboards**: Visualização de métricas e indicadores de desempenho
6. **Integrações Previdenciárias**: Conexão com Gov.br, SGA e sistemas do INSS Digital

## 2. Tecnologias Utilizadas

### 2.1 Frontend

- **Next.js**: Framework React para renderização do lado do servidor e geração de sites estáticos
- **React**: Biblioteca JavaScript para construção de interfaces de usuário
- **TypeScript**: Superset tipado de JavaScript para desenvolvimento mais seguro
- **Tailwind CSS**: Framework CSS utilitário para estilização rápida e consistente
- **Shadcn UI**: Biblioteca de componentes de UI baseada em Radix UI e Tailwind
- **Recharts**: Biblioteca para criação de gráficos e visualizações de dados
- **React Hook Form**: Biblioteca para gerenciamento de formulários
- **Zod**: Biblioteca para validação de esquemas

### 2.2 Backend

- **Supabase**: Plataforma de backend como serviço (BaaS) baseada em PostgreSQL
- **PostgreSQL**: Sistema de gerenciamento de banco de dados relacional
- **Supabase Auth**: Sistema de autenticação e autorização
- **Supabase Storage**: Sistema de armazenamento de arquivos
- **Supabase Edge Functions**: Funções serverless para lógica de negócios

### 2.3 Integrações

- **WhatsApp Business API**: API para envio e recebimento de mensagens via WhatsApp
- **Google Calendar API**: API para integração com calendário do Google
- **OTPlib**: Biblioteca para implementação de autenticação de dois fatores (2FA)
- **QRCode**: Biblioteca para geração de códigos QR para 2FA
- **Gov.br API**: API para autenticação e validação de identidade
- **SGA API**: API para integração com Sistema de Gerenciamento de Atendimento
- **INSS Digital API**: API para consulta e envio de documentos ao INSS

## 3. Estrutura do Banco de Dados

### 3.1 Diagrama ER

O banco de dados do PrevGestão é composto por diversas tabelas relacionadas, conforme o diagrama ER abaixo:

```
usuarios
  ├── id (PK)
  ├── email
  ├── nome
  ├── role
  ├── two_factor_enabled
  ├── two_factor_secret
  └── two_factor_verified

clientes
  ├── id (PK)
  ├── nome
  ├── cpf
  ├── data_nascimento
  ├── telefone
  ├── email
  ├── endereco
  └── responsavel_id (FK -> usuarios.id)

processos
  ├── id (PK)
  ├── numero
  ├── tipo
  ├── cliente_id (FK -> clientes.id)
  ├── responsavel_id (FK -> usuarios.id)
  ├── data_abertura
  ├── data_encerramento
  ├── status
  └── descricao

atendimentos
  ├── id (PK)
  ├── cliente_id (FK -> clientes.id)
  ├── processo_id (FK -> processos.id)
  ├── responsavel_id (FK -> usuarios.id)
  ├── data_hora
  ├── tipo
  ├── status
  └── observacoes

pericias
  ├── id (PK)
  ├── processo_id (FK -> processos.id)
  ├── data_hora
  ├── local
  ├── perito
  ├── resultado
  └── observacoes

documentos
  ├── id (PK)
  ├── nome
  ├── tipo
  ├── processo_id (FK -> processos.id)
  ├── cliente_id (FK -> clientes.id)
  ├── url
  ├── data_upload
  └── responsavel_id (FK -> usuarios.id)

honorarios
  ├── id (PK)
  ├── processo_id (FK -> processos.id)
  ├── cliente_id (FK -> clientes.id)
  ├── valor
  ├── data_vencimento
  ├── data_pagamento
  ├── status
  └── observacoes

tarefas
  ├── id (PK)
  ├── titulo
  ├── descricao
  ├── responsavel_id (FK -> usuarios.id)
  ├── processo_id (FK -> processos.id)
  ├── data_criacao
  ├── data_vencimento
  ├── prioridade
  └── status

eventos
  ├── id (PK)
  ├── titulo
  ├── descricao
  ├── data_hora_inicio
  ├── data_hora_fim
  ├── local
  ├── responsavel_id (FK -> usuarios.id)
  ├── processo_id (FK -> processos.id)
  └── cliente_id (FK -> clientes.id)

leads
  ├── id (PK)
  ├── nome
  ├── telefone
  ├── email
  ├── origem
  ├── interesse
  ├── status
  ├── data_cadastro
  ├── responsavel_id (FK -> usuarios.id)
  └── observacoes

campanhas
  ├── id (PK)
  ├── nome
  ├── descricao
  ├── mensagem
  ├── data_criacao
  ├── data_envio
  ├── status
  └── responsavel_id (FK -> usuarios.id)

campanhas_leads
  ├── id (PK)
  ├── campanha_id (FK -> campanhas.id)
  ├── lead_id (FK -> leads.id)
  ├── status
  └── data_envio

mensagens_whatsapp
  ├── id (PK)
  ├── lead_id (FK -> leads.id)
  ├── cliente_id (FK -> clientes.id)
  ├── campanha_id (FK -> campanhas.id)
  ├── direcao
  ├── conteudo
  ├── data_hora
  ├── status
  └── wamid

mensagens_agendadas
  ├── id (PK)
  ├── lead_id (FK -> leads.id)
  ├── cliente_id (FK -> clientes.id)
  ├── conteudo
  ├── data_hora_agendada
  ├── status
  ├── regra_automacao
  ├── data_criacao
  └── criado_por (FK -> usuarios.id)

metricas_campanhas
  ├── id (PK)
  ├── campanha_id (FK -> campanhas.id)
  ├── total_enviadas
  ├── total_entregues
  ├── total_lidas
  ├── total_respondidas
  ├── taxa_conversao
  ├── data_atualizacao
  └── observacoes

integracao_govbr
  ├── id (PK)
  ├── usuario_id (FK -> usuarios.id)
  ├── cliente_id (FK -> clientes.id)
  ├── token
  ├── data_expiracao
  ├── status
  └── dados_verificados

integracao_inss
  ├── id (PK)
  ├── processo_id (FK -> processos.id)
  ├── numero_beneficio
  ├── tipo_beneficio
  ├── status_beneficio
  ├── data_atualizacao
  └── dados_adicionais

logs_atividades
  ├── id (PK)
  ├── usuario_id (FK -> usuarios.id)
  ├── acao
  ├── detalhes
  ├── ip
  └── data_hora
```

### 3.2 Políticas de Segurança (RLS)

O Supabase utiliza Row Level Security (RLS) para controlar o acesso aos dados. Abaixo estão as principais políticas implementadas:

- **Usuários**: Cada usuário só pode ver e editar seu próprio perfil, exceto administradores
- **Clientes**: Usuários só podem ver clientes associados a eles ou ao escritório
- **Processos**: Usuários só podem ver processos associados a eles ou ao escritório
- **Documentos**: Acesso baseado na associação com cliente ou processo
- **Financeiro**: Acesso restrito a usuários com permissão específica

## 4. APIs e Endpoints

### 4.1 Autenticação

```
POST /auth/login
POST /auth/register
POST /auth/logout
POST /auth/2fa/enable
POST /auth/2fa/verify
POST /auth/2fa/disable
```

### 4.2 Gestão Jurídica

```
GET /api/clientes
POST /api/clientes
GET /api/clientes/:id
PUT /api/clientes/:id
DELETE /api/clientes/:id

GET /api/processos
POST /api/processos
GET /api/processos/:id
PUT /api/processos/:id
DELETE /api/processos/:id

GET /api/atendimentos
POST /api/atendimentos
GET /api/atendimentos/:id
PUT /api/atendimentos/:id
DELETE /api/atendimentos/:id

GET /api/pericias
POST /api/pericias
GET /api/pericias/:id
PUT /api/pericias/:id
DELETE /api/pericias/:id

GET /api/documentos
POST /api/documentos
GET /api/documentos/:id
PUT /api/documentos/:id
DELETE /api/documentos/:id
```

### 4.3 Financeiro

```
GET /api/honorarios
POST /api/honorarios
GET /api/honorarios/:id
PUT /api/honorarios/:id
DELETE /api/honorarios/:id
```

### 4.4 Agenda e Tarefas

```
GET /api/tarefas
POST /api/tarefas
GET /api/tarefas/:id
PUT /api/tarefas/:id
DELETE /api/tarefas/:id

GET /api/eventos
POST /api/eventos
GET /api/eventos/:id
PUT /api/eventos/:id
DELETE /api/eventos/:id
```

### 4.5 Leads e WhatsApp

```
GET /api/leads
POST /api/leads
GET /api/leads/:id
PUT /api/leads/:id
DELETE /api/leads/:id
POST /api/leads/import
GET /api/leads/export

GET /api/campanhas
POST /api/campanhas
GET /api/campanhas/:id
PUT /api/campanhas/:id
DELETE /api/campanhas/:id
POST /api/campanhas/:id/enviar
GET /api/campanhas/:id/metricas

POST /api/whatsapp/webhook
GET /api/whatsapp/mensagens
POST /api/whatsapp/mensagens
GET /api/whatsapp/mensagens/agendadas
POST /api/whatsapp/mensagens/agendar
DELETE /api/whatsapp/mensagens/agendadas/:id

GET /api/metricas/campanhas
GET /api/metricas/campanhas/:id
```

### 4.6 Relatórios

```
GET /api/relatorios/leads
GET /api/relatorios/financeiro
GET /api/relatorios/processos
GET /api/relatorios/produtividade
GET /api/relatorios/campanhas
GET /api/relatorios/conversoes
```

### 4.7 Integrações Previdenciárias

```
POST /api/govbr/auth
GET /api/govbr/perfil
POST /api/govbr/validar-documento

GET /api/sga/agendamentos
POST /api/sga/agendar
GET /api/sga/protocolos/:id

GET /api/inss/beneficios/:numero
GET /api/inss/processos/:numero
POST /api/inss/documentos/enviar
GET /api/inss/exigencias
```

## 5. Segurança

### 5.1 Autenticação

O sistema utiliza o Supabase Auth para autenticação, com os seguintes recursos:

- Login com email e senha
- Autenticação de dois fatores (2FA) usando TOTP
- Tokens JWT para sessões
- Refresh tokens para manter sessões ativas
- Middleware de autenticação para proteger rotas

### 5.2 Controle de Acesso (RBAC)

O sistema implementa controle de acesso baseado em função (RBAC) com as seguintes funções:

- **Admin**: Acesso completo a todas as funcionalidades
- **Advogado**: Acesso a gestão jurídica, clientes e processos
- **Assistente**: Acesso limitado a clientes e documentos
- **Financeiro**: Acesso a módulo financeiro e relatórios
- **Marketing**: Acesso a leads, campanhas e WhatsApp

### 5.3 Logs de Atividades

Todas as ações importantes são registradas em logs para auditoria:

- Login/logout de usuários
- Criação, edição e exclusão de registros
- Envio de campanhas
- Alterações de configurações

## 6. Integrações

### 6.1 WhatsApp Business API

A integração com WhatsApp permite:

- Envio de mensagens individuais
- Envio de campanhas em massa
- Recebimento de mensagens via webhook
- Modelos de mensagens personalizáveis
- Atendimento automatizado

### 6.2 Google Calendar

A integração com Google Calendar permite:

- Sincronização de eventos e compromissos
- Notificações de audiências e perícias
- Compartilhamento de agenda entre usuários

## 7. Manutenção e Troubleshooting

### 7.1 Logs e Monitoramento

- Logs de aplicação armazenados no Supabase
- Logs de atividades de usuários para auditoria
- Monitoramento de desempenho e erros

### 7.2 Backup e Recuperação

- Backups automáticos diários do banco de dados
- Procedimento de restauração documentado
- Versionamento de código no repositório Git

### 7.3 Problemas Comuns e Soluções

- **Erro de autenticação**: Verificar credenciais e status do Supabase
- **Falha na integração com WhatsApp**: Verificar token de acesso e webhook
- **Lentidão no carregamento**: Verificar consultas ao banco de dados e otimizar
- **Erros em relatórios**: Verificar permissões e integridade dos dados

## 8. Desenvolvimento Futuro

### 8.1 Roadmap

- Integração com sistemas do INSS
- App mobile para clientes
- Módulo de cálculos previdenciários avançados
- Inteligência artificial para análise de processos
- Assinatura digital de documentos

### 8.2 Extensibilidade

O sistema foi projetado para ser extensível através de:

- Arquitetura modular
- APIs bem documentadas
- Componentes reutilizáveis
- Separação clara entre frontend e backend

---

## Apêndice A: Estrutura de Diretórios

```
prevgestao/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── 2fa/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   ├── clientes/
│   │   │   ├── processos/
│   │   │   ├── atendimentos/
│   │   │   ├── pericias/
│   │   │   ├── documentos/
│   │   │   ├── financeiro/
│   │   │   ├── tarefas/
│   │   │   ├── agenda/
│   │   │   ├── leads/
│   │   │   ├── campanhas/
│   │   │   ├── whatsapp/
│   │   │   └── relatorios/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/
│   │   └── layout/
│   ├── lib/
│   │   ├── supabase/
│   │   ├── auth/
│   │   └── utils/
│   └── tests/
├── supabase/
│   ├── migrations/
│   └── functions/
├── public/
└── package.json
```

## Apêndice B: Dependências

Lista completa de dependências do projeto:

```json
{
  "dependencies": {
    "@hookform/resolvers": "^3.3.2",
    "@radix-ui/react-icons": "^1.3.0",
    "@supabase/auth-helpers-nextjs": "^0.8.7",
    "@supabase/auth-helpers-react": "^0.4.2",
    "@supabase/supabase-js": "^2.39.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "lucide-react": "^0.294.0",
    "next": "14.0.4",
    "otplib": "^12.0.1",
    "qrcode": "^1.5.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.49.2",
    "recharts": "^2.10.3",
    "tailwind-merge": "^2.1.0",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@testing-library/react": "^14.1.2",
    "@types/node": "^20.10.4",
    "@types/qrcode": "^1.5.5",
    "@types/react": "^18.2.45",
    "@types/react-dom": "^18.2.17",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0",
    "eslint-config-next": "14.0.4",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "typescript": "^5.3.3",
    "vitest": "^1.0.4"
  }
}
```
