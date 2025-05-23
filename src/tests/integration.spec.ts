import { test, expect } from '@playwright/test';

test.describe('Testes de integração entre módulos', () => {
  test.beforeEach(async ({ page }) => {
    // Login no sistema
    await page.goto('/auth/login');
    await page.fill('[data-testid="email"]', 'admin@prevgestao.com.br');
    await page.fill('[data-testid="password"]', 'senha123');
    await page.click('[data-testid="login-button"]');
    
    // Verificar se o login foi bem-sucedido
    await expect(page).toHaveURL('/dashboard');
  });

  test('Fluxo completo: Lead para Cliente para Processo para Financeiro', async ({ page }) => {
    // 1. Cadastrar novo lead
    await page.click('text=Leads');
    await page.click('text=Novo Lead');
    
    const nome = 'Carlos Pereira';
    const email = 'carlos.pereira@exemplo.com';
    const telefone = '(11) 97654-3210';
    
    // Preencher formulário de lead
    await page.fill('[data-testid="nome"]', nome);
    await page.fill('[data-testid="telefone"]', telefone);
    await page.fill('[data-testid="email"]', email);
    await page.selectOption('[data-testid="origem"]', 'WhatsApp');
    await page.selectOption('[data-testid="interesse"]', 'Aposentadoria por Tempo de Contribuição');
    await page.selectOption('[data-testid="status"]', 'Novo');
    await page.fill('[data-testid="observacoes"]', 'Lead interessado em aposentadoria, já possui tempo de contribuição');
    await page.click('text=Salvar');
    
    // Verificar se o lead foi cadastrado
    await expect(page.locator('text=Lead cadastrado com sucesso')).toBeVisible();
    
    // 2. Converter lead em cliente
    await page.click(`text=${nome}`);
    await page.click('text=Converter em Cliente');
    
    // Preencher dados adicionais do cliente
    await page.fill('[data-testid="cpf"]', '987.654.321-00');
    await page.fill('[data-testid="data_nascimento"]', '1975-08-20');
    await page.fill('[data-testid="endereco"]', 'Av. Principal, 456 - Rio de Janeiro/RJ');
    await page.click('text=Confirmar');
    
    // Verificar se o lead foi convertido em cliente
    await expect(page.locator('text=Lead convertido em cliente com sucesso')).toBeVisible();
    
    // 3. Verificar se o cliente foi criado
    await page.click('text=Clientes');
    await expect(page.locator(`text=${nome}`)).toBeVisible();
    
    // 4. Criar processo para o cliente
    await page.click(`text=${nome}`);
    await page.click('text=Novo Processo');
    
    // Preencher formulário de processo
    await page.fill('[data-testid="numero"]', '9876543-21.2025.8.26.0100');
    await page.selectOption('[data-testid="tipo"]', 'Administrativo');
    await page.fill('[data-testid="data_abertura"]', '2025-04-17');
    await page.selectOption('[data-testid="status"]', 'Em andamento');
    await page.fill('[data-testid="descricao"]', 'Processo de aposentadoria por tempo de contribuição');
    await page.click('text=Salvar');
    
    // Verificar se o processo foi cadastrado
    await expect(page.locator('text=Processo cadastrado com sucesso')).toBeVisible();
    
    // 5. Cadastrar honorário para o processo
    await page.click('text=Financeiro');
    await page.click('text=Honorários');
    await page.click('text=Novo Honorário');
    
    // Preencher formulário de honorário
    await page.click('[data-testid="cliente_id"]');
    await page.click(`text=${nome}`);
    await page.click('[data-testid="processo_id"]');
    await page.click('text=9876543-21.2025.8.26.0100');
    await page.fill('[data-testid="valor"]', '2500');
    await page.fill('[data-testid="data_vencimento"]', '2025-05-20');
    await page.selectOption('[data-testid="status"]', 'Pendente');
    await page.fill('[data-testid="observacoes"]', 'Honorário inicial do processo administrativo');
    await page.click('text=Salvar');
    
    // Verificar se o honorário foi cadastrado
    await expect(page.locator('text=Honorário cadastrado com sucesso')).toBeVisible();
    
    // 6. Agendar atendimento para o cliente
    await page.click('text=Agenda');
    await page.click('text=Novo Evento');
    
    // Preencher formulário de evento
    await page.fill('[data-testid="titulo"]', `Atendimento - ${nome}`);
    await page.fill('[data-testid="descricao"]', 'Primeira reunião para discutir o processo');
    await page.fill('[data-testid="data_hora_inicio"]', '2025-04-25T14:00');
    await page.fill('[data-testid="data_hora_fim"]', '2025-04-25T15:00');
    await page.fill('[data-testid="local"]', 'Escritório - Sala 3');
    await page.click('[data-testid="cliente_id"]');
    await page.click(`text=${nome}`);
    await page.click('[data-testid="processo_id"]');
    await page.click('text=9876543-21.2025.8.26.0100');
    await page.click('text=Salvar');
    
    // Verificar se o evento foi cadastrado
    await expect(page.locator('text=Evento cadastrado com sucesso')).toBeVisible();
    
    // 7. Verificar se o evento aparece no dashboard
    await page.click('text=Dashboard');
    await expect(page.locator(`text=Atendimento - ${nome}`)).toBeVisible();
    
    // 8. Verificar relatórios integrados
    await page.click('text=Relatórios');
    await page.click('text=Processos');
    
    // Selecionar período
    await page.fill('[data-testid="data_inicio"]', '2025-04-01');
    await page.fill('[data-testid="data_fim"]', '2025-05-31');
    await page.click('text=Gerar Relatório');
    
    // Verificar se o relatório contém o processo
    await expect(page.locator('text=9876543-21.2025.8.26.0100')).toBeVisible();
    await expect(page.locator(`text=${nome}`)).toBeVisible();
  });
});

