"use client";

import { useState, useEffect } from "react";
import { ServiceTable } from "./service-table";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import {
  isNotifyOnFailureEnabled,
  setNotifyOnFailureEnabled,
} from "@/hooks/use-failure-notifications";

export function Dashboard() {
  const [notifyEnabled, setNotifyEnabled] = useState(false);

  useEffect(() => {
    setNotifyEnabled(isNotifyOnFailureEnabled());
  }, []);

  const handleNotifyToggle = async (checked: boolean) => {
    if (checked) {
      const perm = await Notification.requestPermission();
      if (perm === "granted") {
        setNotifyOnFailureEnabled(true);
        setNotifyEnabled(true);
      }
    } else {
      setNotifyOnFailureEnabled(false);
      setNotifyEnabled(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <main className="container mx-auto p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Railway Monitoring</h1>
        <div className="flex items-center gap-4">
          {"Notification" in window && (
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Switch
                checked={notifyEnabled}
                onCheckedChange={handleNotifyToggle}
              />
              <span>Notify on failure</span>
            </label>
          )}
          <Button variant="outline" onClick={handleLogout}>
            Sign out
          </Button>
        </div>
      </header>
      <ServiceTable />
    </main>
  );
}
