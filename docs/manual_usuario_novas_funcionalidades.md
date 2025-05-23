# Manual do Usuário - Novas Funcionalidades PowerPrev

## Sumário

1. [Introdução](#introdução)
2. [Sistema de Mensagens Automatizadas](#sistema-de-mensagens-automatizadas)
3. [Métricas de Campanha](#métricas-de-campanha)
4. [Integrações Previdenciárias](#integrações-previdenciárias)
   - [Integração com Gov.br](#integração-com-govbr)
   - [Integração com SGA](#integração-com-sga)
   - [Integração com INSS Digital](#integração-com-inss-digital)
5. [Perguntas Frequentes](#perguntas-frequentes)

## Introdução

Bem-vindo às novas funcionalidades do sistema PowerPrev! Este manual apresenta as novas ferramentas disponíveis para otimizar sua comunicação com leads e clientes, analisar o desempenho de campanhas e integrar com sistemas previdenciários.

## Sistema de Mensagens Automatizadas

### O que é?

O sistema de mensagens automatizadas permite programar o envio de mensagens via WhatsApp para seus leads e clientes em momentos específicos, como 1, 3 ou 7 dias após o cadastro.

### Como usar

#### Acessando o Sistema de Mensagens Automatizadas

1. Faça login no sistema PrevGestão
2. No menu lateral, clique em "WhatsApp" e depois em "Mensagens Agendadas"

#### Criando Regras de Automação

1. Na tela de Mensagens Agendadas, clique em "Regras de Automação"
2. Clique no botão "Nova Regra"
3. Preencha o formulário:
   - **Nome**: Um nome descritivo para a regra (ex: "Boas-vindas D+1")
   - **Descrição**: Detalhes sobre o propósito da regra
   - **Evento Gatilho**: Selecione "Cadastro de Lead"
   - **Dias Após Evento**: Número de dias após o cadastro para enviar a mensagem (ex: 1, 3, 7)
   - **Hora de Envio**: Horário preferencial para envio
   - **Conteúdo da Mensagem**: Texto da mensagem, podendo incluir variáveis como {{nome}}
4. Clique em "Salvar"

#### Visualizando Mensagens Agendadas

1. Na tela principal de Mensagens Agendadas, você verá todas as mensagens programadas
2. Use os filtros para encontrar mensagens específicas:
   - Por status (Agendada, Enviada, Falha, Cancelada)
   - Por data de agendamento
   - Por lead

#### Criando Mensagens Manualmente

1. Clique no botão "Nova Mensagem Agendada"
2. Selecione o lead para quem deseja enviar
3. Escreva o conteúdo da mensagem
4. Defina a data e hora de envio
5. Clique em "Agendar"

#### Cancelando Mensagens Agendadas

1. Localize a mensagem na lista
2. Clique no botão "Cancelar" ao lado da mensagem
3. Confirme a ação

### Dicas e Melhores Práticas

- **Personalização**: Use variáveis como {{nome}} para personalizar suas mensagens
- **Frequência**: Evite enviar muitas mensagens em um curto período de tempo
- **Horários**: Prefira enviar mensagens em horários comerciais
- **Conteúdo**: Mantenha as mensagens curtas e objetivas
- **Monitoramento**: Acompanhe as taxas de resposta para ajustar sua estratégia

## Métricas de Campanha

### O que são?

As métricas de campanha permitem analisar o desempenho das suas campanhas de WhatsApp com dados detalhados sobre taxas de entrega, leitura, resposta e conversão.

### Como usar

#### Acessando as Métricas de Campanha

1. Faça login no sistema PrevGestão
2. No menu lateral, clique em "Campanhas" e depois em "Relatórios"

#### Visualizando o Resumo de Campanhas

Na tela principal de Relatórios, você verá um resumo de todas as campanhas com:

- **Taxa de Entrega**: Percentual de mensagens entregues
- **Taxa de Leitura**: Percentual de mensagens lidas
- **Taxa de Resposta**: Percentual de leads que responderam
- **Taxa de Conversão**: Percentual de leads que avançaram no funil
- **Melhor Horário**: Horário com maior taxa de resposta

#### Analisando uma Campanha Específica

1. Clique no nome da campanha para ver detalhes
2. Na tela de detalhes, você encontrará:
   - **Gráfico de Desempenho**: Evolução das métricas ao longo do tempo
   - **Métricas por Horário**: Desempenho em diferentes horários do dia
   - **Lista de Conversões**: Leads que avançaram no funil após a campanha

#### Comparando Campanhas

1. Na tela de Relatórios, selecione duas ou mais campanhas
2. Clique no botão "Comparar Selecionadas"
3. Visualize gráficos comparativos de todas as métricas

#### Identificando o Melhor Horário para Envio

1. Na tela de Relatórios, clique em "Análise de Horários"
2. O sistema mostrará uma tabela com os horários e suas respectivas taxas de resposta
3. Use esta informação para programar suas próximas campanhas

### Interpretando as Métricas

- **Taxa de Entrega < 90%**: Pode indicar problemas com números de telefone inválidos
- **Taxa de Leitura < 60%**: Considere melhorar o assunto ou timing das mensagens
- **Taxa de Resposta < 10%**: Revise o conteúdo da mensagem para torná-lo mais engajador
- **Tempo Médio de Resposta > 24h**: Seus leads podem não estar vendo a mensagem como urgente

## Integrações Previdenciárias

### Integração com Gov.br

#### O que é?

A integração com Gov.br permite autenticar usuários, validar documentos e assinar documentos digitalmente usando a plataforma oficial do governo.

#### Como usar

##### Autenticação via Gov.br

1. Na tela de perfil do usuário, clique em "Conectar com Gov.br"
2. Você será redirecionado para a página de login do Gov.br
3. Faça login com suas credenciais do Gov.br
4. Autorize o acesso do PrevGestão aos seus dados
5. Você será redirecionado de volta ao sistema com a integração ativada

##### Validação de Documentos

1. Na ficha do cliente, clique na aba "Documentos"
2. Selecione o documento que deseja validar
3. Clique no botão "Validar com Gov.br"
4. Siga as instruções na tela para completar a validação

##### Assinatura Digital

1. Na ficha do cliente, clique na aba "Documentos"
2. Selecione o documento que deseja assinar
3. Clique no botão "Assinar com Gov.br"
4. Siga as instruções na tela para completar a assinatura

#### Benefícios

- **Segurança**: Validação oficial de documentos
- **Conformidade**: Atendimento às exigências legais
- **Agilidade**: Processos digitais sem necessidade de papel

### Integração com SGA

#### O que é?

A integração com o Sistema de Gerenciamento de Agendamento (SGA) do INSS permite agendar atendimentos presenciais nas agências do INSS diretamente pelo sistema.

#### Como usar

##### Agendando um Atendimento

1. Na ficha do cliente ou processo, clique em "Novo Agendamento INSS"
2. Selecione o tipo de serviço desejado
3. Escolha a unidade de atendimento
4. O sistema mostrará as datas e horários disponíveis
5. Selecione a data e horário desejados
6. Confirme os dados do cliente
7. Clique em "Agendar"
8. O sistema salvará o agendamento e enviará um lembrete ao cliente

##### Consultando Agendamentos

1. Na ficha do cliente ou processo, clique na aba "Agendamentos"
2. Visualize todos os agendamentos realizados
3. Clique em um agendamento para ver detalhes

##### Cancelando Agendamentos

1. Na lista de agendamentos, localize o agendamento que deseja cancelar
2. Clique no botão "Cancelar"
3. Informe o motivo do cancelamento
4. Confirme a ação

#### Lembretes Automáticos

O sistema enviará automaticamente lembretes via WhatsApp para os clientes:
- 3 dias antes do agendamento
- No dia do agendamento (pela manhã)

### Integração com INSS Digital

#### O que é?

A integração com o INSS Digital permite consultar benefícios, processos administrativos, enviar documentos e acompanhar requerimentos diretamente pelo sistema.

#### Como usar

##### Consultando Benefícios

1. Na ficha do cliente, clique na aba "Benefícios"
2. Clique no botão "Consultar Benefícios INSS"
3. O sistema buscará todos os benefícios associados ao CPF do cliente
4. Os benefícios serão exibidos com detalhes como número, tipo, situação e valor

##### Consultando Processos Administrativos

1. Na ficha do cliente, clique na aba "Processos INSS"
2. Clique no botão "Consultar Processos INSS"
3. O sistema buscará todos os processos associados ao CPF do cliente
4. Os processos serão exibidos com detalhes como protocolo, tipo, situação e data de abertura

##### Enviando Documentos

1. Na ficha do processo, clique na aba "Documentos INSS"
2. Clique no botão "Enviar Documento"
3. Selecione o tipo de documento
4. Faça upload do arquivo
5. Clique em "Enviar"
6. O sistema enviará o documento ao INSS e registrará o envio

##### Acompanhando Requerimentos

1. Na ficha do cliente, clique na aba "Requerimentos INSS"
2. Clique no botão "Consultar Requerimentos"
3. O sistema buscará todos os requerimentos associados ao CPF do cliente
4. Os requerimentos serão exibidos com detalhes como protocolo, serviço, situação e data

#### Benefícios

- **Agilidade**: Consultas e envios sem necessidade de acessar outros sistemas
- **Organização**: Todos os dados previdenciários centralizados
- **Histórico**: Registro completo de todas as interações com o INSS

## Perguntas Frequentes

### Sistema de Mensagens Automatizadas

**P: As mensagens são enviadas exatamente no horário programado?**  
R: O sistema processa as mensagens agendadas a cada 15 minutos. Portanto, pode haver uma diferença de até 15 minutos entre o horário programado e o envio efetivo.

**P: O que acontece se o lead responder a uma mensagem automatizada?**  
R: A resposta será recebida normalmente e aparecerá na conversa do lead. Você receberá uma notificação sobre a resposta.

**P: Posso editar uma mensagem já agendada?**  
R: Não é possível editar uma mensagem já agendada. Você precisa cancelar a mensagem atual e criar uma nova.

### Métricas de Campanha

**P: Com que frequência as métricas são atualizadas?**  
R: As métricas são atualizadas em tempo real para eventos como envio e entrega. Para leituras e respostas, a atualização ocorre a cada 15 minutos.

**P: Como é calculada a taxa de conversão?**  
R: A taxa de conversão é calculada dividindo o número de leads que avançaram no funil (mudaram de status) após a campanha pelo número total de leads que receberam a mensagem.

**P: Por que algumas mensagens aparecem como "Não entregues"?**  
R: Mensagens podem não ser entregues por diversos motivos, como número de telefone inválido, telefone desligado por muito tempo, ou problemas na API do WhatsApp.

### Integrações Previdenciárias

**P: É necessário ter uma conta Gov.br para usar a integração?**  
R: Sim, é necessário ter uma conta Gov.br com nível de autenticação prata ou ouro para usar os recursos de validação e assinatura de documentos.

**P: Os agendamentos no SGA são confirmados imediatamente?**  
R: Sim, os agendamentos são confirmados em tempo real. Você receberá o número de protocolo imediatamente após o agendamento.

**P: Com que frequência os dados do INSS são atualizados?**  
R: Os dados são obtidos em tempo real no momento da consulta. Para manter um histórico, o sistema salva localmente os resultados de cada consulta.

**P: É possível enviar vários documentos de uma vez para o INSS Digital?**  
R: Não, os documentos devem ser enviados um por vez, seguindo as regras e formatos aceitos pelo INSS.

### Outras Dúvidas

**P: Preciso de permissões especiais para acessar as novas funcionalidades?**  
R: Sim, as permissões são configuradas pelo administrador do sistema. Entre em contato com seu administrador se não conseguir acessar alguma funcionalidade.

**P: O sistema funciona em dispositivos móveis?**  
R: Sim, todas as novas funcionalidades são responsivas e funcionam em smartphones e tablets.

**P: Onde posso obter mais ajuda?**  
R: Para suporte adicional, clique no ícone de ajuda (?) no canto superior direito da tela ou entre em contato com o suporte técnico pelo e-mail suporte@prevgestao.com.br.
