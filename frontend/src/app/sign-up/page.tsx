import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";
import { googleEnabled } from "@/lib/auth";

export const metadata: Metadata = { title: "Create account" };

export default function SignUpPage() {
  return (
    <AuthShell title="Create your account" subtitle="Free, and it takes less than a minute">
      <Suspense>
        <AuthForm mode="sign-up" googleEnabled={googleEnabled} />
      </Suspense>
    </AuthShell>
  );
}
