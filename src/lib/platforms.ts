import type { LucideIcon } from "lucide-react";
import { Laptop, Monitor, Smartphone, TabletSmartphone } from "lucide-react";

export type Platform = {
  id: string;
  name: string;
  icon: LucideIcon;
  requirement: string;
  /** Download URL; null until a build is published */
  href: string | null;
  features: string[];
};

export const platforms: Platform[] = [
  {
    id: "android",
    name: "Android",
    icon: Smartphone,
    requirement: "Android 8.0 or later",
    href: null,
    features: [
      "Blocks ads in every app and browser",
      "Blocks malware and phishing sites",
      "Shows which apps track you",
    ],
  },
  {
    id: "windows",
    name: "Windows",
    icon: Monitor,
    requirement: "Windows 10 or 11 (64-bit)",
    href: null,
    features: [
      "Blocks ads and trackers across the whole PC",
      "Blocks malware and ransomware domains",
      "Alerts you to new sign-ins and suspicious apps",
    ],
  },
  {
    id: "macos",
    name: "macOS",
    icon: Laptop,
    requirement: "macOS 13 Ventura or later",
    href: null,
    features: [
      "Blocks ads and trackers across the whole Mac",
      "Blocks malware and phishing domains",
      "Alerts you to new sign-ins and suspicious apps",
    ],
  },
  {
    id: "ios",
    name: "iPhone & iPad",
    icon: TabletSmartphone,
    requirement: "iOS 16 or later",
    href: null,
    features: [
      "Blocks ads in Safari",
      "Filters DNS to block malicious sites",
      "Shows privacy tips for your accounts",
    ],
  },
];
