"use client";

import posthog from "posthog-js";
import { portfolioLogger } from "@/lib/posthog-logger";

export default function CTABanner() {
  return (
    <section className="wave-bg py-24 relative">
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-8">Need to get caught up with AI?</h2>
        <a
          href="mailto:steven.rabulan@gmail.com"
          onClick={() => {
            posthog.capture("contact_cta_clicked", { placement: "cta_banner" });
            portfolioLogger.contactCtaClicked("cta_banner");
          }}
          className="inline-block bg-primary hover:bg-primary-hover text-white font-bold px-8 py-4 rounded-lg transition-colors uppercase tracking-wide font-heading"
        >
          Shoot Me a Message
        </a>
      </div>
    </section>
  );
}
