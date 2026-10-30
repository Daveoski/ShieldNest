"use client";

import { Badge } from "@/components/ui/badge";
import { useDevicePlatform } from "@/lib/device";
import type { Platform } from "@/lib/platforms";

/** Marks the card that matches the visitor's device; renders nothing on the server. */
export function RecommendedBadge({ platform }: { platform: Platform["id"] }) {
  const detected = useDevicePlatform();
  if (detected !== platform) return null;
  return <Badge>Your device</Badge>;
}
