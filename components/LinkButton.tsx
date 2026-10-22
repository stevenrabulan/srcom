"use client";

import type { ReactNode } from "react";
import posthog from "posthog-js";
import { portfolioLogger } from "@/lib/posthog-logger";

interface LinkButtonProps {
  href: string;
  icon: ReactNode;
  label: string;
  variant?: 'primary' | 'secondary';
}

export default function LinkButton({ href, icon, label, variant = 'primary' }: LinkButtonProps) {
  const baseStyles = 'flex items-center justify-center gap-3 w-full max-w-md mx-auto py-4 px-6 rounded-lg font-bold uppercase tracking-wide transition-all hover:scale-[1.02] hover:shadow-lg font-heading';

  const variantStyles = {
    primary: 'bg-primary hover:bg-primary-hover text-white',
    secondary: 'bg-dark-lighter hover:bg-dark text-white',
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        posthog.capture("link_hub_link_clicked", { link_label: label, link_variant: variant });
        portfolioLogger.linkHubLinkClicked(variant);
      }}
      className={`${baseStyles} ${variantStyles[variant]}`}
    >
      {icon}
      <span>{label}</span>
    </a>
  );
}
