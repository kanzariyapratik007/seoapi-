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

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
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

  console.log('Fetching SEO data for property-in-kalawad-road-rajkot...');
  try {
    const data = await seoService.getSeoData('property-in-kalawad-road-rajkot');
    console.log('Result null?', data === null);
    if (data) {
      console.log('Title:', data.title);
      console.log('H1:', data.h1);
      console.log('Meta Title:', data.meta_title);
      console.log('Content len:', data.content?.length);
    }
  } catch (err) {
    console.error('Error during getSeoData:', err);
  } finally {
    await pool.end();
  }
}

main();
