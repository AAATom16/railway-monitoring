"use client";

import { ServiceTable } from "./service-table";
import { Button } from "./ui/button";

export function Dashboard() {
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <main className="container mx-auto p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Railway Monitoring</h1>
        <Button variant="outline" onClick={handleLogout}>
          Sign out
        </Button>
      </header>
      <ServiceTable />
    </main>
  );
}
