"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";

const SEEN_KEY = "shieldnest-tour-seen";
const START_EVENT = "shieldnest:start-tour";

const steps: DriveStep[] = [
  {
    popover: {
      title: "Welcome to ShieldNest 👋",
      description:
        "ShieldNest blocks ads, trackers, malware and phishing sites on your phone and PC. This quick tour shows you around. It takes 30 seconds.",
    },
  },
  {
    element: "#tour-download",
    popover: {
      title: "Download in one tap",
      description:
        "This button picks the right app for your device. On Android or Windows the download starts straight away.",
    },
  },
  {
    element: "#tour-stats",
    popover: {
      title: "Live protection numbers",
      description: "These are the real lists ShieldNest uses right now. They update automatically every 6 hours.",
    },
  },
  {
    element: "#tour-checker",
    popover: {
      title: "Try it yourself",
      description: "Type any website to see whether ShieldNest would block it, and why.",
    },
  },
  {
    element: "#how-it-works",
    popover: {
      title: "How it works",
      description: "Every website lookup is checked on your device, so bad sites never load.",
    },
  },
  {
    element: "#tour-sign-in",
    popover: {
      title: "Your account",
      description: "Sign in with email or Google to save your downloads and setup guides in one place.",
    },
  },
  {
    element: "#tour-restart",
    popover: {
      title: "That's it!",
      description: "You can replay this tour any time from here. Stay safe out there.",
    },
  },
];

function isVisible(selector: string) {
  const el = document.querySelector<HTMLElement>(selector);
  return Boolean(el && el.offsetParent !== null);
}

function startTour() {
  // Elements hidden on this screen (e.g. on phones, or the sign-in link when signed in) get a centred popover instead
  const available = steps.map((s) =>
    typeof s.element === "string" && !isVisible(s.element) ? { popover: s.popover } : s,
  );
  driver({
    steps: available,
    showProgress: true,
    allowClose: true,
    overlayOpacity: 0.7,
    stagePadding: 6,
    stageRadius: 12,
    popoverClass: "shieldnest-tour",
    nextBtnText: "Next →",
    prevBtnText: "← Back",
    doneBtnText: "Done",
    onDestroyed: () => {
      try {
        localStorage.setItem(SEEN_KEY, "1");
      } catch {}
    },
  }).drive();
}

/** Runs the tour once for first-time visitors on the home page; replay via requestTour(). */
export function TourGuide() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    function onStart() {
      if (window.location.pathname !== "/") {
        router.push("/?tour=1");
        return;
      }
      startTour();
    }
    window.addEventListener(START_EVENT, onStart);
    return () => window.removeEventListener(START_EVENT, onStart);
  }, [router]);

  useEffect(() => {
    if (pathname !== "/") return;
    let seen = false;
    try {
      seen = localStorage.getItem(SEEN_KEY) === "1";
    } catch {}
    const requested = new URLSearchParams(window.location.search).has("tour");
    if (seen && !requested) return;
    const timer = window.setTimeout(startTour, requested ? 400 : 1200);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  return null;
}

export function requestTour() {
  window.dispatchEvent(new Event(START_EVENT));
}
