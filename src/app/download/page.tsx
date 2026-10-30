import type { Metadata } from "next";
import { Check, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { platforms } from "@/lib/platforms";

export const metadata: Metadata = {
  title: "Download",
  description: "Download ShieldNest for Android, Windows, macOS and iPhone.",
};

export default function DownloadPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Download ShieldNest</h1>
        <p className="mt-4 text-muted-foreground">
          Choose your device. One account protects all of them.
        </p>
      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {platforms.map(({ id, name, icon: Icon, requirement, href, features }) => (
          <Card key={id} id={id} className="scroll-mt-24">
            <CardHeader>
              <div className="mb-3 flex items-center justify-between">
                <span className="grid size-11 place-items-center rounded-lg bg-primary/15 text-primary">
                  <Icon className="size-6" />
                </span>
                {!href && <Badge variant="secondary">Coming soon</Badge>}
              </div>
              <CardTitle className="text-lg">{name}</CardTitle>
              <CardDescription>{requirement}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-2">
                {features.map((feature) => (
                  <li key={feature} className="flex gap-2 text-muted-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {href ? (
                <a href={href} className={buttonVariants({ className: "w-full" })}>
                  <Download />
                  Download for {name}
                </a>
              ) : (
                <span
                  aria-disabled="true"
                  className={buttonVariants({ variant: "outline", className: "w-full pointer-events-none opacity-60" })}
                >
                  Coming soon
                </span>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
