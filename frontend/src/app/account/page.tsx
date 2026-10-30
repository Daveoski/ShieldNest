import { Suspense } from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check, Download, Mail } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { SignOutButton } from "@/components/sign-out-button";
import { auth } from "@/lib/auth";
import { platforms } from "@/lib/platforms";

export const metadata: Metadata = { title: "Your account" };

export default function AccountPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <Suspense fallback={<div className="skeleton h-40 w-full rounded-2xl" />}>
        <AccountDetails />
      </Suspense>
    </section>
  );
}

async function AccountDetails() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");
  const { user } = session;
  const joined = new Date(user.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-border bg-card p-8">
        <div className="flex items-center gap-5">
          <span className="grid size-16 place-items-center overflow-hidden rounded-full bg-primary/15 text-2xl font-bold text-primary">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt="" className="size-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              (user.name || user.email).charAt(0).toUpperCase()
            )}
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Hi, {user.name.split(" ")[0]} 👋</h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="size-4" /> {user.email}
            </p>
            <p className="text-xs text-muted-foreground">Member since {joined}</p>
          </div>
        </div>
        <SignOutButton />
      </div>

      <h2 className="mt-12 text-xl font-semibold">Your downloads</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {platforms.map(({ id, name, icon: Icon, download, requirement }) => (
          <div key={id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
              <Icon className="size-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{name}</p>
              <p className="truncate text-xs text-muted-foreground">{requirement}</p>
            </div>
            {download ? (
              <a href={download.href} download={download.fileName} className={buttonVariants({ size: "lg" })}>
                <Download /> {download.size}
              </a>
            ) : (
              <span className="text-sm text-muted-foreground">Coming soon</span>
            )}
          </div>
        ))}
      </div>

      <h2 className="mt-12 text-xl font-semibold">Get the most out of ShieldNest</h2>
      <ul className="mt-5 grid gap-3 md:grid-cols-3">
        {[
          "Turn protection on, then open any news site. Ads that used to load will be gone.",
          "On Android, set Private DNS to Off or Automatic so ShieldNest can filter.",
          "Leave your built-in antivirus on. ShieldNest blocks bad sites, and antivirus scans files.",
        ].map((tip) => (
          <li key={tip} className="flex gap-3 rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" />
            {tip}
          </li>
        ))}
      </ul>

      <Link href="/#checker" className={buttonVariants({ variant: "link", className: "mt-8 px-0" })}>
        Check whether a site is blocked <ArrowRight />
      </Link>
    </>
  );
}
