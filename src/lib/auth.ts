import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "ceu_admin_session";
const USER_COOKIE = "ceu_user_session";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "dev-secret-troque-em-producao"
);

export async function criarSessao() {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export function encerrarSessao() {
  cookies().delete(COOKIE_NAME);
}

/** Lê o cookie do header (server components / route handlers). */
export async function sessaoValida(): Promise<boolean> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

/** Verifica um token recebido diretamente (usado no middleware Edge). */
export async function verificarToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export const ADMIN_COOKIE = COOKIE_NAME;

// ---------------------------------------------------------------------------
// Sessão de USUÁRIO (clientes com conta aprovada)
// ---------------------------------------------------------------------------
export async function criarSessaoUsuario(userId: number, nome: string) {
  const token = await new SignJWT({ role: "user", uid: userId, nome })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);

  cookies().set(USER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function encerrarSessaoUsuario() {
  cookies().delete(USER_COOKIE);
}

/** Retorna { uid, nome } do usuário logado, ou null. */
export async function usuarioLogado(): Promise<{ uid: number; nome: string } | null> {
  const token = cookies().get(USER_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== "user") return null;
    return { uid: Number(payload.uid), nome: String(payload.nome) };
  } catch {
    return null;
  }
}

/** Verifica um token de usuário diretamente (middleware Edge). */
export async function verificarTokenUsuario(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.role === "user";
  } catch {
    return false;
  }
}

export const USUARIO_COOKIE = USER_COOKIE;
