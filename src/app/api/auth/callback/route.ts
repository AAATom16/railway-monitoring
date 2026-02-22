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
  const errorDescription = searchParams.get("error_description");

  console.log("[OAuth Callback]", {
    hasCode: !!code,
    hasState: !!state,
    error: error ?? null,
    errorDescription: errorDescription ?? null,
    redirectUri: request.url.split("?")[0],
  });

  if (error) {
    console.error("[OAuth Callback] Railway returned error:", error, errorDescription);
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
    const errorBody = await tokenResponse.text();
    console.error("[OAuth Token Exchange] Failed:", {
      status: tokenResponse.status,
      statusText: tokenResponse.statusText,
      body: errorBody,
      redirectUri,
      hasCodeVerifier: !!codeVerifier,
    });
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

  // Safari does not save cookies on redirect responses. Return 200 with
  // HTML that redirects after a short delay so the session cookie persists.
  const homeUrl = new URL("/", baseUrl).toString();
  const html = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=${homeUrl}"><script>window.location.replace(${JSON.stringify(homeUrl)});</script></head><body>Signing you in...</body></html>`;

  const response = new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    },
  });
  // Clear OAuth flow cookies
  response.cookies.set("oauth_state", "", { maxAge: 0, path: "/" });
  response.cookies.set("oauth_code_verifier", "", { maxAge: 0, path: "/" });

  return response;
</think>
Zjišťuji, jak iron-session funguje s Next.js:
<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
WebSearch
