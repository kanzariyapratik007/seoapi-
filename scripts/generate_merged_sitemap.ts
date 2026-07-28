import fs from 'fs';
import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const clientUrls = [
    { loc: 'https://propertysdeal.in/buy/residential-property-in-ahmedabad/', lastmod: '2026-06-19', changefreq: 'daily', priority: '1.0' },
    { loc: 'https://propertysdeal.in/rent/residential-property-in-ahmedabad/', lastmod: '2026-06-19', changefreq: 'daily', priority: '0.9' },
    { loc: 'https://propertysdeal.in/rent/commercial-property-in-ahmedabad/', lastmod: '2026-06-19', changefreq: 'daily', priority: '0.8' },
    { loc: 'https://propertysdeal.in/new-projects/in-ahmedabad/', lastmod: '2026-06-19', changefreq: 'daily', priority: '0.9' },
    { loc: 'https://propertysdeal.in/land/land-property-in-ahmedabad/', lastmod: '2026-06-19', changefreq: 'daily', priority: '0.8' },
    { loc: 'https://propertysdeal.in/property/agents/', lastmod: '2026-06-19', changefreq: 'weekly', priority: '0.7' },
    { loc: 'https://propertysdeal.in/property/builders/', lastmod: '2026-06-19', changefreq: 'weekly', priority: '0.7' },
    { loc: 'https://propertysdeal.in/property-map/', lastmod: '2026-06-19', changefreq: 'weekly', priority: '0.6' },
    { loc: 'https://propertysdeal.in/about-us/', lastmod: '2026-06-19', changefreq: 'monthly', priority: '0.5' },
    { loc: 'https://propertysdeal.in/services/', lastmod: '2026-06-19', changefreq: 'monthly', priority: '0.5' },
    { loc: 'https://propertysdeal.in/contact-us/', lastmod: '2026-06-19', changefreq: 'monthly', priority: '0.5' },
    { loc: 'https://propertysdeal.in/careers/', lastmod: '2026-06-19', changefreq: 'monthly', priority: '0.4' },
    { loc: 'https://propertysdeal.in/privacy-policy/', lastmod: '2026-06-19', changefreq: 'yearly', priority: '0.3' },
    { loc: 'https://propertysdeal.in/terms-conditions/', lastmod: '2026-06-19', changefreq: 'yearly', priority: '0.3' },
    { loc: 'https://propertysdeal.in/rera-information/', lastmod: '2026-06-19', changefreq: 'monthly', priority: '0.4' },
    { loc: 'https://propertysdeal.in/blogs/best-residential-areas-ahmedabad/', lastmod: '2026-06-19', changefreq: 'monthly', priority: '0.6' },
    { loc: 'https://propertysdeal.in/blogs/why-ahmedabad-is-best-for-real-estate-investment/', lastmod: '2026-06-19', changefreq: 'monthly', priority: '0.6' },
    { loc: 'https://propertysdeal.in/blogs/affordable-residential-properties-ahmedabad/', lastmod: '2026-06-19', changefreq: 'monthly', priority: '0.6' },
    { loc: 'https://propertysdeal.in/blogs/guide-to-buying-luxury-flats-ahmedabad/', lastmod: '2026-06-19', changefreq: 'monthly', priority: '0.6' },
    { loc: 'https://propertysdeal.in/blogs/commercial-real-estate-opportunities-ahmedabad/', lastmod: '2026-06-19', changefreq: 'monthly', priority: '0.6' }
  ];

  const targetSeoSlugs = [
    'property-in-gujarat',
    'real-estate-gujarat',
    'flats-for-sale-in-ahmedabad',
    'property-for-sale-in-ahmedabad',
    '2bhk-flat-ahmedabad',
    '3bhk-flat-surat',
    'plot-for-sale-vadodara',
    'property-dealer-gujarat',
    'buy-property-gujarat',
    'ahmedabad-real-estate',
    'flat-for-sale-in-sg-highway',
    '2bhk-bopal-ahmedabad',
    'property-in-prahlad-nagar',
    'flat-for-sale-in-satellite-ahmedabad',
    'plot-for-sale-in-thaltej',
    'flat-for-sale-in-vesu',
    '2bhk-flat-adajan-surat',
    '2bhk-pal-surat',
    'plot-for-sale-in-althan',
    'flat-for-sale-in-alkapuri',
    'property-in-gotri-vadodara',
    '2bhk-manjalpur',
    'property-in-kalawad-road-rajkot',
    'flat-gift-city-gandhinagar',
    'property-in-vallabh-vidyanagar',
    '2bhk-flat-under-50-lakh-ahmedabad',
    'ready-to-move-flats-surat',
    'new-projects-in-bopal',
    'affordable-flats-ahmedabad',
    'residential-plot-for-sale-gujarat',
    'villa-for-sale-vadodara',
    'rental-flats-vesu-surat',
    'office-space-for-rent-ahmedabad',
    'shop-for-sale-surat',
    'gidc-shed-for-sale',
    'agricultural-land-for-sale-gujarat',
    'na-plot-gujarat',
    'industrial-land-gujarat',
    'how-to-buy-property-in-gujarat',
    'stamp-duty-in-gujarat',
    'rera-registered-properties-gujarat',
    'best-areas-to-buy-flat-in-ahmedabad',
    'property-rates-in-bopal-2026',
    'how-to-verify-property-in-gujarat'
  ];

  const dbRes = await pool.query('SELECT slug, updated_at FROM blogs WHERE slug IS NOT NULL AND slug != \'\'');
  const blogMap = new Map(dbRes.rows.map(r => [r.slug, r.updated_at]));

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // 1. Existing Client Static URLs
  for (const item of clientUrls) {
    xml += `  <url>
    <loc>${item.loc}</loc>
    <lastmod>${item.lastmod}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>\n`;
  }

  // 2. Target 44 SEO URLs
  for (const slug of targetSeoSlugs) {
    const lastmod = blogMap.get(slug) ? new Date(blogMap.get(slug)).toISOString().split('T')[0] : '2026-07-28';
    xml += `  <url>
    <loc>https://propertysdeal.in/property-seo/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>\n`;
  }

  xml += `</urlset>`;

  fs.writeFileSync('public/sitemap-merged.xml', xml);
  console.log('Successfully generated public/sitemap-merged.xml!');
  await pool.end();
}

main();
