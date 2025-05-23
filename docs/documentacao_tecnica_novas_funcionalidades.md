# Documentação Técnica - Novas Funcionalidades PowerPrev

## Sumário

1. [Introdução](#introdução)
2. [Sistema de Mensagens Automatizadas e Agendadas](#sistema-de-mensagens-automatizadas-e-agendadas)
3. [Métricas de Campanha Detalhadas](#métricas-de-campanha-detalhadas)
4. [Integrações Previdenciárias](#integrações-previdenciárias)
   - [Integração com Gov.br](#integração-com-govbr)
   - [Integração com SGA](#integração-com-sga)
   - [Integração com INSS Digital](#integração-com-inss-digital)
5. [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
6. [Ambiente de Homologação](#ambiente-de-homologação)
7. [Testes](#testes)

## Introdução

Este documento descreve as novas funcionalidades implementadas no sistema PowerPrev, incluindo o sistema de mensagens automatizadas e agendadas, métricas de campanha detalhadas e integrações com sistemas previdenciários (Gov.br, SGA e INSS Digital).

## Sistema de Mensagens Automatizadas e Agendadas

### Visão Geral

O sistema de mensagens automatizadas e agendadas permite o envio programado de mensagens via WhatsApp para leads e clientes em momentos específicos após o cadastro ou outras ações. Isso inclui mensagens D+1, D+3 e D+7 após o cadastro, além de outras regras personalizáveis.

### Componentes Principais

- **Tabelas de Banco de Dados**:
  - `mensagens_agendadas`: Armazena mensagens programadas para envio futuro
  - `regras_automacao_mensagens`: Define regras para criação automática de mensagens agendadas

- **Serviço de Mensagens Agendadas**:
  - Arquivo: `/src/lib/whatsapp/mensagens-agendadas.ts`
  - Classe: `MensagensAgendadasService`
  - Responsabilidades:
    - Criar mensagens agendadas manualmente
    - Processar regras de automação para criar mensagens agendadas
    - Enviar mensagens agendadas no momento apropriado
    - Gerenciar regras de automação de mensagens

### Fluxo de Funcionamento

1. **Cadastro de Lead**:
   - Quando um novo lead é cadastrado, o sistema verifica as regras de automação ativas
   - Para cada regra aplicável, cria mensagens agendadas com datas futuras (D+X)

2. **Processamento de Mensagens**:
   - Um job periódico executa a função `processarMensagensPendentes()`
   - Mensagens com data de agendamento atingida são enviadas
   - O status da mensagem é atualizado para "Enviada"
   - Uma interação é registrada no histórico do lead

3. **Personalização de Mensagens**:
   - As mensagens podem incluir variáveis como `{{nome}}`, `{{telefone}}`, etc.
   - Estas variáveis são substituídas pelos dados reais do lead no momento do envio

### Funções SQL

- `processar_mensagens_agendadas()`: Processa e envia mensagens agendadas pendentes
- `criar_mensagens_agendadas_por_regra()`: Cria mensagens agendadas baseadas em regras de automação

### Exemplo de Uso

```typescript
// Criar uma mensagem agendada manualmente
const mensagensService = createMensagensAgendadasService();
await mensagensService.criarMensagemAgendada({
  leadId: 'id-do-lead',
  conteudo: 'Olá, {{nome}}! Temos novidades para você.',
  dataAgendamento: new Date('2025-05-01T10:00:00Z')
});

// Processar mensagens pendentes
const mensagensEnviadas = await mensagensService.processarMensagensPendentes();
console.log(`${mensagensEnviadas} mensagens foram enviadas`);
```

## Métricas de Campanha Detalhadas

### Visão Geral

O sistema de métricas de campanha detalhadas permite acompanhar o desempenho das campanhas de WhatsApp com dados granulares sobre taxas de entrega, leitura, resposta e conversão, além de identificar os melhores horários para envio de mensagens.

### Componentes Principais

- **Tabelas de Banco de Dados**:
  - `metricas_campanhas`: Armazena métricas detalhadas por campanha e data
  - Campos adicionados à tabela `campanhas_whatsapp`: taxas de entrega, leitura, resposta, conversão e melhor horário

- **Serviço de Métricas de Campanhas**:
  - Arquivo: `/src/lib/whatsapp/metricas-campanhas.ts`
  - Classe: `MetricasCampanhasService`
  - Responsabilidades:
    - Calcular métricas detalhadas de campanhas
    - Gerar relatórios de desempenho
    - Identificar melhores horários para envio
    - Analisar taxas de resposta e conversão

### Métricas Disponíveis

- **Taxa de Entrega**: Percentual de mensagens entregues em relação às enviadas
- **Taxa de Leitura**: Percentual de mensagens lidas em relação às enviadas
- **Taxa de Resposta**: Percentual de leads que responderam à campanha
- **Taxa de Conversão**: Percentual de leads que avançaram no funil após a campanha
- **Tempo Médio de Resposta**: Tempo médio que os leads levam para responder
- **Horário de Pico**: Horário com maior número de respostas

### Funções SQL

- `calcular_metricas_campanha(campanha_id)`: Calcula todas as métricas para uma campanha específica
- `calcular_tempo_resposta()`: Trigger que calcula o tempo de resposta quando uma mensagem de entrada é registrada
- `registrar_conversao_lead()`: Trigger que registra conversão quando o status do lead é atualizado

### Exemplo de Uso

```typescript
// Buscar resumo de todas as campanhas
const metricasService = createMetricasCampanhasService();
const resumoCampanhas = await metricasService.buscarResumoCampanhas();

// Calcular métricas para uma campanha específica
await metricasService.calcularMetricasCampanha('id-da-campanha');

// Identificar melhor horário para envio de mensagens
const melhorHorario = await metricasService.identificarMelhorHorarioEnvio();
console.log(`O melhor horário para envio é: ${melhorHorario}`);
```

## Integrações Previdenciárias

### Integração com Gov.br

#### Visão Geral

A integração com Gov.br permite autenticação de usuários via Gov.br, validação de documentos, obtenção de dados cadastrais e assinatura digital de documentos.

#### Componentes Principais

- **Tabelas de Banco de Dados**:
  - `integracao_govbr`: Armazena tokens e dados de autenticação
  - `documentos_validados_govbr`: Registra documentos validados via Gov.br
  - `documentos_assinados_govbr`: Registra documentos assinados digitalmente

- **Serviço de Integração Gov.br**:
  - Arquivo: `/src/lib/integracoes/govbr.ts`
  - Classe: `GovBrService`
  - Responsabilidades:
    - Autenticação de usuários via Gov.br
    - Validação de documentos
    - Obtenção de dados cadastrais
    - Assinatura digital de documentos

#### Fluxo de Autenticação

1. **Redirecionamento para Gov.br**:
   - O sistema gera uma URL de autorização com o método `getAuthorizationUrl()`
   - O usuário é redirecionado para a página de login do Gov.br

2. **Callback e Obtenção de Tokens**:
   - Após autenticação, o Gov.br redireciona para a URL de callback com um código
   - O sistema troca o código por tokens de acesso com `exchangeCodeForTokens()`
   - Os tokens e dados do usuário são salvos no banco de dados

3. **Uso dos Serviços**:
   - O sistema verifica e atualiza tokens quando necessário
   - Os tokens são usados para acessar serviços como validação de documentos

#### Exemplo de Uso

```typescript
// Iniciar fluxo de autenticação
const govBrService = createGovBrService();
const state = gerarStringAleatoria();
const authUrl = govBrService.getAuthorizationUrl(state);
// Redirecionar usuário para authUrl

// Processar callback
const code = 'código-recebido-no-callback';
const authResult = await govBrService.exchangeCodeForTokens(code);
if (authResult.success) {
  await govBrService.saveUserIntegration(userId, authResult);
}

// Validar documento
const token = await govBrService.getValidAccessToken(userId);
if (token) {
  const resultado = await govBrService.validateDocument(token, 'CPF', '12345678901');
}
```

### Integração com SGA

#### Visão Geral

A integração com o Sistema de Gerenciamento de Agendamento (SGA) do INSS permite consultar disponibilidade de agendamentos, agendar atendimentos, consultar agendamentos existentes e cancelar agendamentos.

#### Componentes Principais

- **Tabelas de Banco de Dados**:
  - `agendamentos_sga`: Armazena agendamentos realizados no INSS

- **Serviço de Integração SGA**:
  - Arquivo: `/src/lib/integracoes/inss-sga.ts`
  - Classe: `SGAService`
  - Responsabilidades:
    - Consulta de disponibilidade de agendamentos
    - Agendamento de atendimentos
    - Consulta de agendamentos existentes
    - Cancelamento de agendamentos

#### Fluxo de Agendamento

1. **Busca de Unidades e Serviços**:
   - O sistema busca unidades disponíveis com `buscarUnidades()`
   - O sistema busca serviços disponíveis com `buscarServicos()`

2. **Verificação de Disponibilidade**:
   - O sistema verifica horários disponíveis com `buscarHorariosDisponiveis()`

3. **Realização do Agendamento**:
   - O sistema realiza o agendamento com `realizarAgendamento()`
   - O agendamento é salvo localmente com `salvarAgendamentoLocal()`

4. **Lembretes Automáticos**:
   - A função SQL `verificar_agendamentos_proximos()` envia lembretes para agendamentos próximos

#### Exemplo de Uso

```typescript
// Buscar unidades e serviços
const sgaService = createSGAService();
const unidades = await sgaService.buscarUnidades('SP');
const servicos = await sgaService.buscarServicos('Perícia Médica');

// Verificar disponibilidade
const horarios = await sgaService.buscarHorariosDisponiveis(
  servicos.data[0].id,
  unidades.data[0].id,
  '2025-05-01',
  '2025-05-10'
);

// Realizar agendamento
const resultado = await sgaService.realizarAgendamento({
  servicoId: servicos.data[0].id,
  unidadeId: unidades.data[0].id,
  data: horarios.data[0].data,
  hora: horarios.data[0].hora,
  cpf: '12345678901',
  nome: 'João Silva',
  email: 'joao@example.com',
  telefone: '11987654321'
});

// Salvar agendamento localmente
if (resultado.success && resultado.data) {
  await sgaService.salvarAgendamentoLocal(
    resultado.data,
    processoId,
    clienteId,
    usuarioId
  );
}
```

### Integração com INSS Digital

#### Visão Geral

A integração com o INSS Digital permite consulta de benefícios, consulta de processos administrativos, envio de documentos e acompanhamento de requerimentos.

#### Componentes Principais

- **Tabelas de Banco de Dados**:
  - `consultas_inss`: Armazena consultas de benefícios e processos
  - `envios_inss`: Registra documentos enviados ao INSS

- **Serviço de Integração INSS Digital**:
  - Arquivo: `/src/lib/integracoes/inss-digital.ts`
  - Classe: `INSSDigitalService`
  - Responsabilidades:
    - Consulta de benefícios
    - Consulta de processos administrativos
    - Envio de documentos
    - Acompanhamento de requerimentos

#### Fluxos Principais

1. **Consulta de Benefícios**:
   - O sistema consulta benefícios por CPF com `consultarBeneficiosPorCPF()`
   - Os resultados são salvos localmente com `salvarConsultaBeneficioLocal()`

2. **Consulta de Processos**:
   - O sistema consulta processos por CPF com `consultarProcessosPorCPF()`
   - Os detalhes de um processo específico podem ser obtidos com `consultarProcesso()`

3. **Envio de Documentos**:
   - O sistema envia documentos para um processo com `enviarDocumento()`
   - O envio é registrado localmente com `salvarEnvioDocumentoLocal()`

4. **Atualização de Processos**:
   - A função SQL `atualizar_status_processos_inss()` atualiza o status dos processos com base nas consultas

#### Exemplo de Uso

```typescript
// Consultar benefícios
const inssService = createINSSDigitalService();
const beneficios = await inssService.consultarBeneficiosPorCPF('12345678901');

// Salvar consulta localmente
if (beneficios.success && beneficios.data) {
  for (const beneficio of beneficios.data) {
    await inssService.salvarConsultaBeneficioLocal(
      beneficio,
      processoId,
      clienteId,
      usuarioId
    );
  }
}

// Enviar documento
const arquivo = await lerArquivo('caminho/do/documento.pdf');
const resultado = await inssService.enviarDocumento(
  'PROC123456',
  'Laudo Médico',
  'laudo_medico.pdf',
  arquivo,
  'application/pdf'
);

// Salvar envio localmente
if (resultado.success && resultado.data) {
  await inssService.salvarEnvioDocumentoLocal(
    'PROC123456',
    resultado.data,
    processoId,
    clienteId,
    usuarioId
  );
}
```

## Estrutura do Banco de Dados

### Novas Tabelas

#### Sistema de Mensagens Automatizadas

- **mensagens_agendadas**
  - `id`: UUID (PK)
  - `lead_id`: UUID (FK para leads)
  - `campanha_id`: UUID (FK para campanhas_whatsapp)
  - `modelo_id`: UUID (FK para modelos_mensagem)
  - `conteudo`: TEXT
  - `tipo`: TEXT
  - `data_agendamento`: TIMESTAMP WITH TIME ZONE
  - `data_envio`: TIMESTAMP WITH TIME ZONE
  - `status`: TEXT ('Agendada', 'Enviada', 'Falha', 'Cancelada')
  - `regra_agendamento`: TEXT
  - `condicao_envio`: JSONB
  - `erro`: TEXT
  - `criado_por`: UUID (FK para usuarios)
  - `criado_em`: TIMESTAMP WITH TIME ZONE
  - `atualizado_em`: TIMESTAMP WITH TIME ZONE

- **regras_automacao_mensagens**
  - `id`: UUID (PK)
  - `nome`: TEXT
  - `descricao`: TEXT
  - `evento_gatilho`: TEXT
  - `dias_apos_evento`: INTEGER
  - `hora_envio`: TIME
  - `dias_semana`: TEXT[]
  - `modelo_id`: UUID (FK para modelos_mensagem)
  - `conteudo_personalizado`: TEXT
  - `condicoes`: JSONB
  - `ativo`: BOOLEAN
  - `criado_por`: UUID (FK para usuarios)
  - `criado_em`: TIMESTAMP WITH TIME ZONE
  - `atualizado_em`: TIMESTAMP WITH TIME ZONE

#### Métricas de Campanha

- **metricas_campanhas**
  - `id`: UUID (PK)
  - `campanha_id`: UUID (FK para campanhas_whatsapp)
  - `data_referencia`: DATE
  - `total_enviadas`: INTEGER
  - `total_entregues`: INTEGER
  - `total_lidas`: INTEGER
  - `total_respondidas`: INTEGER
  - `taxa_entrega`: DECIMAL(5,2)
  - `taxa_leitura`: DECIMAL(5,2)
  - `taxa_resposta`: DECIMAL(5,2)
  - `tempo_medio_resposta`: INTEGER
  - `horario_pico_respostas`: TIME
  - `conversoes`: INTEGER
  - `taxa_conversao`: DECIMAL(5,2)
  - `criado_em`: TIMESTAMP WITH TIME ZONE
  - `atualizado_em`: TIMESTAMP WITH TIME ZONE

#### Integração Gov.br

- **integracao_govbr**
  - `id`: UUID (PK)
  - `usuario_id`: UUID (FK para usuarios)
  - `cpf`: TEXT
  - `nome`: TEXT
  - `email`: TEXT
  - `nivel_autenticacao`: INTEGER
  - `access_token`: TEXT
  - `refresh_token`: TEXT
  - `expira_em`: TIMESTAMP WITH TIME ZONE
  - `ultima_autenticacao`: TIMESTAMP WITH TIME ZONE
  - `ativo`: BOOLEAN
  - `criado_em`: TIMESTAMP WITH TIME ZONE
  - `atualizado_em`: TIMESTAMP WITH TIME ZONE

- **documentos_validados_govbr**
  - `id`: UUID (PK)
  - `usuario_id`: UUID (FK para usuarios)
  - `cliente_id`: UUID (FK para clientes)
  - `documento_id`: TEXT
  - `tipo_documento`: TEXT
  - `data_validacao`: TIMESTAMP WITH TIME ZONE
  - `status`: TEXT
  - `dados_validacao`: JSONB
  - `criado_em`: TIMESTAMP WITH TIME ZONE
  - `atualizado_em`: TIMESTAMP WITH TIME ZONE

- **documentos_assinados_govbr**
  - `id`: UUID (PK)
  - `usuario_id`: UUID (FK para usuarios)
  - `cliente_id`: UUID (FK para clientes)
  - `documento_id`: UUID (FK para documentos)
  - `assinatura_id`: TEXT
  - `data_assinatura`: TIMESTAMP WITH TIME ZONE
  - `status`: TEXT
  - `dados_assinatura`: JSONB
  - `criado_em`: TIMESTAMP WITH TIME ZONE
  - `atualizado_em`: TIMESTAMP WITH TIME ZONE

#### Integração SGA

- **agendamentos_sga**
  - `id`: UUID (PK)
  - `protocolo`: TEXT
  - `data`: DATE
  - `hora`: TIME
  - `unidade_id`: TEXT
  - `servico_id`: TEXT
  - `cpf`: TEXT
  - `nome`: TEXT
  - `email`: TEXT
  - `telefone`: TEXT
  - `status`: TEXT
  - `observacoes`: TEXT
  - `processo_id`: UUID (FK para processos)
  - `cliente_id`: UUID (FK para clientes)
  - `criado_por`: UUID (FK para usuarios)
  - `criado_em`: TIMESTAMP WITH TIME ZONE
  - `atualizado_em`: TIMESTAMP WITH TIME ZONE

#### Integração INSS Digital

- **consultas_inss**
  - `id`: UUID (PK)
  - `tipo`: TEXT
  - `numero_beneficio`: TEXT
  - `tipo_beneficio`: TEXT
  - `situacao`: TEXT
  - `data_inicio`: DATE
  - `data_fim`: DATE
  - `valor_atual`: DECIMAL(10,2)
  - `cpf_titular`: TEXT
  - `nome_titular`: TEXT
  - `data_consulta`: TIMESTAMP WITH TIME ZONE
  - `processo_id`: UUID (FK para processos)
  - `cliente_id`: UUID (FK para clientes)
  - `realizado_por`: UUID (FK para usuarios)
  - `dados_completos`: JSONB
  - `criado_em`: TIMESTAMP WITH TIME ZONE
  - `atualizado_em`: TIMESTAMP WITH TIME ZONE

- **envios_inss**
  - `id`: UUID (PK)
  - `protocolo_processo`: TEXT
  - `documento_id`: TEXT
  - `tipo_documento`: TEXT
  - `nome_documento`: TEXT
  - `data_envio`: TIMESTAMP WITH TIME ZONE
  - `tamanho`: INTEGER
  - `status`: TEXT
  - `processo_id`: UUID (FK para processos)
  - `cliente_id`: UUID (FK para clientes)
  - `enviado_por`: UUID (FK para usuarios)
  - `criado_em`: TIMESTAMP WITH TIME ZONE
  - `atualizado_em`: TIMESTAMP WITH TIME ZONE

### Campos Adicionados a Tabelas Existentes

- **campanhas_whatsapp**
  - `taxa_entrega`: DECIMAL(5,2)
  - `taxa_leitura`: DECIMAL(5,2)
  - `taxa_resposta`: DECIMAL(5,2)
  - `taxa_conversao`: DECIMAL(5,2)
  - `melhor_horario_envio`: TIME

- **leads**
  - `origem_conversao`: TEXT
  - `campanha_conversao`: UUID (FK para campanhas_whatsapp)
  - `data_conversao`: TIMESTAMP WITH TIME ZONE

- **mensagens_whatsapp**
  - `tempo_resposta`: INTEGER

- **clientes**
  - `validado_govbr`: BOOLEAN
  - `nivel_validacao_govbr`: INTEGER
  - `data_validacao_govbr`: TIMESTAMP WITH TIME ZONE

- **processos**
  - `protocolo_inss`: TEXT
  - `situacao_inss`: TEXT
  - `ultima_atualizacao_inss`: TIMESTAMP WITH TIME ZONE

- **documentos**
  - `assinado_digitalmente`: BOOLEAN
  - `data_assinatura`: TIMESTAMP WITH TIME ZONE
  - `assinado_por`: UUID (FK para usuarios)

## Ambiente de Homologação

### Configuração

O ambiente de homologação foi configurado para testar todas as novas funcionalidades implementadas. As configurações estão no arquivo `.env.homologacao` e incluem:

- Credenciais do Supabase para ambiente de homologação
- Configurações de WhatsApp para testes
- Credenciais de Gov.br (ambiente de homologação)
- Credenciais de SGA INSS (ambiente de homologação)
- Credenciais de INSS Digital (ambiente de homologação)

### Dados de Teste

Um script SQL foi criado para popular o ambiente de homologação com dados de teste. O script está localizado em `/supabase/seed/homologacao_dados_teste.sql` e inclui:

- Usuários de teste (administrador, advogado, assistente)
- Clientes de teste
- Processos de teste
- Leads de teste
- Dados de integração com Gov.br
- Agendamentos SGA
- Consultas INSS
- Envios de documentos INSS
- Regras de automação de mensagens
- Campanhas de WhatsApp
- Métricas de campanha

## Testes

### Testes Unitários

Foram implementados testes unitários para todas as novas funcionalidades:

- **Mensagens Agendadas**: `/tests/mensagens-agendadas.test.ts`
  - Testa criação, busca e processamento de mensagens agendadas
  - Testa criação de mensagens para novos leads

- **Métricas de Campanha**: `/tests/metricas-campanhas.test.ts`
  - Testa cálculo de métricas
  - Testa geração de relatórios comparativos
  - Testa identificação de melhores horários

- **Integração Gov.br**: `/tests/govbr.test.ts`
  - Testa autenticação e obtenção de tokens
  - Testa validação de documentos
  - Testa gerenciamento de tokens

- **Integração SGA**: `/tests/inss-sga.test.ts`
  - Testa busca de unidades e serviços
  - Testa agendamentos
  - Testa armazenamento local de dados

- **Integração INSS Digital**: `/tests/inss-digital.test.ts`
  - Testa consulta de benefícios
  - Testa envio de documentos
  - Testa armazenamento local de dados

### Execução dos Testes

Para executar os testes, use o seguinte comando:

```bash
npm test
```

Para executar um teste específico:

```bash
npm test -- tests/mensagens-agendadas.test.ts
```

### Cobertura de Testes

Os testes cobrem todos os principais fluxos e funcionalidades implementadas, incluindo:

- Criação e processamento de mensagens agendadas
- Cálculo de métricas de campanha
- Autenticação e uso de APIs externas
- Armazenamento local de dados
- Tratamento de erros

## Conclusão

As novas funcionalidades implementadas ampliam significativamente as capacidades do sistema PrevGestão, permitindo automação de comunicação com leads e clientes, análise detalhada do desempenho de campanhas e integração com sistemas previdenciários essenciais.

A arquitetura modular e os testes abrangentes garantem a manutenibilidade e a confiabilidade do sistema, facilitando futuras expansões e melhorias.
