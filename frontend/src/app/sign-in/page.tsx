import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";
import { googleEnabled } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your ShieldNest account">
      <Suspense>
        <AuthForm mode="sign-in" googleEnabled={googleEnabled} />
      </Suspense>
    </AuthShell>
  );
}
