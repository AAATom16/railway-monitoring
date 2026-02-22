import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { generatePKCE } from "@/lib/pkce";

const RAILWAY_AUTH_URL = "https://backboard.railway.com/oauth/auth";

export async function GET() {
  const clientId = process.env.RAILWAY_CLIENT_ID;
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  if (!clientId) {
    return NextResponse.json(
      { error: "RAILWAY_CLIENT_ID is not configured" },
      { status: 500 }
    );
  }

  const redirectUri = `${baseUrl}/api/auth/callback`;
  const state = randomBytes(32).toString("hex");
  const { codeVerifier, codeChallenge } = generatePKCE();

  console.log("[OAuth Login]", {
    baseUrl,
    redirectUri,
    clientIdPrefix: clientId?.slice(0, 12) + "...",
    hasCodeChallenge: !!codeChallenge,
  });

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "openid email profile offline_access workspace:viewer",
    state,
    prompt: "consent",
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  const authUrl = `${RAILWAY_AUTH_URL}?${params.toString()}`;

  // Safari (and some other browsers) do not save cookies when the response
  // is a redirect (302/307). Return 200 with HTML that redirects after
  // cookies are set, so Safari persists oauth_state and oauth_code_verifier.
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 10,
    path: "/",
  };

  const escapedUrl = authUrl.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  const html = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=${escapedUrl}"><script>window.location.replace(${JSON.stringify(authUrl)});</script></head><body>Redirecting to Railway...</body></html>`;

  const response = new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
  response.cookies.set("oauth_state", state, cookieOptions);
  response.cookies.set("oauth_code_verifier", codeVerifier, cookieOptions);

  return response;
}
