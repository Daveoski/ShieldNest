import Link from "next/link";
import { Logo } from "@/components/logo";

const columns = [
  {
    title: "Product",
    links: [
      { href: "/#features", label: "Features" },
      { href: "/#how-it-works", label: "How it works" },
      { href: "/#checker", label: "Check a site" },
      { href: "/#faq", label: "FAQ" },
    ],
  },
  {
    title: "Download",
    links: [
      { href: "/download#android", label: "Android" },
      { href: "/download#windows", label: "Windows" },
      { href: "/download#macos", label: "macOS (soon)" },
      { href: "/download#ios", label: "iPhone (soon)" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/sign-in", label: "Sign in" },
      { href: "/sign-up", label: "Create account" },
      { href: "/account", label: "Your account" },
    ],
  },
  {
    title: "Trust",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "https://shieldnest-api.vercel.app/api/py/docs", label: "Public API" },
      { href: "https://github.com/StevenBlack/hosts", label: "Ad list source" },
      { href: "https://gitlab.com/malware-filter", label: "Malware list source" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-base-200/30">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Blocks ads, trackers, malware and phishing sites on your phone and PC, right on your device.
          </p>
        </div>
        {columns.map((column) => (
          <nav key={column.title} className="flex flex-col gap-2 text-sm">
            <h2 className="mb-1 text-xs font-semibold tracking-wider text-foreground uppercase">{column.title}</h2>
            {column.links.map((link) => (
              <Link key={link.href} href={link.href} className="text-muted-foreground transition-colors hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </nav>
        ))}
      </div>
      <div className="border-t border-border/60">
        <p className="mx-auto max-w-6xl px-4 py-6 text-xs text-muted-foreground">
          © <CopyrightYear /> ShieldNest. Free and privacy-first.
        </p>
      </div>
    </footer>
  );
}

async function CopyrightYear() {
  "use cache";
  return new Date().getFullYear();
}
