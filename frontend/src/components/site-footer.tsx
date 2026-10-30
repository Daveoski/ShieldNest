import Link from "next/link";
import { Logo } from "@/components/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="footer mx-auto max-w-6xl px-4 py-10 sm:footer-horizontal text-muted-foreground">
        <aside className="max-w-xs">
          <Logo />
          <p className="mt-2 text-sm">
            Blocks ads, malware and trackers on your phone and PC.
          </p>
        </aside>
        <nav>
          <h6 className="footer-title">Product</h6>
          <Link href="/#features" className="link link-hover">Features</Link>
          <Link href="/download" className="link link-hover">Download</Link>
          <Link href="/#faq" className="link link-hover">FAQ</Link>
        </nav>
        <nav>
          <h6 className="footer-title">Platforms</h6>
          <Link href="/download#android" className="link link-hover">Android</Link>
          <Link href="/download#windows" className="link link-hover">Windows</Link>
          <Link href="/download#macos" className="link link-hover">macOS</Link>
          <Link href="/download#ios" className="link link-hover">iPhone</Link>
        </nav>
      </div>
      <p className="pb-8 text-center text-xs text-muted-foreground">
        © <CopyrightYear /> ShieldNest. All rights reserved.
      </p>
    </footer>
  );
}

async function CopyrightYear() {
  "use cache";
  return new Date().getFullYear();
}