test.describe('Testes de responsividade', () => {
  test('Dashboard responsivo em dispositivos móveis', async ({ page }) => {
    // Login no sistema
    await page.goto('/auth/login');
    await page.fill('[data-testid="email"]', 'admin@prevgestao.com.br');
    await page.fill('[data-testid="password"]', 'senha123');
    await page.click('[data-testid="login-button"]');
    
    // Verificar se o login foi bem-sucedido
    await expect(page).toHaveURL('/dashboard');
    
    // Verificar elementos em viewport mobile
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    
    // Verificar se o menu hamburguer está visível
    await expect(page.locator('[data-testid="menu-mobile"]')).toBeVisible();
    
    // Abrir menu mobile
    await page.click('[data-testid="menu-mobile"]');
    
    // Verificar se os itens do menu estão visíveis
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Clientes')).toBeVisible();
    await expect(page.locator('text=Processos')).toBeVisible();
    
    // Navegar para clientes
    await page.click('text=Clientes');
    await expect(page).toHaveURL('/clientes');
    
    // Verificar se a tabela de clientes é responsiva
    const clientesTable = page.locator('[data-testid="clientes-table"]');
    await expect(clientesTable).toBeVisible();
    
    // Verificar viewport desktop
    await page.setViewportSize({ width: 1280, height: 800 });
    
    // Verificar se o menu lateral está visível
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
    
    // Verificar se o menu hamburguer está oculto
    await expect(page.locator('[data-testid="menu-mobile"]')).not.toBeVisible();
  });
});

test.describe('Testes de desempenho', () => {
  test('Carregamento rápido de páginas principais', async ({ page }) => {
    // Login no sistema
    const startLogin = Date.now();
    await page.goto('/auth/login');
    await page.fill('[data-testid="email"]', 'admin@prevgestao.com.br');
    await page.fill('[data-testid="password"]', 'senha123');
    await page.click('[data-testid="login-button"]');
    
    // Verificar se o login foi bem-sucedido
    await expect(page).toHaveURL('/dashboard');
    const endLogin = Date.now();
    const loginTime = endLogin - startLogin;
    console.log(`Tempo de login: ${loginTime}ms`);
    expect(loginTime).toBeLessThan(3000); // Login deve ser menor que 3 segundos
    
    // Testar carregamento do dashboard
    const startDashboard = Date.now();
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible();
    const endDashboard = Date.now();
    const dashboardTime = endDashboard - startDashboard;
    console.log(`Tempo de carregamento do dashboard: ${dashboardTime}ms`);
    expect(dashboardTime).toBeLessThan(2000); // Dashboard deve carregar em menos de 2 segundos
    
    // Testar carregamento da lista de clientes
    const startClientes = Date.now();
    await page.goto('/clientes');
    await expect(page.locator('[data-testid="clientes-title"]')).toBeVisible();
    const endClientes = Date.now();
    const clientesTime = endClientes - startClientes;
    console.log(`Tempo de carregamento da lista de clientes: ${clientesTime}ms`);
    expect(clientesTime).toBeLessThan(2000); // Lista de clientes deve carregar em menos de 2 segundos
    
    // Testar carregamento da lista de processos
    const startProcessos = Date.now();
    await page.goto('/processos');
    await expect(page.locator('[data-testid="processos-title"]')).toBeVisible();
    const endProcessos = Date.now();
    const processosTime = endProcessos - startProcessos;
    console.log(`Tempo de carregamento da lista de processos: ${processosTime}ms`);
    expect(processosTime).toBeLessThan(2000); // Lista de processos deve carregar em menos de 2 segundos
  });
});
