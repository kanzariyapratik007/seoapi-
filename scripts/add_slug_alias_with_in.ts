import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  console.log('Inserting alias slug: agricultural-land-for-sale-in-gujarat...');
  const client = await pool.connect();

  try {
    // 1. Fetch content from agricultural-land-for-sale-gujarat
    const origBlog = await client.query("SELECT * FROM blogs WHERE slug = 'agricultural-land-for-sale-gujarat'");
    if (origBlog.rows.length > 0) {
      const blog = origBlog.rows[0];
      const aliasSlug = 'agricultural-land-for-sale-in-gujarat';

      await client.query(
        `INSERT INTO blogs (title, slug, content, meta_title, meta_description, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT (slug) DO UPDATE 
         SET title = EXCLUDED.title, content = EXCLUDED.content, meta_title = EXCLUDED.meta_title, meta_description = EXCLUDED.meta_description, updated_at = NOW()`,
        [blog.title, aliasSlug, blog.content, blog.meta_title, blog.meta_description]
      );

      await client.query(
        `INSERT INTO keywords (phrase, slug, category)
         VALUES ('Agricultural Land for Sale in Gujarat', $1, 'BLOG')
         ON CONFLICT (slug) DO UPDATE SET category = 'BLOG'`,
        [aliasSlug]
      );

      console.log(`✅ Alias slug '${aliasSlug}' inserted successfully!`);
    } else {
      console.error('Original blog not found!');
    }
  } catch (err) {
    console.error('Error inserting alias slug:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
