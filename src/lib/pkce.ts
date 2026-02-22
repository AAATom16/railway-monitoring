import { createHash, randomBytes } from "crypto";

/**
 * Generate PKCE code_verifier and code_challenge (S256).
 * Railway recommends PKCE for web apps to protect against code interception.
 */
export function generatePKCE(): { codeVerifier: string; codeChallenge: string } {
  const bytesLength = 64;
  const codeVerifier = randomBytes(bytesLength).toString("base64url");

  const codeChallenge = createHash("sha256")
    .update(codeVerifier)
    .digest()
    .toString("base64url");

  return { codeVerifier, codeChallenge };
}
