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
          <div className="text-destructive text-sm mb-4 space-y-1">
            <p>Login failed: <code className="bg-muted px-1 rounded">{params.error}</code></p>
            <p className="text-muted-foreground text-xs">Check server logs for [OAuth] debug output.</p>
          </div>
        )}
        <Button asChild>
          <a href="/api/auth/login">Sign in with Railway</a>
        </Button>
      </div>
    </div>
  );
}
