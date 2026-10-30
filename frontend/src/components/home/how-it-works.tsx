import { ArrowRight, Ban, Cloud, Globe, ShieldCheck, Smartphone } from "lucide-react";

const steps = [
  {
    icon: Smartphone,
    title: "Your device asks for a site",
    text: "Every app and browser looks up a website's address before loading it, including the hidden ad and tracker addresses inside pages.",
  },
  {
    icon: ShieldCheck,
    title: "ShieldNest checks it instantly",
    text: "The lookup is checked against 100,000+ known bad domains right on your device. Nothing is sent to us.",
  },
  {
    icon: Cloud,
    title: "Safe lookups go through",
    text: "Allowed sites are resolved by Cloudflare's malware-blocking DNS (1.1.1.2), a second layer of protection.",
  },
];

/** Static diagram: device → ShieldNest filter → blocked or allowed → website. */
export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold tracking-wider text-primary uppercase">How it works</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Bad sites are stopped before they load
          </h2>
          <p className="mt-4 text-muted-foreground">
            ShieldNest works at the DNS level, the address book of the internet. If an address is dangerous or an
            ad, your device never connects to it.
          </p>
        </div>

        {/* Flow diagram */}
        <div className="mt-14 rounded-2xl border border-border bg-card/60 p-6 sm:p-10">
          <div className="grid items-center gap-4 md:grid-cols-[1fr_auto_1.2fr_auto_1fr]">
            <Node icon={Smartphone} label="Your phone or PC" sub="asks for ads.tracker.com" />
            <Arrow />
            <div className="rounded-xl border border-primary/40 bg-primary/10 p-5 text-center shadow-[0_0_60px_-20px_var(--primary)]">
              <ShieldCheck className="mx-auto size-8 text-primary" />
              <p className="mt-2 font-semibold">ShieldNest filter</p>
              <p className="text-xs text-muted-foreground">on your device · under 1 ms</p>
            </div>
            <Arrow />
            <div className="grid gap-3">
              <div className="flex items-center gap-3 rounded-xl border border-error/30 bg-error/10 px-4 py-3">
                <Ban className="size-5 shrink-0 text-error" />
                <div>
                  <p className="text-sm font-medium">Blocked</p>
                  <p className="text-xs text-muted-foreground">ad, tracker, malware, phishing</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/10 px-4 py-3">
                <Globe className="size-5 shrink-0 text-success" />
                <div>
                  <p className="text-sm font-medium">Allowed</p>
                  <p className="text-xs text-muted-foreground">via Cloudflare 1.1.1.2 → website</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ol className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-8 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <Icon className="size-5 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Node({ icon: Icon, label, sub }: { icon: typeof Smartphone; label: string; sub: string }) {
  return (
    <div className="rounded-xl border border-border bg-base-200 p-5 text-center">
      <Icon className="mx-auto size-7 text-foreground" />
      <p className="mt-2 font-semibold">{label}</p>
      <p className="font-mono text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function Arrow() {
  return (
    <ArrowRight aria-hidden className="mx-auto size-6 rotate-90 text-muted-foreground md:rotate-0" />
  );
}
