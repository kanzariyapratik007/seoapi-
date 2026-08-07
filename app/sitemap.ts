import { MetadataRoute } from 'next';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const client = await pool.connect();
    
    // Query ALL distinct active slugs from both blogs AND keywords tables
    const allSlugsRes = await client.query(
      `SELECT slug, MAX(updated_at) as updated_at FROM (
         SELECT slug, updated_at FROM blogs WHERE slug IS NOT NULL AND slug != ''
         UNION ALL
         SELECT slug, updated_at FROM keywords WHERE slug IS NOT NULL AND slug != '' AND is_active = TRUE
       ) combined
       GROUP BY slug
       ORDER BY slug ASC`
    );
    client.release();

    const baseUrl = 'https://propertysdeal.in/propertys-details';

    const entries: MetadataRoute.Sitemap = [
      {
        url: 'https://propertysdeal.in',
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      ...allSlugsRes.rows.map((row) => ({
        url: `${baseUrl}/${row.slug}`,
        lastModified: new Date(row.updated_at || Date.now()),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      })),
    ];

    return entries;
  } catch (error) {
    console.error('Error generating Next.js native sitemap:', error);
    return [];
  }
}
