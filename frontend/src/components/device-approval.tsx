"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CircleCheck, CircleX, Loader2, MonitorSmartphone } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

type Step = "enter" | "confirm" | "approved" | "denied";

/** Codes are shown as ABCD-1234 in the apps; the server wants them without the dash. */
const normalize = (code: string) => code.trim().replace(/[-\s]/g, "").toUpperCase();
const pretty = (code: string) => (code.length === 8 ? `${code.slice(0, 4)}-${code.slice(4)}` : code);

export function DeviceApproval() {
  const initialCode = normalize(useSearchParams().get("user_code") ?? "");
  const { data: session, isPending } = authClient.useSession();
  const [code, setCode] = useState(initialCode);
  const [step, setStep] = useState<Step>(initialCode ? "confirm" : "enter");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (isPending) {
    return <div className="skeleton h-48 w-full rounded-xl" />;
  }

  if (!session) {
    const back = `/device${code ? `?user_code=${encodeURIComponent(code)}` : ""}`;
    return (
      <div className="text-center">
        <MonitorSmartphone className="mx-auto size-10 text-primary" />
        <h1 className="mt-4 text-2xl font-bold tracking-tight">Sign in to connect your app</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your ShieldNest app is waiting. Sign in or create a free account, and you&apos;ll come straight back here.
        </p>
        {code && <p className="mt-6 font-mono text-2xl font-bold tracking-widest">{pretty(code)}</p>}
        <div className="mt-8 grid gap-3">
          <Link href={`/sign-in?redirect=${encodeURIComponent(back)}`} className={buttonVariants({ size: "lg", className: "h-11" })}>
            Sign in
          </Link>
          <Link href={`/sign-up?redirect=${encodeURIComponent(back)}`} className={buttonVariants({ variant: "outline", size: "lg", className: "h-11" })}>
            Create account
          </Link>
        </div>
      </div>
    );
  }

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const userCode = normalize(code);
    // Claim the code for this signed-in user first; this also rejects unknown or expired codes
    const verified = await authClient.device({ query: { user_code: userCode } });
    if (verified.error) {
      setError("That code is wrong or has expired. Start sign-in again in the app to get a new one.");
      setStep("enter");
      setBusy(false);
      return;
    }
    const result = approve
      ? await authClient.device.approve({ userCode })
      : await authClient.device.deny({ userCode });
    setBusy(false);
    if (result.error) {
      setError(result.error.error_description || "Something went wrong. Please try again.");
      return;
    }
    setStep(approve ? "approved" : "denied");
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (normalize(code).length < 8) {
      setError("Enter the 8-character code shown in the app.");
      return;
    }
    setError(null);
    setStep("confirm");
  }

  if (step === "approved" || step === "denied") {
    const approved = step === "approved";
    const Icon = approved ? CircleCheck : CircleX;
    return (
      <div className="text-center">
        <Icon className={`mx-auto size-12 ${approved ? "text-success" : "text-muted-foreground"}`} />
        <h1 className="mt-4 text-2xl font-bold tracking-tight">{approved ? "App connected" : "Request denied"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {approved
            ? "You can close this page and go back to ShieldNest. It will finish signing in on its own."
            : "The app wasn't given access to your account."}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center">
        <MonitorSmartphone className="mx-auto size-10 text-primary" />
        <h1 className="mt-4 text-2xl font-bold tracking-tight">Connect a ShieldNest app</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Signed in as <strong className="text-foreground">{session.user.email}</strong>
        </p>
      </div>

      {step === "enter" ? (
        <form onSubmit={onSubmit} className="mt-8 space-y-3">
          <label htmlFor="user-code" className="text-sm font-medium">
            Code shown in the app
          </label>
          <Input
            id="user-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="ABCD-1234"
            autoComplete="off"
            className="h-12 text-center font-mono text-xl tracking-widest uppercase"
            maxLength={9}
          />
          <Button type="submit" size="lg" className="h-11 w-full">
            Continue
          </Button>
        </form>
      ) : (
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">Check this matches the code in your app:</p>
          <p className="mt-3 font-mono text-3xl font-bold tracking-widest text-primary">{pretty(normalize(code))}</p>
          <div className="mt-8 grid grid-cols-2 gap-3">
            <Button variant="outline" size="lg" className="h-11" disabled={busy} onClick={() => decide(false)}>
              Deny
            </Button>
            <Button size="lg" className="h-11" disabled={busy} onClick={() => decide(true)}>
              {busy && <Loader2 className="animate-spin" />} Approve
            </Button>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
