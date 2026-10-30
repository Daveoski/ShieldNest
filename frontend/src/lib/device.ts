"use client";

import { useSyncExternalStore } from "react";
import type { Platform } from "@/lib/platforms";

function detectPlatform(): Platform["id"] | null {
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return "android";
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  if (/windows/i.test(ua)) return "windows";
  if (/macintosh|mac os x/i.test(ua)) return "macos";
  return null;
}

const subscribe = () => () => {};

/** The visitor's platform, or null on the server and for unknown devices. */
export function useDevicePlatform(): Platform["id"] | null {
  return useSyncExternalStore(subscribe, detectPlatform, () => null);
}
