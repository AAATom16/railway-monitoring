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
          <p className="text-destructive text-sm mb-4">
            Login failed. Please try again.
          </p>
        )}
        <Button asChild>
          <a href="/api/auth/login">Sign in with Railway</a>
        </Button>
      </div>
    </div>
  );
}
