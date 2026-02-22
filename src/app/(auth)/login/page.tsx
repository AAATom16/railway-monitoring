import { Button } from "@/components/ui/button";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Railway Monitoring</h1>
        <p className="text-muted-foreground mb-6">
          Sign in with your Railway account to view all your services
        </p>
        {params.error && (
          <div className="text-destructive text-sm mb-4 space-y-2">
            <p>Login failed: <code className="bg-muted px-1 rounded">{params.error}</code></p>
            {params.error === "invalid_client" && (
              <p className="text-muted-foreground text-xs max-w-md">
                Railway nepozná client_id. OAuth app musí být v <strong>Workspace → Settings → Developer → New OAuth App</strong> (ne v Account/Tokens).{" "}
                <a href="/api/auth/diagnose" className="underline" target="_blank" rel="noopener">Diagnostika</a>
              </p>
            )}
            <p className="text-muted-foreground text-xs">Server logs: <code>[OAuth]</code></p>
          </div>
        )}
        <Button asChild>
          <a href="/api/auth/login">Sign in with Railway</a>
        </Button>
        <p className="text-muted-foreground text-sm mt-4">
          Problémy s přihlášením?{" "}
          <a href="/api/auth/logout" className="underline hover:text-foreground">
            Zkus odhlásit se a přihlásit znovu
          </a>
        </p>
      </div>
    </div>
  );
}
