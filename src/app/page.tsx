import Link from "next/link";
import {
  ArrowRight,
  Ban,
  Bug,
  Download,
  EyeOff,
  KeyRound,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const features = [
  {
    icon: Ban,
    title: "Ad blocking everywhere",
    description:
      "Stops ads and pop-ups on search engines, websites and in apps before they load, so pages are faster and use less data.",
  },
  {
    icon: Bug,
    title: "Malware & ransomware shield",
    description:
      "Blocks connections to known malware, ransomware and phishing sites, using threat lists that update daily.",
  },
  {
    icon: KeyRound,
    title: "Access guard",
    description:
      "Alerts you to new sign-ins, apps with risky permissions and third parties that try to reach your email or accounts.",
  },
  {
    icon: EyeOff,
    title: "Tracker blocking",
    description:
      "Cuts off hidden trackers that follow you across sites and apps, so less of your data reaches advertisers.",
  },
  {
    icon: Zap,
    title: "Lightweight & fast",
    description:
      "Filtering runs on your device. Your browsing never passes through our servers, and battery use stays low.",
  },
  {
    icon: ShieldCheck,
    title: "One account, every device",
    description:
      "Protect your phone and your PC from one account, and see what was blocked on each device in one place.",
  },
];

const steps = [
  "Download ShieldNest for your device",
  "Turn on protection with one tap",
  "Browse while ads and threats are blocked",
];

const faqs = [
  {
    q: "How does ShieldNest block ads?",
    a: "ShieldNest checks every web address your device asks for against blocklists of ad, tracker and malware domains. Matching requests are blocked before anything downloads. On Android this works through a local VPN that never leaves your phone.",
  },
  {
    q: "Is ShieldNest an antivirus?",
    a: "ShieldNest stops the most common way threats get in: malicious websites and downloads. It blocks known malware, ransomware and phishing domains, and warns you about risky apps. Keep your device's built-in protection on as well, such as Google Play Protect or Windows Security.",
  },
  {
    q: "Does it work on iPhone?",
    a: "Partly. Apple doesn't let apps scan other apps or block ads outside Safari. On iPhone, ShieldNest blocks ads in Safari and filters DNS to block malicious sites.",
  },
  {
    q: "Do you see my browsing history?",
    a: "No. Filtering runs on your device, and we never receive the sites you visit.",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--primary)_18%,transparent),transparent_60%)]" />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 md:grid-cols-2 md:py-28">
          <div>
            <Badge variant="outline" className="mb-5">
              <ShieldCheck />
              For Android, Windows, macOS & iPhone
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              A safe nest for <span className="text-primary">every device</span> you own.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              ShieldNest blocks ads, malware and trackers before they reach your phone or PC,
              and warns you when someone tries to access your accounts.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/download" className={buttonVariants({ size: "lg", className: "h-11 px-5 text-base" })}>
                <Download />
                Download free
              </Link>
              <Link
                href="#features"
                className={buttonVariants({ variant: "outline", size: "lg", className: "h-11 px-5 text-base" })}
              >
                See features
                <ArrowRight />
              </Link>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="mockup-phone border-primary/40">
              <div className="mockup-phone-camera" />
              <div className="mockup-phone-display grid place-content-center bg-base-200 px-6 text-center">
                <div className="mx-auto grid size-20 place-items-center rounded-full bg-primary/15 text-primary">
                  <ShieldCheck className="size-10" />
                </div>
                <p className="mt-4 text-sm text-muted-foreground">Protection is on</p>
                <p className="mt-1 text-xl font-semibold">You&apos;re protected</p>
                <div className="stats stats-vertical mt-6 bg-base-100 shadow">
                  <div className="stat py-3">
                    <div className="stat-title">Ads blocked today</div>
                    <div className="stat-value text-primary">1,284</div>
                  </div>
                  <div className="stat py-3">
                    <div className="stat-title">Threats stopped</div>
                    <div className="stat-value text-error">7</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-20 border-t border-border bg-base-200/40">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to stay safe</h2>
            <p className="mt-4 text-muted-foreground">
              One app that blocks ads and threats and watches who accesses your accounts.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="transition-shadow hover:ring-primary/40">
                <CardHeader>
                  <span className="mb-3 grid size-10 place-items-center rounded-lg bg-primary/15 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <CardTitle className="text-lg">{title}</CardTitle>
                  <CardDescription className="leading-relaxed">{description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20 border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Protected in under a minute</h2>
          <ul className="steps steps-vertical mt-12 w-full sm:steps-horizontal">
            {steps.map((step) => (
              <li key={step} className="step step-primary">
                <span className="px-2 text-sm sm:text-base">{step}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20 border-t border-border bg-base-200/40">
        <div className="mx-auto max-w-3xl px-4 py-20">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">Questions & answers</h2>
          <Card className="mt-10">
            <CardContent>
              <Accordion>
                {faqs.map(({ q, a }) => (
                  <AccordionItem key={q} value={q}>
                    <AccordionTrigger className="text-base">{q}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">{a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to protect your devices?</h2>
          <p className="mt-4 text-muted-foreground">ShieldNest is free to download on every platform.</p>
          <Link href="/download" className={buttonVariants({ size: "lg", className: "mt-8 h-11 px-6 text-base" })}>
            <Download />
            Get ShieldNest
          </Link>
        </div>
      </section>
    </>
  );
}
