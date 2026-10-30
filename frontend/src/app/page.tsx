import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Ban,
  BatteryCharging,
  Bug,
  Check,
  EyeOff,
  Fish,
  Gauge,
  Lock,
  ServerOff,
  ShieldCheck,
  Smartphone,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BlocklistStats } from "@/components/home/blocklist-stats";
import { DomainChecker } from "@/components/home/domain-checker";
import { HowItWorks } from "@/components/home/how-it-works";
import { LiveFeed } from "@/components/home/live-feed";
import { SmartDownloadButton } from "@/components/smart-download-button";
import { TourButton } from "@/components/tour-button";
import { platforms } from "@/lib/platforms";

const features = [
  {
    icon: Ban,
    title: "Ad blocking everywhere",
    description:
      "Stops banner ads, pop-ups and video-ad networks in browsers and apps before they load, so pages are faster and use less data.",
  },
  {
    icon: Bug,
    title: "Malware & ransomware shield",
    description:
      "Blocks connections to domains that spread malware and ransomware, using abuse.ch URLhaus threat data updated daily.",
  },
  {
    icon: Fish,
    title: "Phishing protection",
    description:
      "Blocks fake login pages that try to steal your email and account passwords, so outsiders can't get into your accounts.",
  },
  {
    icon: EyeOff,
    title: "Tracker blocking",
    description:
      "Cuts off hidden trackers that follow you across sites and apps, so far less of your data reaches advertisers.",
  },
  {
    icon: Gauge,
    title: "Faster browsing",
    description:
      "Pages load without the dozens of ad and tracking requests they normally make, which saves time and mobile data.",
  },
  {
    icon: BatteryCharging,
    title: "Light on battery",
    description:
      "Only website lookups pass through ShieldNest, not your actual traffic, so it barely uses any battery or memory.",
  },
];

const blocks = [
  "Banner, pop-up and in-app ads from ad networks",
  "Trackers and analytics that follow you around",
  "Known malware, ransomware and scam domains",
  "Phishing pages that steal passwords",
];

const doesNotBlock = [
  "YouTube video ads (served from the same address as the videos)",
  "Sponsored posts inside Facebook, Instagram or TikTok feeds",
  "Viruses already on your device. Keep your built-in antivirus on",
];

const privacyPoints = [
  { icon: Smartphone, title: "Filtering happens on your device", text: "The websites you visit are checked locally. We never see them." },
  { icon: ServerOff, title: "No browsing logs", text: "There's no ShieldNest server in the middle of your traffic to keep logs." },
  { icon: Lock, title: "Your account stays minimal", text: "If you sign in, we store your name and email, and nothing about your browsing." },
];

