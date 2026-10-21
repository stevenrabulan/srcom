"use client";

import Link from "next/link";
import posthog from "posthog-js";
import { portfolioLogger } from "@/lib/posthog-logger";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-dark/95 backdrop-blur-sm border-b border-white/5">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-white text-xl font-bold font-heading opacity-75 hover:opacity-100 hover:scale-105 transition">
          Steven Rabulan
        </Link>
        <a
          href="mailto:steven.rabulan@gmail.com"
          onClick={() => {
            posthog.capture("contact_cta_clicked", { placement: "header" });
            portfolioLogger.contactCtaClicked("header");
          }}
          className="bg-primary hover:bg-primary-hover text-white font-bold px-6 py-3 rounded-lg transition-colors uppercase tracking-wide text-sm font-heading"
        >
          Shoot Me a Message
        </a>
      </div>
    </header>
  );
}
