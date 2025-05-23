import { test, expect } from '@playwright/test';

test.describe('Fluxo completo de gestão jurídica', () => {
  test.beforeEach(async ({ page }) => {
    // Login no sistema
    await page.goto('/auth/login');
    await page.fill('[data-testid="email"]', 'admin@prevgestao.com.br');
    await page.fill('[data-testid="password"]', 'senha123');
    await page.click('[data-testid="login-button"]');
    
    // Verificar se o login foi bem-sucedido
    await expect(page).toHaveURL('/dashboard');
  });

  test('Cadastrar cliente, processo e documento', async ({ page }) => {
    // 1. Cadastrar novo cliente
    await page.click('text=Clientes');
    await page.click('text=Novo Cliente');
    
    // Preencher formulário de cliente
    await page.fill('[data-testid="nome"]', 'João da Silva');
    await page.fill('[data-testid="cpf"]', '123.456.789-00');
    await page.fill('[data-testid="data_nascimento"]', '1980-05-15');
    await page.fill('[data-testid="telefone"]', '(11) 98765-4321');
    await page.fill('[data-testid="email"]', 'joao.silva@exemplo.com');
    await page.fill('[data-testid="endereco"]', 'Rua Exemplo, 123 - São Paulo/SP');
    await page.click('text=Salvar');
    
    // Verificar se o cliente foi cadastrado
    await expect(page.locator('text=Cliente cadastrado com sucesso')).toBeVisible();
    
    // 2. Cadastrar novo processo
    await page.click('text=Processos');
    await page.click('text=Novo Processo');
    
    // Preencher formulário de processo
    await page.fill('[data-testid="numero"]', '1234567-89.2025.8.26.0100');
    await page.selectOption('[data-testid="tipo"]', 'Judicial');
    await page.click('[data-testid="cliente_id"]');
    await page.click('text=João da Silva');
    await page.fill('[data-testid="data_abertura"]', '2025-04-17');
    await page.selectOption('[data-testid="status"]', 'Em andamento');
    await page.fill('[data-testid="descricao"]', 'Processo de aposentadoria por tempo de contribuição');
    await page.click('text=Salvar');
    
    // Verificar se o processo foi cadastrado
    await expect(page.locator('text=Processo cadastrado com sucesso')).toBeVisible();
    
    // 3. Cadastrar documento
    await page.click('text=Documentos');
    await page.click('text=Novo Documento');
    
    // Preencher formulário de documento
    await page.fill('[data-testid="nome"]', 'Petição Inicial');
    await page.selectOption('[data-testid="tipo"]', 'Petição');
    await page.click('[data-testid="cliente_id"]');
    await page.click('text=João da Silva');
    await page.click('[data-testid="processo_id"]');
    await page.click('text=1234567-89.2025.8.26.0100');
    
    // Upload de arquivo (simulado)
    await page.setInputFiles('[data-testid="arquivo"]', 'test-file.pdf');
    await page.click('text=Salvar');
    
    // Verificar se o documento foi cadastrado
    await expect(page.locator('text=Documento cadastrado com sucesso')).toBeVisible();
    
    // 4. Verificar se os dados aparecem corretamente nas listagens
    await page.click('text=Clientes');
    await expect(page.locator('text=João da Silva')).toBeVisible();
    
    await page.click('text=Processos');
    await expect(page.locator('text=1234567-89.2025.8.26.0100')).toBeVisible();
    
    await page.click('text=Documentos');
    await expect(page.locator('text=Petição Inicial')).toBeVisible();
  });
});

test.describe('Fluxo de leads e WhatsApp', () => {
  test.beforeEach(async ({ page }) => {
    // Login no sistema
    await page.goto('/auth/login');
    await page.fill('[data-testid="email"]', 'admin@prevgestao.com.br');
    await page.fill('[data-testid="password"]', 'senha123');
    await page.click('[data-testid="login-button"]');
    
    // Verificar se o login foi bem-sucedido
    await expect(page).toHaveURL('/dashboard');
  });

  test('Cadastrar lead e criar campanha de WhatsApp', async ({ page }) => {
    // 1. Cadastrar novo lead
    await page.click('text=Leads');
    await page.click('text=Novo Lead');
    
    // Preencher formulário de lead
    await page.fill('[data-testid="nome"]', 'Maria Oliveira');
    await page.fill('[data-testid="telefone"]', '(11) 91234-5678');
    await page.fill('[data-testid="email"]', 'maria.oliveira@exemplo.com');
    await page.selectOption('[data-testid="origem"]', 'Site');
    await page.selectOption('[data-testid="interesse"]', 'Aposentadoria');
    await page.selectOption('[data-testid="status"]', 'Novo');
    await page.fill('[data-testid="observacoes"]', 'Cliente interessada em aposentadoria por idade');
    await page.click('text=Salvar');
    
    // Verificar se o lead foi cadastrado
    await expect(page.locator('text=Lead cadastrado com sucesso')).toBeVisible();
    
    // 2. Criar campanha de WhatsApp
    await page.click('text=Campanhas');
    await page.click('text=Nova Campanha');
    
    // Preencher formulário de campanha
    await page.fill('[data-testid="nome"]', 'Campanha Aposentadoria');
    await page.fill('[data-testid="descricao"]', 'Campanha para leads interessados em aposentadoria');
    await page.fill('[data-testid="mensagem"]', 'Olá {{nome}}, somos da PrevGestão e gostaríamos de ajudar com sua aposentadoria. Podemos agendar uma consulta?');
    
    // Selecionar destinatários
    await page.click('[data-testid="selecionar-leads"]');
    await page.click('text=Maria Oliveira');
    await page.click('text=Confirmar');
    
    // Salvar como rascunho
    await page.click('text=Salvar como Rascunho');
    
    // Verificar se a campanha foi cadastrada
    await expect(page.locator('text=Campanha salva como rascunho')).toBeVisible();
    
    // 3. Verificar se os dados aparecem corretamente nas listagens
    await page.click('text=Leads');
    await expect(page.locator('text=Maria Oliveira')).toBeVisible();
    
    await page.click('text=Campanhas');
    await expect(page.locator('text=Campanha Aposentadoria')).toBeVisible();
  });
});