const faqs = [
  {
    q: "How does ShieldNest block ads?",
    a: "Every app and website looks up addresses before it loads anything, including the hidden ad and tracker addresses inside pages. ShieldNest checks each lookup against blocklists of more than 100,000 ad, tracker, malware and phishing domains, and refuses the bad ones, so the ad never downloads. On Android this works through a local VPN that never leaves your phone. On Windows it's a small filter on your PC.",
  },
  {
    q: "Does it block ads in real time?",
    a: "Yes. Every lookup is checked the moment it happens, and the \"Recently blocked\" list in the app shows each block live. The blocklist downloads a fresh copy whenever you turn protection on, once a day at most.",
  },
  {
    q: "Will it block YouTube or Facebook ads?",
    a: "Not all of them. YouTube video ads and sponsored posts in social feeds come from the same address as the real content, so no DNS-based blocker can remove them without breaking the app. Banner ads, pop-ups, trackers and malicious sites are blocked.",
  },
  {
    q: "Is ShieldNest an antivirus?",
    a: "ShieldNest stops the most common way threats get in: malicious websites, downloads and phishing links. It doesn't scan files already on your device, so keep your built-in protection on as well, such as Google Play Protect or Windows Security.",
  },
  {
    q: "Is it free?",
    a: "Yes. ShieldNest is free to download and use on Android and Windows.",
  },
  {
    q: "Why does Windows show a SmartScreen warning?",
    a: "ShieldNest is a new app and isn't code-signed yet, so Windows shows a caution screen the first time. Choose More info → Run anyway. It asks for administrator access because changing DNS settings requires it, and it puts your original settings back when you turn it off.",
  },
  {
    q: "Does it work on iPhone or Mac?",
    a: "Both are coming soon. Apple doesn't let apps block ads outside Safari, so the iPhone version will block ads in Safari and filter dangerous sites.",
  },
  {
    q: "Do I need an account?",
    a: "No. Protection works without an account. To connect the app to your account, tap Sign in in the app and approve the code in your browser with Google or email. You never type your password into the app.",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="hero-grid pointer-events-none absolute inset-0 -z-10" />
        <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[36rem] w-[60rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pt-16 pb-20 md:grid-cols-[1.1fr_1fr] md:pt-24 md:pb-28">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Badge variant="outline" className="mb-6 gap-1.5 border-primary/30 bg-primary/10 px-3 py-3 text-primary">
              <span className="size-1.5 animate-pulse rounded-full bg-primary" />
              Now available for Android & Windows
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              The internet, <span className="text-gradient">minus the junk</span>.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              ShieldNest blocks ads, trackers, malware and phishing sites on your phone and PC before they ever load.
              It&apos;s free, private and set up in under a minute.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <SmartDownloadButton className="h-12 px-6 text-base" label="Download free" />
              <TourButton variant="outline" className="h-12 px-5 text-base" />
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {["Free", "No account needed", "No browsing logs"].map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <Check className="size-4 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-center animate-in fade-in zoom-in-95 duration-1000">
            <LiveFeed />
          </div>
        </div>
      </section>

      <Suspense fallback={<div className="h-44 border-y border-border bg-base-200/40" />}>
        <BlocklistStats />
      </Suspense>

      {/* Domain checker */}
      <section id="checker" className="scroll-mt-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-24 md:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold tracking-wider text-primary uppercase">Try it now</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">Is this site safe?</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Type any website to see whether ShieldNest would block it. This uses the exact same live blocklist as
              the apps.
            </p>
          </div>
          <DomainChecker />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-20 border-t border-border bg-base-200/30">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold tracking-wider text-primary uppercase">Features</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              Everything you need to browse safely
            </h2>
            <p className="mt-4 text-muted-foreground">One switch protects every app and browser on your device.</p>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_20px_60px_-30px_var(--primary)]"
              >
                <span className="grid size-11 place-items-center rounded-xl bg-primary/15 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HowItWorks />

      {/* What it blocks */}
      <section className="border-t border-border bg-base-200/30">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold tracking-wider text-primary uppercase">Straight answers</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">What ShieldNest blocks</h2>
            <p className="mt-4 text-muted-foreground">No blocker stops everything. Here&apos;s exactly what to expect.</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-success/30 bg-card p-7">
              <h3 className="flex items-center gap-2 font-semibold text-success">
                <ShieldCheck className="size-5" /> Blocked
              </h3>
              <ul className="mt-5 space-y-3">
                {blocks.map((item) => (
                  <li key={item} className="flex gap-3 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-card p-7">
              <h3 className="flex items-center gap-2 font-semibold text-muted-foreground">
                <X className="size-5" /> Not blocked
              </h3>
              <ul className="mt-5 space-y-3">
                {doesNotBlock.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-muted-foreground">
                    <X className="mt-0.5 size-4 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold tracking-wider text-primary uppercase">Platforms</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Protect every device</h2>
            </div>
            <Link href="/download" className={buttonVariants({ variant: "outline", size: "lg" })}>
              All downloads <ArrowRight />
            </Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {platforms.map(({ id, name, icon: Icon, requirement, download }) => (
              <Link
                key={id}
                href={`/download#${id}`}
                className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                  <Icon className="size-6" />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-2 font-semibold">
                    {name}
                    {!download && <Badge variant="secondary">Soon</Badge>}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">{requirement}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="border-t border-border bg-base-200/30">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-24 md:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="text-sm font-semibold tracking-wider text-primary uppercase">Privacy first</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              A blocker that doesn&apos;t spy on you
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Many free &quot;security&quot; apps sell your browsing data. ShieldNest was built so that it can&apos;t.
            </p>
            <Link href="/privacy" className={buttonVariants({ variant: "link", className: "mt-4 px-0" })}>
              Read the privacy policy <ArrowRight />
            </Link>
          </div>
          <div className="grid gap-4">
            {privacyPoints.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-4 rounded-2xl border border-border bg-card p-5">
                <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20 border-t border-border">
        <div className="mx-auto max-w-3xl px-4 py-24">
          <div className="text-center">
            <p className="text-sm font-semibold tracking-wider text-primary uppercase">FAQ</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Questions & answers</h2>
          </div>
          <Accordion className="mt-10 rounded-2xl border border-border bg-card px-6 py-2">
            {faqs.map(({ q, a }) => (
              <AccordionItem key={q} value={q}>
                <AccordionTrigger className="py-4 text-base">{q}</AccordionTrigger>
                <AccordionContent className="pb-4 leading-relaxed text-muted-foreground">{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-border">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 -bottom-48 -z-10 mx-auto h-96 max-w-3xl rounded-full bg-primary/20 blur-3xl" />
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <ShieldCheck className="mx-auto size-12 text-primary" />
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-balance sm:text-5xl">
            Take back your screen today
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">Free for Android and Windows. Set up in under a minute.</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <SmartDownloadButton className="h-12 px-6 text-base" label="Get ShieldNest free" />
            <Link href="/sign-up" className={buttonVariants({ variant: "outline", size: "lg", className: "h-12 px-6 text-base" })}>
              Create an account
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
