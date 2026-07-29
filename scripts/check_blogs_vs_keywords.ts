import { Pool } from 'pg';
import 'dotenv/config';

const targetSlugs = [
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

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const missingInBlogs: string[] = [];
  const missingInKeywords: string[] = [];

  for (const slug of targetSlugs) {
    const blogRes = await pool.query('SELECT slug FROM blogs WHERE slug = $1', [slug]);
    if (blogRes.rows.length === 0) missingInBlogs.push(slug);

    const kwRes = await pool.query('SELECT slug FROM keywords WHERE slug = $1', [slug]);
    if (kwRes.rows.length === 0) missingInKeywords.push(slug);
  }

  console.log(`TOTAL SLUGS: ${targetSlugs.length}`);
  console.log(`MISSING IN BLOGS TABLE (${missingInBlogs.length}):`, missingInBlogs);
  console.log(`MISSING IN KEYWORDS TABLE (${missingInKeywords.length}):`, missingInKeywords);

  await pool.end();
}

main();
