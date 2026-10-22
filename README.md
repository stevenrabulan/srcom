# Steven Rabulan Portfolio

A modern portfolio site built with Next.js 14, Tailwind CSS, and TypeScript.

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Add your images

**Profile Photo** (`public/images/profile.jpg`):
- Download your photo from your current WordPress site
- Save it as `profile.jpg` in the `public/images/` folder
- Recommended size: 640x800px or similar portrait ratio

**DJ Steeeve Logo** (`public/images/dj-steeeve.svg` or `.png`):
- Download from your current WordPress site's /links page
- If using PNG, update the src in `app/links/page.tsx`

### 3. Update external links (if needed)

Edit these files to update your social/external URLs:
- `components/WhatIDo.tsx` - Soundcloud & YouTube links
- `components/Footer.tsx` - Instagram & LinkedIn links
- `app/links/page.tsx` - All link buttons
- Redirect pages in `app/youtube/`, `app/soundcloud/`, etc.
- `public/.htaccess` - Apache redirects

### 4. Run development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

## Deployment

This site is automatically deployed to SiteGround via a GitHub Action whenever changes are pushed to the main branch. 

You can view the deployment workflows here: [GitHub Actions](https://github.com/stevenrabulan/srcom/actions)

Changes are live as soon as the action finishes. `public/.htaccess` sends `Cache-Control: no-cache` on HTML, so SiteGround's Dynamic Cache and CDN don't serve stale pages.

If a page still looks stale, check its headers with `curl -sI https://stevenrabulan.com/` (expect `cache-control: no-cache`), then flush manually as a fallback: 
[Flush SiteGround Dynamic Cache](https://tools.siteground.com/cacher?siteId=TFEvMmEzc05KUT09)

### Manual Deploy

If you need to deploy manually:

#### 1. Build static export
```bash
npm run build
```

#### 2. Deploy to Siteground
Upload the entire contents of the `out/` folder to your Siteground `public_html` folder via:
- File Manager in Site Tools
- FTP/SFTP
- Git deployment

The `.htaccess` file handles:
- Short URL redirects (`/youtube` → YouTube, etc.)
- SPA routing for client-side navigation
- Caching (`no-cache` on HTML, long-lived static assets) and compression
- Security headers

## Project Structure

```
portfolio/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Homepage
│   ├── globals.css         # Global styles + wave animation
│   ├── links/page.tsx      # Links page (Linktree-style)
│   ├── youtube/page.tsx    # Redirect → YouTube
│   ├── soundcloud/page.tsx # Redirect → Soundcloud
│   ├── instagram/page.tsx  # Redirect → Instagram
│   └── linkedin/page.tsx   # Redirect → LinkedIn
├── components/
│   ├── Header.tsx          # Sticky navigation
│   ├── Hero.tsx            # Hero section with photo
│   ├── WhatIDo.tsx         # Services/about section
│   ├── CTABanner.tsx       # Call-to-action with wave bg
│   ├── Footer.tsx          # Footer with social links
│   └── LinkButton.tsx      # Reusable button component
├── public/
│   ├── images/             # Your images go here
│   └── .htaccess           # Apache config for Siteground
├── tailwind.config.ts      # Custom colors & fonts
├── next.config.js          # Static export config
└── package.json
```

## Customization

### Colors
Edit `tailwind.config.ts`:
```ts
colors: {
  primary: '#6c5ce7',      // Purple buttons
  dark: '#1e1e2f',         // Dark backgrounds
  light: '#f8f8f8',        // Light section bg
}
```

### Contact Email
Update `mailto:` links in:
- `components/Header.tsx`
- `components/Hero.tsx`
- `components/CTABanner.tsx`

### Content
- Hero text: `components/Hero.tsx`
- Services: `components/WhatIDo.tsx`
- Footer links: `components/Footer.tsx`

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Lucide React (icons)
- Static export for traditional hosting
