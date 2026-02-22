import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "@/lib/session";

const RAILWAY_TOKEN_URL = "https://backboard.railway.com/oauth/token";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/login?error=missing_params", request.url)
    );
  }

  const storedState = request.cookies.get("oauth_state")?.value;
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(
      new URL("/login?error=invalid_state", request.url)
    );
  }

  const clientId = process.env.RAILWAY_CLIENT_ID;
  const clientSecret = process.env.RAILWAY_CLIENT_SECRET;
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL("/login?error=server_config", request.url)
    );
  }

  const redirectUri = `${baseUrl}/api/auth/callback`;
  const codeVerifier = request.cookies.get("oauth_code_verifier")?.value;

  const tokenParams: Record<string, string> = {
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  };
  if (codeVerifier) {
    tokenParams.code_verifier = codeVerifier;
  }

  const tokenResponse = await fetch(RAILWAY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams(tokenParams).toString(),
  });

  if (!tokenResponse.ok) {
    console.error("Token exchange failed:", tokenResponse.status);
    return NextResponse.redirect(
      new URL("/login?error=token_exchange", request.url)
    );
  }

  const tokens = await tokenResponse.json();
  const expiresAt = Date.now() + (tokens.expires_in || 3600) * 1000;

  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  session.token = tokens.access_token;
  session.refreshToken = tokens.refresh_token;
  session.expiresAt = expiresAt;
  await session.save();

  const response = NextResponse.redirect(new URL("/", baseUrl));
  response.cookies.set("oauth_state", "", { maxAge: 0, path: "/" });
  response.cookies.set("oauth_code_verifier", "", { maxAge: 0, path: "/" });

  return response;
}
