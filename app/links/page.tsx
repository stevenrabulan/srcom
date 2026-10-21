import type { Metadata } from "next";
import Link from "next/link";
import { Cloud, Youtube, Instagram, ChevronDown } from "lucide-react";
import LinkButton from "@/components/LinkButton";

export const metadata: Metadata = {
  title: "Links - Steven Rabulan",
  description: "All my links in one place - DJ Steeeve",
};

const links = [
  {
    href: "https://soundcloud.com/djsteeeve",
    icon: Cloud,
    label: "Soundcloud",
    variant: "primary" as const,
  },
  {
    href: "https://youtube.com/@djsteeeve",
    icon: Youtube,
    label: "YouTube",
    variant: "primary" as const,
  },
  {
    href: "https://instagram.com/djsteeeve",
    icon: Instagram,
    label: "Instagram",
    variant: "primary" as const,
  },
];

export default function LinksPage() {
  return (
    <main className="min-h-screen bg-dark flex flex-col items-center px-6 py-16">
      {/* DJ Steeeve Logo */}
      <div className="mb-10 w-full flex justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/dj_steeeve.webp" alt="DJ Steeeve" className="w-full max-w-[500px] md:max-w-[600px] h-auto px-4" />
      </div>

      {/* Links */}
      <div className="w-full max-w-md space-y-4">
        {links.map((link) => (
          <LinkButton key={link.label} href={link.href} icon={<link.icon size={20} />} label={link.label} variant={link.variant} />
        ))}

        {/* See More Link */}
        <Link href="/" className="flex items-center justify-center w-full max-w-md mx-auto py-4 px-6 rounded-lg font-bold uppercase tracking-wide transition-all hover:scale-[1.02] bg-dark-lighter hover:bg-gray-700 text-white mt-8 font-heading">
          See More: stevenrabulan.com
        </Link>
      </div>
    </main>
  );
}
