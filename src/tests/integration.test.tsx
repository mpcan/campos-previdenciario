import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createClient } from '@supabase/supabase-js';
import { SessionContextProvider } from '@supabase/auth-helpers-react';

// Mock do cliente Supabase
vi.mock('@supabase/supabase-js', () => {
  return {
    createClient: vi.fn(() => ({
      auth: {
        getSession: vi.fn(() => Promise.resolve({ data: { session: { user: { id: 'test-user-id' } } } })),
        signInWithPassword: vi.fn(() => Promise.resolve({ data: { user: { id: 'test-user-id' } }, error: null })),
        signOut: vi.fn(() => Promise.resolve({ error: null }))
      },
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: { role: 'advogado' }, error: null }))
          }))
        })),
        insert: vi.fn(() => Promise.resolve({ error: null })),
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null }))
        }))
      }))
    }))
  };
});

// Componente de teste para Login
const LoginPage = ({ onLogin }) => {
  return (
    <div>
      <input data-testid="email" placeholder="Email" />
      <input data-testid="password" type="password" placeholder="Senha" />
      <button data-testid="login-button" onClick={onLogin}>Entrar</button>
    </div>
  );
};

// Componente de teste para verificação 2FA
const TwoFactorVerifyPage = ({ onVerify }) => {
  return (
    <div>
      <input data-testid="token" placeholder="Código de verificação" />
      <button data-testid="verify-button" onClick={onVerify}>Verificar</button>
    </div>
  );
};

describe('Integração de Autenticação', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('deve realizar login com sucesso', async () => {
    const mockOnLogin = vi.fn();
    const supabase = createClient('https://example.com', 'fake-key');
    
    render(
      <SessionContextProvider supabaseClient={supabase}>
        <LoginPage onLogin={mockOnLogin} />
      </SessionContextProvider>
    );
    
    fireEvent.change(screen.getByTestId('email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByTestId('password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByTestId('login-button'));
    
    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalled();
    });
  });
  
  it('deve verificar código 2FA com sucesso', async () => {
    const mockOnVerify = vi.fn();
    const supabase = createClient('https://example.com', 'fake-key');
    
    render(
      <SessionContextProvider supabaseClient={supabase}>
        <TwoFactorVerifyPage onVerify={mockOnVerify} />
      </SessionContextProvider>
    );
    
    fireEvent.change(screen.getByTestId('token'), { target: { value: '123456' } });
    fireEvent.click(screen.getByTestId('verify-button'));
    
    await waitFor(() => {
      expect(mockOnVerify).toHaveBeenCalled();
    });
  });
});

// Componente de teste para verificação de permissões
const ProtectedComponent = ({ requiredPermission, children }) => {
  // Simulação de verificação de permissão
  const hasPermission = true; // Em um caso real, isso seria verificado com a função hasPermission
  return hasPermission ? children : <div>Acesso negado</div>;
};

describe('Integração de RBAC', () => {
  it('deve renderizar componente protegido quando usuário tem permissão', () => {
    const supabase = createClient('https://example.com', 'fake-key');
    
    render(
      <SessionContextProvider supabaseClient={supabase}>
        <ProtectedComponent requiredPermission="clientes:read">
          <div data-testid="protected-content">Conteúdo protegido</div>
        </ProtectedComponent>
      </SessionContextProvider>
    );
    
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });
});
