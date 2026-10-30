import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What ShieldNest collects, and what it never collects.",
};

const sections = [
  {
    title: "The apps never send us your browsing",
    body: [
      "ShieldNest checks website lookups on your device. The list of sites you visit isn't sent to ShieldNest, and we have no server in the middle of your traffic.",
      "Lookups that aren't blocked are answered by Cloudflare's 1.1.1.2 resolver, the same way they would be by your internet provider. Cloudflare's own privacy policy covers those lookups.",
      "The apps download the blocklist from our servers. That request includes your IP address, as every web request does, but nothing about your browsing.",
    ],
  },
  {
    title: "Your account",
    body: [
      "If you create an account, we store your name, email address, a securely hashed password (if you use email sign-in) and the time you joined. If you sign in with Google, we receive your name, email and profile picture from Google.",
      "We store a session cookie so you stay signed in. We don't use advertising or tracking cookies.",
      "We don't sell or share your information.",
    ],
  },
  {
    title: "The site checker",
    body: [
      "When you use \"Is this site safe?\" on our website, the website you type is sent to our API to be checked. It isn't linked to your account or saved by ShieldNest. Like any web request, it may appear for a short time in our hosting provider's (Vercel's) request logs.",
    ],
  },
  {
    title: "Where blocklists come from",
    body: [
      "Ad and tracker domains come from the open-source StevenBlack hosts project. Malware and phishing domains come from the malware-filter project, which uses abuse.ch URLhaus, PhishTank, OpenPhish and PhishStats.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-20">
      <p className="text-sm font-semibold tracking-wider text-primary uppercase">Privacy</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight">Privacy policy</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        ShieldNest is built so that we can&apos;t see what you do online. Here&apos;s exactly what we collect.
      </p>
      <div className="mt-12 space-y-12">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-semibold">{section.title}</h2>
            <div className="mt-3 space-y-3 leading-relaxed text-muted-foreground">
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
