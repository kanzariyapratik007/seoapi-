import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const res = await pool.query("SELECT id, slug, content FROM blogs WHERE content LIKE '%\\n%'");
  console.log(`Blogs containing literal '\\n' string: ${res.rows.length}`);
  
  if (res.rows.length > 0) {
    console.log('Affected slugs:', res.rows.map(r => r.slug));
  }

  await pool.end();
}

main();
