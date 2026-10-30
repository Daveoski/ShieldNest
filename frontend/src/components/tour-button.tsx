"use client";

import { Compass } from "lucide-react";
import { requestTour } from "@/components/tour-guide";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TourButton({
  className,
  variant = "ghost",
  label = "Take the tour",
  id,
}: {
  className?: string;
  variant?: "ghost" | "outline";
  label?: string;
  id?: string;
}) {
  return (
    <button
      id={id}
      type="button"
      onClick={requestTour}
      className={cn(buttonVariants({ variant, size: "lg" }), className)}
    >
      <Compass />
      {label}
    </button>
  );
}
