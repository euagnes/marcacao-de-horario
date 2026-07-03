import { NextResponse, type NextRequest } from "next/server";
import {
  verificarToken,
  verificarTokenUsuario,
  ADMIN_COOKIE,
  USUARIO_COOKIE,
} from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ---- Área ADMIN ----
  const ehAdminProtegida =
    (pathname.startsWith("/admin") && pathname !== "/admin/login") ||
    (pathname.startsWith("/api/admin/") &&
      pathname !== "/api/admin/login" &&
      pathname !== "/api/admin/logout");

  if (ehAdminProtegida) {
    const ok = await verificarToken(req.cookies.get(ADMIN_COOKIE)?.value);
    if (ok) return NextResponse.next();
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  // ---- Área do USUÁRIO (login obrigatório p/ agendar) ----
  const ehUsuarioProtegida =
    pathname.startsWith("/agendar") || pathname.startsWith("/minha-conta");

  if (ehUsuarioProtegida) {
    const ok = await verificarTokenUsuario(req.cookies.get(USUARIO_COOKIE)?.value);
    if (ok) return NextResponse.next();
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/agendar/:path*",
    "/minha-conta/:path*",
  ],
};
