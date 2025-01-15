import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 需要认证的路由
  const protectedRoutes = ['/chat', '/profile', '/protected'];
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  );

  // 认证路由（登录/注册）
  const authRoutes = ['/auth/login', '/auth/register'];
  const isAuthRoute = authRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  );

  // 如果是受保护的路由且没有session，重定向到登录页
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/auth/login', req.url);
    redirectUrl.searchParams.set('redirect', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 如果已登录用户访问认证页面，重定向到聊天页面
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/chat', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    '/protected/:path*',
    '/chat/:path*',
    '/profile/:path*',
    '/auth/:path*'
  ]
}; 