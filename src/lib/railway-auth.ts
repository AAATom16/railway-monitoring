import { getSession, type SessionData } from "./session";

const RAILWAY_TOKEN_URL = "https://backboard.railway.com/oauth/token";

export async function getAccessToken(): Promise<string | null> {
  const session = await getSession();
  if (!session?.token) return null;

  if (session.expiresAt && session.expiresAt > Date.now() + 60 * 1000) {
    return session.token;
  }

  if (!session.refreshToken) return null;

  const clientId = process.env.RAILWAY_CLIENT_ID;
  const clientSecret = process.env.RAILWAY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const tokenResponse = await fetch(RAILWAY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: session.refreshToken,
    }).toString(),
  });

  if (!tokenResponse.ok) return session.token;

  const tokens = await tokenResponse.json();
  const expiresAt = Date.now() + (tokens.expires_in || 3600) * 1000;

  const { getIronSession } = await import("iron-session");
  const { cookies } = await import("next/headers");
  const { sessionOptions } = await import("./session");

  const cookieStore = await cookies();
  const refreshedSession = await getIronSession<SessionData>(
    cookieStore,
    sessionOptions
  );
  refreshedSession.token = tokens.access_token;
  refreshedSession.refreshToken = tokens.refresh_token ?? session.refreshToken;
  refreshedSession.expiresAt = expiresAt;
  await refreshedSession.save();

  return tokens.access_token;
}
