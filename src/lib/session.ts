import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  token?: string;
  refreshToken?: string;
  expiresAt?: number;
}

const sessionOptions = {
  password: process.env.SESSION_SECRET || "min-32-char-secret-for-dev-only!!!!!!!!",
  cookieName: "railway-monitoring-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: "lax" as const,
  },
};

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (!session.token) return null;
  if (session.expiresAt && session.expiresAt < Date.now()) return null;
  return session;
}

export { sessionOptions };
