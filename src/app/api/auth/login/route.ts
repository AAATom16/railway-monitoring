import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

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

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "openid email profile offline_access workspace:viewer",
    state,
    prompt: "consent",
  });

  const authUrl = `${RAILWAY_AUTH_URL}?${params.toString()}`;

  const response = NextResponse.redirect(authUrl);
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10,
    path: "/",
  });

  return response;
}
