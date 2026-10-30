import { Bug, Fish, Megaphone, ShieldCheck } from "lucide-react";
import { getBlocklistStats } from "@/lib/api";

const fallback = { categories: { ads: 76_000, malware: 1_800, phishing: 24_000 }, total: 100_000 };

export async function BlocklistStats() {
  const live = await getBlocklistStats();
  const stats = live ?? fallback;
  const n = (value: number) => (live ? value.toLocaleString("en-US") : `${Math.floor(value / 1000)}k+`);

  const items = [
    { icon: ShieldCheck, label: "Dangerous & unwanted domains", value: n(stats.total), accent: "text-primary" },
    { icon: Megaphone, label: "Ad & tracker domains", value: n(stats.categories.ads), accent: "text-info" },
    { icon: Fish, label: "Phishing domains", value: n(stats.categories.phishing), accent: "text-warning" },
    { icon: Bug, label: "Malware & ransomware domains", value: n(stats.categories.malware), accent: "text-error" },
  ];

  return (
    <section id="tour-stats" aria-label="Blocklist size" className="relative border-y border-border bg-base-200/40">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px overflow-hidden px-4 py-10 md:grid-cols-4">
        {items.map(({ icon: Icon, label, value, accent }) => (
          <div key={label} className="flex flex-col items-center gap-1 px-2 py-4 text-center">
            <Icon className={`mb-1 size-5 ${accent}`} />
            <span className="text-2xl font-bold tracking-tight tabular-nums sm:text-3xl">{value}</span>
            <span className="text-xs text-muted-foreground sm:text-sm">{label}</span>
          </div>
        ))}
      </div>
      <p className="pb-6 text-center text-xs text-muted-foreground">
        {live ? "Live numbers from the ShieldNest blocklist · refreshed every 6 hours" : "Approximate list sizes"}
      </p>
    </section>
  );
}
