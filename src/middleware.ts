import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Se não houver sessão e a rota não for pública, redirecionar para login
  if (!session && !req.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // Se houver sessão e o usuário estiver tentando acessar páginas de autenticação
  if (session && req.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Verificar se o usuário tem 2FA ativado e se já completou a verificação
  if (session && !req.nextUrl.pathname.startsWith('/auth/2fa') && req.nextUrl.pathname !== '/auth/2fa/verify') {
    const { data: user } = await supabase
      .from('usuarios')
      .select('two_factor_enabled, two_factor_verified')
      .eq('id', session.user.id)
      .single();

    // Se 2FA estiver ativado mas não verificado para esta sessão, redirecionar para verificação
    if (user?.two_factor_enabled && !user?.two_factor_verified) {
      return NextResponse.redirect(new URL('/auth/2fa/verify', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth/callback|public).*)',
  ],
};
