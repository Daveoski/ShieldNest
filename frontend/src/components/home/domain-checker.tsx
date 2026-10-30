"use client";

import { useState, type FormEvent } from "react";
import { CircleCheck, Loader2, Search, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Result =
  | { domain: string; blocked: true; category: "ads" | "malware" | "phishing"; match: string }
  | { domain: string; blocked: false };

const examples = ["doubleclick.net", "google.com", "ads.yahoo.com", "wikipedia.org"];

const categoryText = {
  ads: "an ad or tracking domain",
  malware: "a domain known to spread malware or ransomware",
  phishing: "a phishing domain that tries to steal passwords",
};

/** Turns "https://www.Example.com/path" into "www.example.com". */
function toDomain(input: string) {
  const trimmed = input.trim().toLowerCase();
  try {
    return new URL(trimmed.includes("://") ? trimmed : `http://${trimmed}`).hostname;
  } catch {
    return trimmed;
  }
}

export function DomainChecker() {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function check(input: string) {
    const domain = toDomain(input);
    if (!domain.includes(".")) {
      setError("Enter a website like example.com");
      setResult(null);
      return;
    }
    setValue(domain);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/py/check?domain=${encodeURIComponent(domain)}`);
      if (!response.ok) throw new Error();
      setResult(await response.json());
    } catch {
      setError("Couldn't reach the checker. Please try again.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    check(value);
  }

  return (
    <div id="tour-checker" className="rounded-2xl border border-border bg-card p-5 shadow-2xl shadow-black/20 sm:p-7">
      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="domain" className="sr-only">
          Website address
        </label>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="domain"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Type a website, e.g. doubleclick.net"
            autoComplete="off"
            spellCheck={false}
            className="h-11 pl-9 text-base"
          />
        </div>
        <Button type="submit" size="lg" className="h-11 px-6" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : "Check"}
        </Button>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>Try:</span>
        {examples.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => check(example)}
            className="rounded-full border border-border px-2.5 py-1 transition-colors hover:border-primary/50 hover:text-foreground"
          >
            {example}
          </button>
        ))}
      </div>

      <div aria-live="polite" className="mt-5 min-h-16">
        {error && <p className="text-sm text-destructive">{error}</p>}
        {result?.blocked && (
          <div className="flex gap-3 rounded-xl border border-error/30 bg-error/10 p-4 animate-in fade-in slide-in-from-bottom-1">
            <ShieldAlert className="mt-0.5 size-5 shrink-0 text-error" />
            <p className="text-sm">
              <strong>{result.domain}</strong> is <strong className="text-error">blocked</strong>. It&apos;s{" "}
              {categoryText[result.category]}
              {result.match !== result.domain && (
                <>
                  {" "}(matched <code className="font-mono">{result.match}</code>)
                </>
              )}
              .
            </p>
          </div>
        )}
        {result && !result.blocked && (
          <div className="flex gap-3 rounded-xl border border-success/30 bg-success/10 p-4 animate-in fade-in slide-in-from-bottom-1">
            <CircleCheck className="mt-0.5 size-5 shrink-0 text-success" />
            <p className="text-sm">
              <strong>{result.domain}</strong> is <strong className="text-success">allowed</strong>. It isn&apos;t on
              any ShieldNest blocklist, so it loads normally.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
