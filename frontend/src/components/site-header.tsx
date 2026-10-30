import Link from "next/link";
import { Download } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/logo";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <nav className="navbar mx-auto max-w-6xl px-4">
        <div className="navbar-start">
          <Logo />
        </div>
        <div className="navbar-center hidden md:flex">
          <ul className="flex gap-6 text-sm text-muted-foreground">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="navbar-end">
          <Link href="/download" className={buttonVariants({ size: "lg" })}>
            <Download />
            Download
          </Link>
        </div>
      </nav>
    </header>
  );
}
