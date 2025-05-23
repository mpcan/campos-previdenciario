import { createClient } from '@supabase/supabase-js';

// Estas variáveis de ambiente serão configuradas posteriormente
// Para desenvolvimento local, usaremos valores de placeholder
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Criação do cliente Supabase para uso no lado do cliente (browser)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
