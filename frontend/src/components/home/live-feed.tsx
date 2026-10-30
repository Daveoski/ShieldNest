"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

// Real domains from the ShieldNest blocklist, shown as a looping preview of the app screen
const sample = [
  { domain: "doubleclick.net", kind: "Ad" },
  { domain: "googlesyndication.com", kind: "Ad" },
  { domain: "adnxs.com", kind: "Tracker" },
  { domain: "scorecardresearch.com", kind: "Tracker" },
  { domain: "taboola.com", kind: "Ad" },
  { domain: "criteo.com", kind: "Tracker" },
  { domain: "outbrain.com", kind: "Ad" },
  { domain: "moatads.com", kind: "Tracker" },
];

const kindColor: Record<string, string> = {
  Ad: "bg-info/15 text-info",
  Tracker: "bg-warning/15 text-warning",
};

export function LiveFeed() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 1600);
    return () => window.clearInterval(id);
  }, []);

  const visible = Array.from({ length: 4 }, (_, i) => sample[(tick + sample.length - i) % sample.length]);

  return (
    <div className="mockup-phone border-primary/30 shadow-[0_0_80px_-20px_var(--primary)]">
      <div className="mockup-phone-camera" />
      <div className="mockup-phone-display flex flex-col bg-base-200 px-5 pt-14 pb-6">
        <div className="relative mx-auto grid size-24 place-items-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-primary/20 [animation-duration:2.4s]" />
          <span className="relative grid size-24 place-items-center rounded-full bg-primary text-primary-foreground">
            <ShieldCheck className="size-11" />
          </span>
        </div>
        <p className="mt-4 text-center text-lg font-semibold">You&apos;re protected</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-base-100 p-3">
            <p className="text-[10px] text-muted-foreground">Blocked</p>
            <p className="text-xl font-bold text-primary tabular-nums">{(1284 + tick).toLocaleString("en-US")}</p>
          </div>
          <div className="rounded-xl bg-base-100 p-3">
            <p className="text-[10px] text-muted-foreground">On list</p>
            <p className="text-xl font-bold text-primary">102k</p>
          </div>
        </div>
        <p className="mt-4 mb-2 text-[11px] font-medium text-muted-foreground">Recently blocked</p>
        <ul className="space-y-1.5">
          {visible.map((item, i) => (
            <li
              key={`${tick}-${i}`}
              className={`flex items-center justify-between rounded-lg bg-base-100 px-3 py-2 text-xs ${
                i === 0 ? "animate-in fade-in slide-in-from-top-2 duration-500" : ""
              }`}
              style={{ opacity: 1 - i * 0.18 }}
            >
              <span className="truncate font-mono">{item.domain}</span>
              <span className={`ml-2 shrink-0 rounded px-1.5 py-0.5 text-[10px] ${kindColor[item.kind]}`}>{item.kind}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
