"use client";

import { useSyncExternalStore } from "react";
import { Badge } from "@/components/ui/badge";
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

/** Marks the card that matches the visitor's device; renders nothing on the server. */
export function RecommendedBadge({ platform }: { platform: Platform["id"] }) {
  const detected = useSyncExternalStore(subscribe, detectPlatform, () => null);
  if (detected !== platform) return null;
  return <Badge>Your device</Badge>;
}
