import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  console.log('Inserting Industrial Land alias slugs into database...');
  const client = await pool.connect();

  try {
    const origBlog = await client.query("SELECT * FROM blogs WHERE slug = 'industrial-land-gujarat'");
    if (origBlog.rows.length > 0) {
      const blog = origBlog.rows[0];
      const aliasSlugs = [
        'industrial-land-for-sale-in-gujarat',
        'industrial-land-for-sale-gujarat',
        'industrial-land-in-gujarat'
      ];

      for (const aliasSlug of aliasSlugs) {
        await client.query(
          `INSERT INTO blogs (title, slug, content, meta_title, meta_description, updated_at)
           VALUES ($1, $2, $3, $4, $5, NOW())
           ON CONFLICT (slug) DO UPDATE 
           SET title = EXCLUDED.title, content = EXCLUDED.content, meta_title = EXCLUDED.meta_title, meta_description = EXCLUDED.meta_description, updated_at = NOW()`,
          [blog.title, aliasSlug, blog.content, blog.meta_title, blog.meta_description]
        );

        await client.query(
          `INSERT INTO keywords (phrase, slug, category)
           VALUES ('Industrial Land for Sale in Gujarat', $1, 'BLOG')
           ON CONFLICT (slug) DO UPDATE SET category = 'BLOG'`,
          [aliasSlug]
        );

        console.log(`✅ Alias slug '${aliasSlug}' inserted successfully!`);
      }
    } else {
      console.error('Original industrial land blog not found!');
    }
  } catch (err) {
    console.error('Error inserting industrial land alias slugs:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
