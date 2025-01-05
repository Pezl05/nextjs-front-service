import { decrypt } from "./auth";
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  
  if (request.nextUrl.pathname.startsWith('/login')){
    const res = NextResponse.next();
    res.cookies.set('jwt', '', {
      expires: new Date(0),
      path: '/', 
    });
    return res;
  }

  let cookie = request.cookies.get('jwt')
  if (!cookie?.value) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = await decrypt(cookie.value);
  if (!payload){
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (request.nextUrl.pathname.startsWith('/user')) {
    if ( payload.role !== 'admin' ){
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next();
}
 
// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/',
    '/login',
    '/user/:path*',
    '/project/:path*',
  ] 
}