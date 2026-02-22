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

  const response = NextResponse.redirect(authUrl);
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 10,
    path: "/",
  };
  response.cookies.set("oauth_state", state, cookieOptions);
  response.cookies.set("oauth_code_verifier", codeVerifier, cookieOptions);

  return response;
}
