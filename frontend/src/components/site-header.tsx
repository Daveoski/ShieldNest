import Link from "next/link";
import { Menu } from "lucide-react";
import { Logo } from "@/components/logo";
import { SmartDownloadButton } from "@/components/smart-download-button";
import { TourButton } from "@/components/tour-button";
import { UserMenu } from "@/components/user-menu";

export const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#checker", label: "Check a site" },
  { href: "/download", label: "Platforms" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl supports-backdrop-filter:bg-background/50">
      <nav className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4">
        <div className="dropdown lg:hidden">
          <div tabIndex={0} role="button" aria-label="Open menu" className="btn btn-ghost btn-square btn-sm">
            <Menu className="size-5" />
          </div>
          <ul tabIndex={0} className="dropdown-content menu z-50 mt-3 w-56 rounded-box border border-border bg-popover p-2 shadow-xl">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <Logo />

        <ul className="mx-auto hidden gap-7 text-sm text-muted-foreground lg:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="transition-colors hover:text-foreground">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <TourButton id="tour-restart" label="Tour" className="hidden md:inline-flex" />
          <UserMenu />
          <SmartDownloadButton id="tour-download" className="ml-1 shadow-[0_0_24px_-6px_var(--primary)]" />
        </div>
      </nav>
    </header>
  );
}
