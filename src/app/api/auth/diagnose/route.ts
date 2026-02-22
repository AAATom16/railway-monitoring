import { NextResponse } from "next/server";

/**
 * Diagnostický endpoint – ověří, zda Railway pozná náš client_id.
 * Zavolá auth URL a vrátí chybovou odpověď (400) pro analýzu.
 */
export async function GET() {
  const clientId = process.env.RAILWAY_CLIENT_ID;
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  if (!clientId) {
    return NextResponse.json({
      error: "RAILWAY_CLIENT_ID is not configured",
    }, { status: 500 });
  }

  const redirectUri = `${baseUrl}/api/auth/callback`;
  const authUrl = new URL("https://backboard.railway.com/oauth/auth");
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("state", "diagnose");

  const res = await fetch(authUrl.toString(), { redirect: "manual" });

  // Očekáváme 400 s JSON tělem
  const body = await res.text();
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(body);
  } catch {
    parsed = body;
  }

  return NextResponse.json({
    status: res.status,
    statusText: res.statusText,
    url: authUrl.toString(),
    redirectUri,
    clientIdPrefix: clientId.slice(0, 16) + "...",
    response: parsed,
    hint: res.status === 400
      ? "invalid_client = Railway nepozná tento client_id. OAuth app musí být vytvořená v Workspace → Settings → Developer → New OAuth App (ne v Account)."
      : res.status === 302
      ? "Redirect = client_id OK, flow by měl fungovat"
      : null,
  });
}
