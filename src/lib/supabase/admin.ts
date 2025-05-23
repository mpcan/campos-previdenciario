import { createClient } from '@supabase/supabase-js';

// Estas variáveis de ambiente serão configuradas posteriormente em um arquivo .env.local
// Para desenvolvimento local, usaremos valores de placeholder
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key';

// Criação do cliente Supabase para uso no lado do servidor
// Usa a chave de serviço que tem permissões elevadas e deve ser mantida segura
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
