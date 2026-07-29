import { Pool } from 'pg';
import 'dotenv/config';
import { KeywordRepository } from '../repositories/keyword.repository';
import { LocationRepository } from '../repositories/location.repository';
import { TemplateRepository } from '../repositories/template.repository';
import { SlugService } from '../services/slug.service';
import { KeywordService } from '../services/keyword.service';
import { TemplateService } from '../services/template.service';
import { FaqService } from '../services/faq.service';
import { SchemaService } from '../services/schema.service';
import { SeoService } from '../services/seo.service';

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
  console.log(`Checking ${targetSlugs.length} slugs...`);

  const keywordRepo = new KeywordRepository(pool);
  const locationRepo = new LocationRepository(pool);
  const templateRepo = new TemplateRepository(pool);

  const slugService = new SlugService(locationRepo, keywordRepo);
  const keywordService = new KeywordService(keywordRepo);
  const templateService = new TemplateService(templateRepo);
  const faqService = new FaqService(keywordRepo);
  const schemaService = new SchemaService(templateRepo);

  const seoService = new SeoService(
    slugService,
    keywordService,
    templateService,
    faqService,
    schemaService,
    keywordRepo
  );

  const results: Array<{ slug: string; inBlogs: boolean; inKeywords: boolean; seoServiceOk: boolean }> = [];

  for (const slug of targetSlugs) {
    const blogRes = await pool.query('SELECT slug FROM blogs WHERE slug = $1', [slug]);
    const kwRes = await pool.query('SELECT slug FROM keywords WHERE slug = $1', [slug]);
    
    let seoServiceOk = false;
    try {
      const data = await seoService.getSeoData(slug);
      seoServiceOk = !!data;
    } catch (e) {
      seoServiceOk = false;
    }

    results.push({
      slug,
      inBlogs: blogRes.rows.length > 0,
      inKeywords: kwRes.rows.length > 0,
      seoServiceOk
    });
  }

  const failed = results.filter(r => !r.seoServiceOk || !r.inBlogs);
  console.log(`TOTAL TESTED: ${results.length}`);
  console.log(`PASSED: ${results.length - failed.length}`);
  console.log(`FAILED / 404 POTENTIAL: ${failed.length}`);

  if (failed.length > 0) {
    console.log('--- FAILED SLUGS ---');
    console.table(failed);
  } else {
    console.log('✅ ALL 44 SLUGS ARE WORKING PERFECTLY IN SEO SERVICE & DB!');
  }

  await pool.end();
}

main();
