import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const res = await pool.query("SELECT id, slug, content FROM blogs WHERE content LIKE '%\\n%' OR content LIKE '%\\r%' OR content LIKE '%\\n\\n%'");
  
  console.log(`Total blogs checked: ${res.rows.length}`);

  const blogsWithLiteralSlashN = [];

  const allBlogs = await pool.query("SELECT id, slug, content FROM blogs");
  for (const b of allBlogs.rows) {
    if (b.content && (b.content.includes('\\n') || b.content.includes('\\r'))) {
      blogsWithLiteralSlashN.push({ id: b.id, slug: b.slug });
    }
  }

  console.log(`Blogs with literal '\\n' escape string: ${blogsWithLiteralSlashN.length}`);
  console.log('Sample affected blogs:', blogsWithLiteralSlashN.slice(0, 10));

  await pool.end();
}

main();
