"use client";

import posthog from "posthog-js";

export const portfolioLogger = {
  contactCtaClicked(placement: "hero" | "header" | "cta_banner" | "footer") {
    posthog.logger.info("portfolio contact CTA clicked", {
      action: "contact_cta_clicked",
      placement,
    });
  },
  linkHubLinkClicked(linkVariant: "primary" | "secondary") {
    posthog.logger.info("portfolio link-hub link clicked", {
      action: "link_hub_link_clicked",
      link_variant: linkVariant,
    });
  },
  socialProfileClicked(platform: "Instagram" | "LinkedIn") {
    posthog.logger.info("portfolio social profile clicked", {
      action: "social_profile_clicked",
      platform,
    });
  },
};
