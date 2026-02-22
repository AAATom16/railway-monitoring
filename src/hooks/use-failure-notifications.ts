"use client";

import { useEffect, useRef } from "react";
import type { ServiceRow } from "@/lib/railway/types";
import type { Health } from "@/lib/railway/types";

const STORAGE_KEY = "railway-monitoring-notify-on-failure";
const RATE_LIMIT_MS = 5 * 60 * 1000; // 5 minutes per service

const FAILURE_HEALTH: Health[] = ["DOWN"];

function getKey(row: ServiceRow): string {
  return `${row.serviceId}-${row.environmentId}`;
}

export function isNotifyOnFailureEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "true";
}

export function setNotifyOnFailureEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  if (enabled) {
    localStorage.setItem(STORAGE_KEY, "true");
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function useFailureNotifications(data: ServiceRow[] | undefined) {
  const previousRef = useRef<Map<string, Health>>(new Map());
  const lastNotifiedRef = useRef<Map<string, number>>(new Map());
  const isFirstLoadRef = useRef(true);

  useEffect(() => {
    if (!data || data.length === 0) return;
    if (!isNotifyOnFailureEnabled()) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;

    const now = Date.now();
    const previous = previousRef.current;
    const lastNotified = lastNotifiedRef.current;

    for (const row of data) {
      const key = getKey(row);
      const prevHealth = previous.get(key);
      const currentHealth = row.health;

      previous.set(key, currentHealth);

      if (isFirstLoadRef.current) continue;

      if (!FAILURE_HEALTH.includes(currentHealth)) continue;
      if (prevHealth === undefined) continue;
      if (prevHealth === "DOWN") continue;

      const last = lastNotified.get(key) ?? 0;
      if (now - last < RATE_LIMIT_MS) continue;

      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        try {
          new Notification("Build failed", {
            body: `${row.serviceName} in ${row.projectName} (${row.environmentName})`,
            tag: key,
          });
          lastNotified.set(key, now);
        } catch {
          // ignore
        }
      }
    }

    isFirstLoadRef.current = false;
  }, [data]);
}
