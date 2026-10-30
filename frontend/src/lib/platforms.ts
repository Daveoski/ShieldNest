import type { LucideIcon } from "lucide-react";
import { Laptop, Monitor, Smartphone, TabletSmartphone } from "lucide-react";

export const APP_VERSION = "0.2.0";

export type Platform = {
  id: "android" | "windows" | "macos" | "ios";
  name: string;
  icon: LucideIcon;
  requirement: string;
  /** Download details; null until a build is published (files come from scripts/publish-downloads.ps1) */
  download: { href: string; fileName: string; size: string } | null;
  features: string[];
  installSteps?: string[];
};

export const platforms: Platform[] = [
  {
    id: "android",
    name: "Android",
    icon: Smartphone,
    requirement: "Android 8.0 or later",
    download: {
      href: `/downloads/ShieldNest-${APP_VERSION}.apk`,
      fileName: `ShieldNest-${APP_VERSION}.apk`,
      size: "6.2 MB",
    },
    features: [
      "Blocks ads and trackers in every app and browser",
      "Blocks malware and phishing sites",
      "Shows what was blocked, live",
      "Optional sign-in with Google or email",
    ],
    installSteps: [
      "Open the downloaded file.",
      "If asked, allow your browser to install unknown apps.",
      "Open ShieldNest, tap the shield and accept the connection request.",
    ],
  },
  {
    id: "windows",
    name: "Windows",
    icon: Monitor,
    requirement: "Windows 10 or 11 (64-bit)",
    download: {
      href: `/downloads/ShieldNest-${APP_VERSION}-windows.exe`,
      fileName: `ShieldNest-${APP_VERSION}-windows.exe`,
      size: "11.6 MB",
    },
    features: [
      "Blocks ads and trackers across the whole PC",
      "Blocks malware, ransomware and phishing domains",
      "Puts your network settings back when turned off",
      "Optional sign-in with Google or email",
    ],
    installSteps: [
      "Open the downloaded file. No installation is needed.",
      "If Windows SmartScreen appears, choose More info → Run anyway.",
      "Click Yes to allow administrator access, then click the shield.",
    ],
  },
  {
    id: "macos",
    name: "macOS",
    icon: Laptop,
    requirement: "macOS 13 Ventura or later",
    download: null,
    features: [
      "Blocks ads and trackers across the whole Mac",
      "Blocks malware and phishing domains",
    ],
  },
  {
    id: "ios",
    name: "iPhone & iPad",
    icon: TabletSmartphone,
    requirement: "iOS 16 or later",
    download: null,
    features: [
      "Blocks ads in Safari",
      "Filters DNS to block malicious sites",
    ],
  },
];