test.describe('Fluxo financeiro', () => {
  test.beforeEach(async ({ page }) => {
    // Login no sistema
    await page.goto('/auth/login');
    await page.fill('[data-testid="email"]', 'admin@prevgestao.com.br');
    await page.fill('[data-testid="password"]', 'senha123');
    await page.click('[data-testid="login-button"]');
    
    // Verificar se o login foi bem-sucedido
    await expect(page).toHaveURL('/dashboard');
  });

  test('Cadastrar honorário e registrar pagamento', async ({ page }) => {
    // 1. Cadastrar novo honorário
    await page.click('text=Financeiro');
    await page.click('text=Honorários');
    await page.click('text=Novo Honorário');
    
    // Preencher formulário de honorário
    await page.click('[data-testid="cliente_id"]');
    await page.click('text=João da Silva');
    await page.click('[data-testid="processo_id"]');
    await page.click('text=1234567-89.2025.8.26.0100');
    await page.fill('[data-testid="valor"]', '3000');
    await page.fill('[data-testid="data_vencimento"]', '2025-05-15');
    await page.selectOption('[data-testid="status"]', 'Pendente');
    await page.fill('[data-testid="observacoes"]', 'Honorário inicial do processo');
    await page.click('text=Salvar');
    
    // Verificar se o honorário foi cadastrado
    await expect(page.locator('text=Honorário cadastrado com sucesso')).toBeVisible();
    
    // 2. Registrar pagamento
    await page.click('[data-testid="pagamento-button"]');
    await page.fill('[data-testid="data_pagamento"]', '2025-04-17');
    await page.fill('[data-testid="observacoes_pagamento"]', 'Pagamento via PIX');
    await page.click('text=Confirmar Pagamento');
    
    // Verificar se o pagamento foi registrado
    await expect(page.locator('text=Pagamento registrado com sucesso')).toBeVisible();
    
    // 3. Verificar se o status foi atualizado
    await expect(page.locator('text=Pago')).toBeVisible();
    
    // 4. Verificar relatório financeiro
    await page.click('text=Relatórios');
    await page.click('text=Financeiro');
    
    // Selecionar período
    await page.fill('[data-testid="data_inicio"]', '2025-04-01');
    await page.fill('[data-testid="data_fim"]', '2025-05-31');
    await page.click('text=Gerar Relatório');
    
    // Verificar se o relatório contém o honorário
    await expect(page.locator('text=João da Silva')).toBeVisible();
    await expect(page.locator('text=R$ 3.000,00')).toBeVisible();
    await expect(page.locator('text=Pago')).toBeVisible();
  });
});

test.describe('Segurança e autenticação', () => {
  test('Fluxo de login, 2FA e logout', async ({ page }) => {
    // 1. Tentar acessar área restrita sem login
    await page.goto('/dashboard');
    
    // Verificar redirecionamento para login
    await expect(page).toHaveURL('/auth/login');
    
    // 2. Login com credenciais válidas
    await page.fill('[data-testid="email"]', 'admin@prevgestao.com.br');
    await page.fill('[data-testid="password"]', 'senha123');
    await page.click('[data-testid="login-button"]');
    
    // 3. Verificar redirecionamento para 2FA (se habilitado)
    if (await page.url().includes('/auth/2fa/verify')) {
      // Simular verificação 2FA
      await page.fill('[data-testid="token"]', '123456');
      await page.click('[data-testid="verify-button"]');
    }
    
    // 4. Verificar acesso ao dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // 5. Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Sair');
    
    // 6. Verificar redirecionamento para login
    await expect(page).toHaveURL('/auth/login');
    
    // 7. Tentar acessar área restrita após logout
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/auth/login');
  });
  
  test('Controle de acesso baseado em função', async ({ page }) => {
    // 1. Login como usuário com função limitada
    await page.goto('/auth/login');
    await page.fill('[data-testid="email"]', 'assistente@prevgestao.com.br');
    await page.fill('[data-testid="password"]', 'senha123');
    await page.click('[data-testid="login-button"]');
    
    // 2. Verificar acesso permitido a áreas autorizadas
    await page.click('text=Clientes');
    await expect(page).toHaveURL('/clientes');
    
    await page.click('text=Documentos');
    await expect(page).toHaveURL('/documentos');
    
    // 3. Tentar acessar área não autorizada
    await page.goto('/financeiro');
    
    // 4. Verificar mensagem de acesso negado
    await expect(page.locator('text=Acesso negado')).toBeVisible();
  });
});
