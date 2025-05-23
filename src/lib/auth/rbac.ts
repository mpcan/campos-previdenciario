import { createClient } from '@supabase/supabase-js';

// Definição de tipos para permissões
export type Permission = 
  | 'clientes:read' 
  | 'clientes:write' 
  | 'processos:read' 
  | 'processos:write'
  | 'atendimentos:read'
  | 'atendimentos:write'
  | 'pericias:read'
  | 'pericias:write'
  | 'documentos:read'
  | 'documentos:write'
  | 'financeiro:read'
  | 'financeiro:write'
  | 'leads:read'
  | 'leads:write'
  | 'campanhas:read'
  | 'campanhas:write'
  | 'relatorios:read'
  | 'usuarios:read'
  | 'usuarios:write';

// Definição de tipos para funções (roles)
export type Role = 'admin' | 'advogado' | 'assistente' | 'financeiro' | 'marketing';

// Mapeamento de funções para permissões
const rolePermissions: Record<Role, Permission[]> = {
  admin: [
    'clientes:read', 'clientes:write',
    'processos:read', 'processos:write',
    'atendimentos:read', 'atendimentos:write',
    'pericias:read', 'pericias:write',
    'documentos:read', 'documentos:write',
    'financeiro:read', 'financeiro:write',
    'leads:read', 'leads:write',
    'campanhas:read', 'campanhas:write',
    'relatorios:read',
    'usuarios:read', 'usuarios:write'
  ],
  advogado: [
    'clientes:read', 'clientes:write',
    'processos:read', 'processos:write',
    'atendimentos:read', 'atendimentos:write',
    'pericias:read', 'pericias:write',
    'documentos:read', 'documentos:write',
    'relatorios:read'
  ],
  assistente: [
    'clientes:read',
    'processos:read',
    'atendimentos:read', 'atendimentos:write',
    'pericias:read',
    'documentos:read', 'documentos:write'
  ],
  financeiro: [
    'clientes:read',
    'processos:read',
    'financeiro:read', 'financeiro:write',
    'relatorios:read'
  ],
  marketing: [
    'leads:read', 'leads:write',
    'campanhas:read', 'campanhas:write',
    'relatorios:read'
  ]
};

// Função para obter as permissões de um usuário
export async function getUserPermissions(userId: string): Promise<Permission[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  // Buscar a função do usuário
  const { data, error } = await supabase
    .from('usuarios')
    .select('role')
    .eq('id', userId)
    .single();
  
  if (error || !data) {
    console.error('Erro ao buscar função do usuário:', error);
    return [];
  }
  
  const userRole = data.role as Role;
  
  // Retornar as permissões associadas à função
  return rolePermissions[userRole] || [];
}

// Função para verificar se um usuário tem uma permissão específica
export async function hasPermission(userId: string, permission: Permission): Promise<boolean> {
  const permissions = await getUserPermissions(userId);
  return permissions.includes(permission);
}

// Função para verificar se um usuário tem várias permissões
export async function hasPermissions(userId: string, requiredPermissions: Permission[]): Promise<boolean> {
  const permissions = await getUserPermissions(userId);
  return requiredPermissions.every(permission => permissions.includes(permission));
}

// Função para atribuir uma função a um usuário
export async function assignRole(userId: string, role: Role): Promise<boolean> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const { error } = await supabase
    .from('usuarios')
    .update({ role })
    .eq('id', userId);
  
  if (error) {
    console.error('Erro ao atribuir função ao usuário:', error);
    return false;
  }
  
  return true;
}

// Função para registrar atividade do usuário
export async function logUserActivity(userId: string, action: string, details: any = {}): Promise<void> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const { error } = await supabase
    .from('logs_atividades')
    .insert({
      usuario_id: userId,
      acao: action,
      detalhes: details,
      ip: '0.0.0.0', // Em produção, usar o IP real
      data_hora: new Date().toISOString()
    });
  
  if (error) {
    console.error('Erro ao registrar atividade do usuário:', error);
  }
}
