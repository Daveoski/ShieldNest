import { Suspense } from "react";
import type { Metadata } from "next";
import { DeviceApproval } from "@/components/device-approval";

export const metadata: Metadata = {
  title: "Sign in to the app",
  robots: { index: false },
};

export default function DevicePage() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="hero-grid pointer-events-none absolute inset-0 -z-10" />
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-4 py-16">
        <div className="w-full rounded-3xl border border-border bg-card/80 px-6 py-10 shadow-2xl shadow-black/30 backdrop-blur sm:px-10">
          <Suspense fallback={<div className="skeleton h-48 w-full rounded-xl" />}>
            <DeviceApproval />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
