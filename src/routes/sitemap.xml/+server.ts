import type { RequestHandler } from './$types';

type Url = {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
};

export const GET = (async () => {
  const baseUrl = 'https://ai.yam-yam.dev';
  const baseLastmod = '2023-12-04';
  const baseChangefreq = 'monthly';
  const basePriority = 0.5;
  const urls: Url[] = [
    {
      loc: baseUrl,
      changefreq: 'weekly',
      priority: 1,
    },
    {
      loc: `${baseUrl}/login`,
      changefreq: 'yearly',
    },
    {
      loc: `${baseUrl}/register`,
      changefreq: 'yearly',
    },
  ];

  return new Response(
    `
    <?xml version="1.0" encoding="UTF-8" ?>
    <urlset
      xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:xhtml="https://www.w3.org/1999/xhtml"
      xmlns:mobile="https://www.google.com/schemas/sitemap-mobile/1.0"
      xmlns:news="https://www.google.com/schemas/sitemap-news/0.9"
      xmlns:image="https://www.google.com/schemas/sitemap-image/1.1"
      xmlns:video="https://www.google.com/schemas/sitemap-video/1.1"
    >
      ${urls
        .map((url) => {
          return `
            <url>
              <loc>${url.loc}</loc>
              <lastmod>${url.lastmod ?? baseLastmod}</lastmod>
              <changefreq>${url.changefreq ?? baseChangefreq}</changefreq>
              <priority>${url.priority ?? basePriority}</priority>
            </url>
          `;
        })
        .join('')}
    </urlset>`.trim(),
    {
      headers: {
        'Content-Type': 'application/xml',
      },
    },
  );
}) satisfies RequestHandler;
