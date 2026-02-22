"use client";

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "railway-monitoring-pinned-projects";

function loadPinned(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function savePinned(pinned: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...pinned]));
  } catch {
    // ignore
  }
}

export function usePinnedProjects() {
  const [pinned, setPinned] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setPinned(loadPinned());
  }, []);

  const togglePin = useCallback((projectId: string) => {
    setPinned((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      savePinned(next);
      return next;
    });
  }, []);

  const isPinned = useCallback(
    (projectId: string) => pinned.has(projectId),
    [pinned]
  );

  return { pinned, togglePin, isPinned };
}
