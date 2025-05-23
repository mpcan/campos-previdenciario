# Manual do Usuário - Sistema PrevGestão

## Sumário

1. [Introdução](#1-introdução)
2. [Primeiros Passos](#2-primeiros-passos)
3. [Módulo de Gestão Jurídica](#3-módulo-de-gestão-jurídica)
4. [Módulo Financeiro](#4-módulo-financeiro)
5. [Agenda e Tarefas](#5-agenda-e-tarefas)
6. [Módulo de Leads e WhatsApp](#6-módulo-de-leads-e-whatsapp)
7. [Relatórios e Dashboards](#7-relatórios-e-dashboards)
8. [Configurações e Segurança](#8-configurações-e-segurança)
9. [Solução de Problemas](#9-solução-de-problemas)
10. [Perguntas Frequentes](#10-perguntas-frequentes)

## 1. Introdução

### 1.1 Sobre o PrevGestão

O PrevGestão é um sistema web completo desenvolvido especificamente para escritórios jurídicos previdenciários. Ele integra todas as funcionalidades necessárias para a gestão eficiente do seu escritório, incluindo:

- Gestão de clientes e processos
- Controle financeiro
- Agenda e tarefas
- Captação e gestão de leads
- Automação de comunicação via WhatsApp
- Relatórios e dashboards

### 1.2 Requisitos do Sistema

Para utilizar o PrevGestão, você precisa apenas de:

- Um navegador web atualizado (Chrome, Firefox, Edge ou Safari)
- Conexão com a internet
- Credenciais de acesso fornecidas pelo administrador

### 1.3 Convenções deste Manual

Neste manual, utilizamos as seguintes convenções:

- **Negrito**: Para destacar botões, menus e elementos da interface
- *Itálico*: Para termos importantes
- `Código`: Para valores que devem ser inseridos exatamente como mostrados
- 💡 **Dica**: Para sugestões úteis
- ⚠️ **Atenção**: Para avisos importantes

## 2. Primeiros Passos

### 2.1 Acessando o Sistema

1. Abra seu navegador e acesse o endereço do sistema: `https://prevgestao.com.br`
2. Na tela de login, insira seu **e-mail** e **senha**
3. Clique no botão **Entrar**

![Tela de Login](imagens/tela_login.png)

### 2.2 Configurando Autenticação de Dois Fatores (2FA)

Para maior segurança, recomendamos configurar a autenticação de dois fatores:

1. Após o primeiro login, você será direcionado para a página de configuração de 2FA
2. Instale um aplicativo autenticador em seu smartphone (Google Authenticator, Microsoft Authenticator ou Authy)
3. Escaneie o código QR exibido na tela com o aplicativo
4. Digite o código de 6 dígitos gerado pelo aplicativo
5. Clique em **Confirmar**

💡 **Dica**: Guarde os códigos de recuperação em um local seguro. Eles serão necessários caso você perca acesso ao seu aplicativo autenticador.

### 2.3 Navegação Básica

A interface do PrevGestão é composta por:

- **Barra lateral**: Menu principal de navegação
- **Cabeçalho**: Informações do usuário e notificações
- **Área de conteúdo**: Exibe as informações e formulários
- **Rodapé**: Informações de versão e suporte

![Interface Principal](imagens/interface_principal.png)

### 2.4 Dashboard Principal

O dashboard principal apresenta uma visão geral do escritório:

- **Resumo de clientes e processos**
- **Tarefas pendentes**
- **Próximos compromissos**
- **Indicadores financeiros**
- **Leads recentes**

Para acessar o dashboard, clique em **Dashboard** no menu lateral.

## 3. Módulo de Gestão Jurídica

### 3.1 Gerenciamento de Clientes

#### 3.1.1 Listagem de Clientes

Para acessar a lista de clientes:

1. Clique em **Clientes** no menu lateral
2. Utilize os filtros para encontrar clientes específicos
3. Clique no nome do cliente para ver detalhes

![Lista de Clientes](imagens/lista_clientes.png)

#### 3.1.2 Cadastro de Novo Cliente

Para cadastrar um novo cliente:

1. Na página de clientes, clique no botão **Novo Cliente**
2. Preencha os campos obrigatórios (marcados com *)
3. Adicione informações adicionais conforme necessário
4. Clique em **Salvar**

Campos importantes:
- **Nome completo**
- **CPF**
- **Data de nascimento**
- **Telefone**
- **E-mail**
- **Endereço**

#### 3.1.3 Edição e Exclusão de Clientes

Para editar um cliente:
1. Na lista de clientes, clique no ícone de edição (✏️)
2. Faça as alterações necessárias
3. Clique em **Salvar**

Para excluir um cliente:
1. Na lista de clientes, clique no ícone de exclusão (🗑️)
2. Confirme a exclusão na caixa de diálogo

⚠️ **Atenção**: A exclusão de um cliente também removerá todos os processos, atendimentos e documentos associados a ele.

### 3.2 Gerenciamento de Processos

#### 3.2.1 Listagem de Processos

Para acessar a lista de processos:

1. Clique em **Processos** no menu lateral
2. Utilize os filtros para encontrar processos específicos
3. Clique no número do processo para ver detalhes

![Lista de Processos](imagens/lista_processos.png)

#### 3.2.2 Cadastro de Novo Processo

Para cadastrar um novo processo:

1. Na página de processos, clique no botão **Novo Processo**
2. Selecione o cliente associado
3. Preencha os campos obrigatórios
4. Clique em **Salvar**

Campos importantes:
- **Número do processo**
- **Tipo** (Administrativo ou Judicial)
- **Cliente**
- **Responsável**
- **Data de abertura**
- **Status**
- **Descrição**

#### 3.2.3 Acompanhamento de Processos

Para acompanhar o andamento de um processo:

1. Acesse a página de detalhes do processo
2. Na aba **Andamentos**, clique em **Novo Andamento**
3. Preencha a data, descrição e anexe documentos se necessário
4. Clique em **Salvar**

### 3.3 Atendimentos

#### 3.3.1 Registro de Atendimentos

Para registrar um novo atendimento:

1. Clique em **Atendimentos** no menu lateral
2. Clique no botão **Novo Atendimento**
3. Selecione o cliente e processo (opcional)
4. Preencha a data, hora, tipo e observações
5. Clique em **Salvar**

#### 3.3.2 Histórico de Atendimentos

Para visualizar o histórico de atendimentos:

1. Acesse a página de detalhes do cliente
2. Na aba **Atendimentos**, veja todos os atendimentos realizados
3. Clique em um atendimento para ver detalhes

### 3.4 Perícias

#### 3.4.1 Agendamento de Perícias

Para agendar uma perícia:

1. Clique em **Perícias** no menu lateral
2. Clique no botão **Nova Perícia**
3. Selecione o processo associado
4. Preencha data, hora, local e perito
5. Clique em **Salvar**

💡 **Dica**: O sistema enviará automaticamente lembretes por WhatsApp para o cliente alguns dias antes da perícia.

#### 3.4.2 Registro de Resultados

Para registrar o resultado de uma perícia:

1. Na lista de perícias, clique no ícone de edição (✏️)
2. Preencha o campo **Resultado**
3. Adicione observações relevantes
4. Clique em **Salvar**

### 3.5 Documentos

#### 3.5.1 Upload de Documentos

Para fazer upload de documentos:

1. Clique em **Documentos** no menu lateral
2. Clique no botão **Novo Documento**
3. Selecione o cliente e/ou processo associado
4. Clique em **Escolher arquivo** e selecione o documento
5. Preencha o nome e tipo do documento
6. Clique em **Salvar**

Formatos suportados: PDF, DOC, DOCX, JPG, PNG

#### 3.5.2 Organização de Documentos

Os documentos são organizados por:
- Cliente
- Processo
- Tipo de documento
- Data de upload

Para encontrar documentos rapidamente, utilize os filtros disponíveis na página de documentos.

## 4. Módulo Financeiro

### 4.1 Honorários

#### 4.1.1 Cadastro de Honorários

Para cadastrar honorários:

1. Clique em **Financeiro** > **Honorários** no menu lateral
2. Clique no botão **Novo Honorário**
3. Selecione o cliente e processo
4. Preencha o valor, data de vencimento e forma de pagamento
5. Clique em **Salvar**

#### 4.1.2 Controle de Pagamentos

Para registrar um pagamento:

1. Na lista de honorários, localize o registro desejado
2. Clique no ícone de pagamento (💰)
3. Preencha a data de pagamento e observações
4. Clique em **Confirmar Pagamento**

### 4.2 Receitas e Despesas

#### 4.2.1 Registro de Receitas

Para registrar uma receita:

1. Clique em **Financeiro** > **Receitas** no menu lateral
2. Clique no botão **Nova Receita**
3. Preencha a descrição, valor, data e categoria
4. Clique em **Salvar**

#### 4.2.2 Registro de Despesas

Para registrar uma despesa:

1. Clique em **Financeiro** > **Despesas** no menu lateral
2. Clique no botão **Nova Despesa**
3. Preencha a descrição, valor, data e categoria
4. Clique em **Salvar**

### 4.3 Relatórios Financeiros

Para acessar os relatórios financeiros:

1. Clique em **Relatórios** > **Financeiro** no menu lateral
2. Selecione o período desejado
3. Escolha o tipo de relatório (Receitas, Despesas ou Honorários)
4. Clique em **Gerar Relatório**

Os relatórios podem ser exportados em formato PDF ou Excel.

## 5. Agenda e Tarefas

### 5.1 Gerenciamento de Tarefas

#### 5.1.1 Criação de Tarefas

Para criar uma nova tarefa:

1. Clique em **Tarefas** no menu lateral
2. Clique no botão **Nova Tarefa**
3. Preencha o título, descrição e data de vencimento
4. Selecione a prioridade e o responsável
5. Associe a um cliente ou processo (opcional)
6. Clique em **Salvar**

#### 5.1.2 Acompanhamento de Tarefas

Para acompanhar suas tarefas:

1. Acesse a página de tarefas
2. Utilize os filtros para ver tarefas por status, prioridade ou responsável
3. Clique em uma tarefa para ver detalhes

Para marcar uma tarefa como concluída:
1. Clique no checkbox ao lado da tarefa
2. Ou acesse a tarefa e altere o status para **Concluída**

### 5.2 Agenda

#### 5.2.1 Visualização da Agenda

Para visualizar sua agenda:

1. Clique em **Agenda** no menu lateral
2. Escolha a visualização desejada (Dia, Semana ou Mês)
3. Navegue entre as datas usando as setas

![Agenda](imagens/agenda.png)

#### 5.2.2 Agendamento de Eventos

Para agendar um novo evento:

1. Clique em **Novo Evento** ou diretamente na data/hora desejada
2. Preencha o título, descrição, data e hora
3. Selecione o tipo de evento
4. Associe a um cliente ou processo (opcional)
5. Configure lembretes se necessário
6. Clique em **Salvar**

#### 5.2.3 Integração com Google Calendar

Para sincronizar com o Google Calendar:

1. Clique em **Configurações** > **Integrações**
2. Clique em **Conectar** ao lado de Google Calendar
3. Faça login na sua conta Google
4. Autorize o acesso ao seu calendário

Após a sincronização, os eventos serão compartilhados entre o PrevGestão e o Google Calendar.

## 6. Módulo de Leads e WhatsApp

### 6.1 Gestão de Leads

#### 6.1.1 Cadastro de Leads

Para cadastrar um novo lead:

1. Clique em **Leads** no menu lateral
2. Clique no botão **Novo Lead**
3. Preencha os dados de contato
4. Selecione a origem e o interesse
5. Clique em **Salvar**

#### 6.1.2 Importação de Leads

Para importar leads em massa:

1. Clique em **Leads** no menu lateral
2. Clique no botão **Importar Leads**
3. Selecione o formato (CSV ou Excel)
4. Faça upload do arquivo
5. Mapeie as colunas conforme solicitado
6. Clique em **Importar**

💡 **Dica**: Baixe o modelo de planilha disponível na página de importação para garantir a compatibilidade.

### 6.2 Campanhas de WhatsApp

#### 6.2.1 Criação de Campanhas

Para criar uma nova campanha:

1. Clique em **Campanhas** no menu lateral
2. Clique no botão **Nova Campanha**
3. Preencha o nome e descrição da campanha
4. Escreva a mensagem, utilizando variáveis como {{nome}} se necessário
5. Selecione os destinatários
6. Clique em **Salvar como Rascunho** ou **Salvar e Enviar**

![Criação de Campanha](imagens/criacao_campanha.png)

#### 6.2.2 Modelos de Mensagem

Para utilizar modelos pré-definidos:

1. Na página de criação de campanha, clique em **Usar Modelo**
2. Selecione o modelo desejado
3. Personalize a mensagem conforme necessário
4. Continue com a criação da campanha

#### 6.2.3 Acompanhamento de Campanhas

Para acompanhar o desempenho das campanhas:

1. Clique em **Campanhas** no menu lateral
2. Selecione a campanha desejada
3. Veja estatísticas de envio, entrega e leitura
4. Acesse a aba **Respostas** para ver as interações

### 6.3 Chat do WhatsApp

#### 6.3.1 Atendimento via WhatsApp

Para atender clientes e leads via WhatsApp:

1. Clique em **WhatsApp** no menu lateral
2. Selecione o contato na lista à esquerda
3. Visualize o histórico de conversas
4. Digite sua mensagem e clique em **Enviar**

#### 6.3.2 Uso de Modelos no Chat

Para usar modelos durante o atendimento:

1. Na interface de chat, clique na aba **Modelos**
2. Selecione a categoria desejada
3. Clique em **Usar** no modelo escolhido
4. Personalize a mensagem se necessário
5. Clique em **Enviar**

## 7. Relatórios e Dashboards

### 7.1 Dashboard Principal

O dashboard principal apresenta uma visão geral do escritório com:

- Indicadores de desempenho
- Gráficos de processos por status
- Tarefas pendentes
- Próximos compromissos
- Leads recentes

Para acessar, clique em **Dashboard** no menu lateral.

### 7.2 Relatórios de Leads

Para acessar os relatórios de leads:

1. Clique em **Relatórios** > **Leads** no menu lateral
2. Selecione o período desejado
3. Visualize gráficos de:
   - Leads por origem
   - Leads por mês
   - Taxa de conversão
   - Campanhas por status

### 7.3 Relatórios Financeiros

Para acessar os relatórios financeiros:

1. Clique em **Relatórios** > **Financeiro** no menu lateral
2. Selecione o período desejado
3. Visualize gráficos de:
   - Receitas por mês
   - Despesas por mês
   - Honorários por tipo
   - Status de pagamentos

### 7.4 Relatórios de Processos

Para acessar os relatórios de processos:

1. Clique em **Relatórios** > **Processos** no menu lateral
2. Selecione o período desejado
3. Visualize gráficos de:
   - Processos por tipo
   - Processos por status
   - Processos por mês
   - Atendimentos por mês
   - Perícias por resultado

### 7.5 Exportação de Relatórios

Para exportar um relatório:

1. Acesse o relatório desejado
2. Clique no botão **Exportar**
3. Selecione o formato (PDF ou Excel)
4. Clique em **Confirmar**

## 8. Configurações e Segurança

### 8.1 Perfil de Usuário

Para editar seu perfil:

1. Clique no seu nome no canto superior direito
2. Selecione **Meu Perfil**
3. Edite suas informações
4. Clique em **Salvar**

### 8.2 Configuração de 2FA

Para gerenciar a autenticação de dois fatores:

1. Acesse seu perfil
2. Clique na aba **Segurança**
3. Para ativar: Clique em **Ativar 2FA** e siga as instruções
4. Para desativar: Clique em **Desativar 2FA** e confirme

### 8.3 Gerenciamento de Usuários (Administradores)

Para gerenciar usuários (apenas administradores):

1. Clique em **Configurações** > **Usuários** no menu lateral
2. Para adicionar: Clique em **Novo Usuário**
3. Para editar: Clique no ícone de edição (✏️)
4. Para desativar: Clique no ícone de desativação (🔒)

### 8.4 Configuração de Permissões

Para configurar permissões (apenas administradores):

1. Clique em **Configurações** > **Funções e Permissões**
2. Selecione a função desejada
3. Marque ou desmarque as permissões
4. Clique em **Salvar**

Funções disponíveis:
- **Admin**: Acesso completo
- **Advogado**: Acesso a gestão jurídica
- **Assistente**: Acesso limitado
- **Financeiro**: Acesso ao módulo financeiro
- **Marketing**: Acesso a leads e campanhas

## 9. Solução de Problemas

### 9.1 Problemas de Login

Se você não conseguir fazer login:

1. Verifique se está usando o e-mail e senha corretos
2. Certifique-se de que o Caps Lock não está ativado
3. Tente redefinir sua senha clicando em **Esqueci minha senha**
4. Se você usa 2FA, verifique se o código está correto e se o relógio do seu dispositivo está sincronizado

### 9.2 Problemas com WhatsApp

Se as mensagens de WhatsApp não estiverem sendo enviadas:

1. Verifique se o número está formatado corretamente (com código do país)
2. Certifique-se de que o número está ativo no WhatsApp
3. Verifique se a integração com WhatsApp está ativa em **Configurações** > **Integrações**

### 9.3 Problemas de Desempenho

Se o sistema estiver lento:

1. Verifique sua conexão com a internet
2. Limpe o cache do navegador
3. Feche outras abas e aplicativos que consomem muitos recursos
4. Tente usar outro navegador

### 9.4 Suporte Técnico

Para obter suporte técnico:

1. Clique em **Ajuda** no menu inferior
2. Selecione **Suporte Técnico**
3. Preencha o formulário descrevendo o problema
4. Anexe capturas de tela se necessário
5. Clique em **Enviar**

Ou entre em contato diretamente:
- E-mail: suporte@prevgestao.com.br
- Telefone: (11) 1234-5678
- WhatsApp: +55 11 98765-4321

## 10. Perguntas Frequentes

### 10.1 Gerais

**P: Posso acessar o sistema de dispositivos móveis?**
R: Sim, o PrevGestão é responsivo e funciona em smartphones e tablets.

**P: O sistema funciona offline?**
R: Não, é necessário conexão com a internet para utilizar o sistema.

**P: Como faço backup dos meus dados?**
R: Os dados são automaticamente armazenados na nuvem. Backups são realizados diariamente.

### 10.2 Gestão Jurídica

**P: Posso importar processos em massa?**
R: Sim, acesse **Processos** > **Importar** e siga as instruções.

**P: Como associo documentos a múltiplos processos?**
R: Ao cadastrar um documento, você pode selecionar múltiplos processos na lista.

### 10.3 WhatsApp e Leads

**P: Quantas mensagens posso enviar por dia?**
R: O limite depende do seu plano. Consulte **Configurações** > **Plano** para ver seu limite atual.

**P: As mensagens são enviadas do meu número pessoal?**
R: Não, as mensagens são enviadas do número oficial do escritório cadastrado na plataforma.

### 10.4 Financeiro

**P: Posso integrar com sistemas contábeis?**
R: Sim, o sistema permite exportação de dados em formatos compatíveis com os principais sistemas contábeis.

**P: Como emito recibos para clientes?**
R: Ao registrar um pagamento, marque a opção **Gerar recibo** e o sistema criará automaticamente um PDF.

---

## Apêndice: Atalhos de Teclado

Para aumentar sua produtividade, utilize os seguintes atalhos:

- **Alt + D**: Ir para o Dashboard
- **Alt + C**: Ir para Clientes
- **Alt + P**: Ir para Processos
- **Alt + T**: Ir para Tarefas
- **Alt + A**: Ir para Agenda
- **Alt + L**: Ir para Leads
- **Alt + W**: Ir para WhatsApp
- **Alt + F**: Ir para Financeiro
- **Alt + R**: Ir para Relatórios
- **Ctrl + N**: Novo registro (na página atual)
- **Ctrl + S**: Salvar formulário
- **Ctrl + F**: Abrir busca
- **Esc**: Fechar modal ou cancelar operação
