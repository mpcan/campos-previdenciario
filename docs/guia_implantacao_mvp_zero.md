# Guia de Implantação - PowerPrev MVP Zero

Este guia fornece instruções detalhadas para a implantação do MVP Zero do sistema PowerPrev utilizando recursos gratuitos.

## 1. Pré-requisitos

- Conta no Supabase (plano gratuito)
- Conta no Vercel ou Railway (plano gratuito)
- Conta no GitHub (para repositório do código)
- Node.js instalado localmente (v16+)

## 2. Configuração do Banco de Dados (Supabase)

### 2.1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e faça login
2. Clique em "New Project"
3. Preencha as informações:
   - Nome: PowerPrev-MVP
   - Senha do banco: (crie uma senha forte)
   - Região: escolha a mais próxima do Brasil
4. Clique em "Create new project"

### 2.2. Executar Scripts de Migração

1. No painel do Supabase, vá para "SQL Editor"
2. Crie uma nova query
3. Cole o conteúdo do arquivo `/supabase/migrations/00001_modulo_gestao_juridica.sql`
4. Execute a query
5. Repita o processo para os arquivos:
   - `/supabase/migrations/00002_modulo_whatsapp_leads.sql`
   - `/supabase/migrations/00003_mensagens_agendadas_metricas.sql`
   - `/supabase/migrations/00004_integracoes_govbr_inss_sga.sql`

### 2.3. Configurar Políticas de Segurança

1. No painel do Supabase, vá para "Authentication" > "Policies"
2. Para cada tabela, crie políticas de acesso adequadas:
   - Tabelas públicas: permitir leitura para todos
   - Tabelas protegidas: permitir leitura/escrita apenas para usuários autenticados
   - Tabelas administrativas: permitir acesso apenas para usuários com função de admin

## 3. Configuração do Frontend

### 3.1. Preparar o Código para Implantação

1. Clone o repositório localmente:
   ```bash
   git clone https://github.com/seu-usuario/powerprev.git
   cd powerprev
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Crie um arquivo `.env.production` com as variáveis de ambiente:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-do-supabase
   NEXT_PUBLIC_SITE_URL=https://www.powerprev.com.br
   ```

4. Construa o projeto:
   ```bash
   npm run build
   ```

### 3.2. Implantar no Vercel

1. Crie uma conta no [Vercel](https://vercel.com) se ainda não tiver
2. Instale a CLI do Vercel:
   ```bash
   npm install -g vercel
   ```

3. Faça login na CLI:
   ```bash
   vercel login
   ```

4. Implante o projeto:
   ```bash
   vercel --prod
   ```

5. Siga as instruções na tela para configurar o projeto
6. Adicione as variáveis de ambiente quando solicitado

## 4. Configuração das Integrações

### 4.1. WhatsApp Web

1. No código do frontend, verifique se os links para WhatsApp estão configurados corretamente:
   ```javascript
   const whatsappLink = `https://wa.me/555533336517?text=${encodeURIComponent(message)}`;
   ```

2. Teste os links para garantir que abrem o WhatsApp com a mensagem correta

### 4.2. Google Calendar

1. Verifique se os links para o Google Calendar estão configurados corretamente:
   ```javascript
   const googleCalendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDate}/${endDate}`;
   ```

2. Teste os links para garantir que abrem o Google Calendar com os detalhes corretos

### 4.3. Gov.br (Ambiente de Homologação)

1. Acesse o portal de desenvolvedores do Gov.br
2. Registre sua aplicação para obter as credenciais de homologação
3. Atualize as variáveis de ambiente com as credenciais:
   ```
   GOVBR_CLIENT_ID=seu-client-id
   GOVBR_CLIENT_SECRET=seu-client-secret
   GOVBR_REDIRECT_URI=https://seu-dominio.vercel.app/api/auth/callback/govbr
   ```

4. Implante novamente o projeto com as novas variáveis

### 4.4. INSS SGA e INSS Digital (Ambiente de Homologação)

1. Solicite acesso ao ambiente de homologação do INSS
2. Atualize as variáveis de ambiente com as credenciais fornecidas
3. Implante novamente o projeto com as novas variáveis

## 5. Configuração de Funções Serverless

### 5.1. Processamento de Mensagens Agendadas

1. No painel do Supabase, vá para "Database" > "Functions"
2. Crie uma nova função:
   - Nome: processar_mensagens_agendadas
   - Definição: Cole o conteúdo da função do arquivo de migração
   - Programação: Configurar para executar a cada 15 minutos

### 5.2. Cálculo de Métricas de Campanha

1. No painel do Supabase, vá para "Database" > "Functions"
2. Crie uma nova função:
   - Nome: calcular_metricas_campanha
   - Definição: Cole o conteúdo da função do arquivo de migração
   - Programação: Configurar para executar diariamente

## 6. Testes Finais

### 6.1. Teste de Funcionalidades

1. Acesse a aplicação implantada
2. Teste o fluxo completo de cada funcionalidade:
   - Cadastro de leads
   - Criação de mensagens agendadas
   - Visualização de métricas
   - Integrações com Gov.br, SGA e INSS Digital

### 6.2. Teste de Desempenho

1. Verifique o tempo de carregamento das páginas
2. Teste a aplicação em diferentes dispositivos (desktop, tablet, mobile)
3. Verifique o consumo de recursos no Supabase e Vercel

## 7. Documentação e Suporte

### 7.1. Preparar Documentação para Usuários

1. Disponibilize o manual do usuário em formato PDF
2. Crie uma página de FAQ na aplicação
3. Adicione tooltips explicativos nos elementos da interface

### 7.2. Configurar Coleta de Feedback

1. Implemente um formulário simples para coleta de feedback
2. Configure alertas para receber notificações de feedback
3. Estabeleça um processo para análise e priorização de feedback

## 8. Monitoramento e Análise

### 8.1. Configurar Métricas de Uso

1. Implemente o Google Analytics ou Plausible Analytics (gratuito)
2. Configure eventos para rastrear ações importantes dos usuários
3. Crie um dashboard para visualização das métricas

### 8.2. Monitoramento de Erros

1. Configure o Sentry (plano gratuito) para monitoramento de erros
2. Implemente logs detalhados para facilitar a depuração
3. Configure alertas para erros críticos

## 9. Próximos Passos

### 9.1. Preparação para MVP Funcional

1. Analise o feedback dos usuários
2. Priorize as funcionalidades para o MVP Funcional
3. Avalie quais componentes precisarão de upgrade para planos pagos

### 9.2. Planejamento de Longo Prazo

1. Defina um roadmap para implementação gradual de funcionalidades
2. Estabeleça métricas de sucesso para cada fase
3. Planeje a estratégia de monetização (se aplicável)

## 10. Informações de Acesso

### 10.1. URLs e Credenciais

- **URL da aplicação**: https://powerprev.vercel.app
- **Painel do Supabase**: https://app.supabase.io/project/powerprev-mvp
- **Painel do Vercel**: https://vercel.com/seu-usuario/powerprev-mvp

### 10.2. Usuários de Teste

- **Administrador**:
  - Email: admin@powerprev.com.br
  - Senha: (fornecida separadamente)

- **Usuário comum**:
  - Email: usuario@powerprev.com.br
  - Senha: (fornecida separadamente)

## 11. Suporte e Contato

Para qualquer dúvida ou problema durante a implantação, entre em contato:

- **Email**: suporte@powerprev.com.br
- **WhatsApp**: +555533336517

---

Este guia será atualizado conforme necessário durante o processo de implantação.

Última atualização: 25 de abril de 2025
