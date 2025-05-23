import { createClient } from '@supabase/supabase-js';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

// Função para gerar segredo para 2FA
export async function generateTwoFactorSecret(userId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  // Gerar um segredo aleatório
  const secret = authenticator.generateSecret();
  
  // Salvar o segredo no banco de dados
  const { error } = await supabase
    .from('usuarios')
    .update({
      two_factor_secret: secret,
      two_factor_enabled: false,
      two_factor_verified: false
    })
    .eq('id', userId);
  
  if (error) {
    throw new Error('Falha ao salvar o segredo 2FA');
  }
  
  return secret;
}

// Função para gerar QR code para 2FA
export async function generateTwoFactorQRCode(userId: string, email: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  // Buscar o segredo do usuário
  const { data, error } = await supabase
    .from('usuarios')
    .select('two_factor_secret')
    .eq('id', userId)
    .single();
  
  if (error || !data.two_factor_secret) {
    throw new Error('Segredo 2FA não encontrado');
  }
  
  // Gerar o URI para o QR code
  const appName = 'PrevGestão';
  const otpauth = authenticator.keyuri(email, appName, data.two_factor_secret);
  
  // Gerar o QR code como uma string de dados URL
  const qrCodeDataUrl = await QRCode.toDataURL(otpauth);
  
  return {
    qrCodeDataUrl,
    secret: data.two_factor_secret
  };
}

// Função para verificar código 2FA
export async function verifyTwoFactorCode(userId: string, token: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  // Buscar o segredo do usuário
  const { data, error } = await supabase
    .from('usuarios')
    .select('two_factor_secret')
    .eq('id', userId)
    .single();
  
  if (error || !data.two_factor_secret) {
    throw new Error('Segredo 2FA não encontrado');
  }
  
  // Verificar o token
  const isValid = authenticator.verify({
    token,
    secret: data.two_factor_secret
  });
  
  if (isValid) {
    // Atualizar o status de verificação 2FA
    await supabase
      .from('usuarios')
      .update({
        two_factor_enabled: true,
        two_factor_verified: true
      })
      .eq('id', userId);
  }
  
  return isValid;
}

// Função para marcar a sessão atual como verificada com 2FA
export async function markSessionAs2FAVerified(userId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const { error } = await supabase
    .from('usuarios')
    .update({
      two_factor_verified: true
    })
    .eq('id', userId);
  
  if (error) {
    throw new Error('Falha ao atualizar status de verificação 2FA');
  }
  
  return true;
}

// Função para desativar 2FA
export async function disableTwoFactor(userId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const { error } = await supabase
    .from('usuarios')
    .update({
      two_factor_secret: null,
      two_factor_enabled: false,
      two_factor_verified: false
    })
    .eq('id', userId);
  
  if (error) {
    throw new Error('Falha ao desativar 2FA');
  }
  
  return true;
}
