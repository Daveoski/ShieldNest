"use client";

import Link from "next/link";
import { Download } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDevicePlatform } from "@/lib/device";
import { platforms } from "@/lib/platforms";

/**
 * Downloads the right app straight away on Android and Windows;
 * everywhere else (and before the device is known) it opens the download page.
 */
export function SmartDownloadButton({
  className,
  size = "lg",
  label,
  id,
}: {
  className?: string;
  size?: "default" | "lg";
  label?: string;
  id?: string;
}) {
  const device = useDevicePlatform();
  const platform = platforms.find((p) => p.id === device && p.download);
  const classes = cn(buttonVariants({ size }), className);

  if (platform?.download) {
    return (
      <a id={id} href={platform.download.href} download={platform.download.fileName} className={classes}>
        <Download />
        {label ?? (
          <span>
            Download<span className="hidden sm:inline"> for {platform.name}</span>
          </span>
        )}
      </a>
    );
  }

  return (
    <Link id={id} href="/download" className={classes}>
      <Download />
      {label ?? "Download"}
    </Link>
  );
}
