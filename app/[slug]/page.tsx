import { notFound } from 'next/navigation';
import { redirects } from '@/lib/redirects';
import ClientRedirect from '@/components/ClientRedirect';

export function generateStaticParams() {
  return Object.keys(redirects).map((slug) => ({
    slug,
  }));
}

export default async function RedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const target = redirects[slug];
  
  if (!target) {
    notFound();
  }

  // Format a nice fallback text based on the slug
  const fallbackText = `Redirecting to ${slug.charAt(0).toUpperCase() + slug.slice(1)}...`;

  return (
    <>
      {/* We add a meta refresh for browsers that disable JS, though useEffect is primarily relied on */}
      <meta httpEquiv="refresh" content={`0; url=${target}`} />
      <ClientRedirect target={target} fallbackText={fallbackText} />
    </>
  );
}
