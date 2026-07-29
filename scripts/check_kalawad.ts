import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const slug = 'property-in-kalawad-road-rajkot';
  console.log(`Checking slug: ${slug}`);

  const blogRes = await pool.query('SELECT id, slug, title, meta_title, meta_description, LENGTH(content) as content_len FROM blogs WHERE slug = $1', [slug]);
  console.log('Blogs table result:', blogRes.rows);

  const kwRes = await pool.query('SELECT id, phrase, slug, category, is_active FROM keywords WHERE slug = $1', [slug]);
  console.log('Keywords table result:', kwRes.rows);

  await pool.end();
}

main();
