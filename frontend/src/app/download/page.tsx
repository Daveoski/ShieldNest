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
import { RecommendedBadge } from "@/components/recommended-badge";
import { APP_VERSION, platforms } from "@/lib/platforms";

export const metadata: Metadata = {
  title: "Download",
  description: "Download ShieldNest for Android and Windows. macOS and iPhone are coming soon.",
};

export default function DownloadPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Download ShieldNest</h1>
        <p className="mt-4 text-muted-foreground">
          Free for every device. Version {APP_VERSION}.
        </p>
      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {platforms.map(({ id, name, icon: Icon, requirement, download, features, installSteps }) => (
          <Card key={id} id={id} className="scroll-mt-24">
            <CardHeader>
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="grid size-11 place-items-center rounded-lg bg-primary/15 text-primary">
                  <Icon className="size-6" />
                </span>
                {download ? <RecommendedBadge platform={id} /> : <Badge variant="secondary">Coming soon</Badge>}
              </div>
              <CardTitle className="text-lg">{name}</CardTitle>
              <CardDescription>{requirement}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-5">
              <ul className="space-y-2">
                {features.map((feature) => (
                  <li key={feature} className="flex gap-2 text-muted-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              {installSteps && (
                <div>
                  <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    How to install
                  </p>
                  <ol className="list-decimal space-y-1 pl-4 text-xs text-muted-foreground">
                    {installSteps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex-col gap-2">
              {download ? (
                <>
                  <a href={download.href} download={download.fileName} className={buttonVariants({ className: "w-full" })}>
                    <Download />
                    Download for {name}
                  </a>
                  <span className="text-xs text-muted-foreground">{download.size}</span>
                </>
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
