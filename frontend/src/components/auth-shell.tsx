import type { ReactNode } from "react";
import { Ban, Fish, ShieldCheck } from "lucide-react";

/** Two-column layout for the sign-in and sign-up pages. */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="hero-grid pointer-events-none absolute inset-0 -z-10" />
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-12 px-4 py-16 md:grid-cols-2">
        <div className="hidden md:block">
          <h2 className="text-3xl font-bold tracking-tight text-balance">
            One account for <span className="text-gradient">every device</span> you protect.
          </h2>
          <ul className="mt-8 space-y-4 text-muted-foreground">
            {[
              { icon: ShieldCheck, text: "Your downloads and setup guides in one place" },
              { icon: Ban, text: "The apps work without an account. Signing in is optional" },
              { icon: Fish, text: "We store your name and email, and nothing about your browsing" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex gap-3">
                <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
                {text}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col items-center rounded-3xl border border-border bg-card/80 px-6 py-10 shadow-2xl shadow-black/30 backdrop-blur sm:px-10">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 mb-8 text-center text-sm text-muted-foreground">{subtitle}</p>
          {children}
        </div>
      </div>
    </section>
  );
}
