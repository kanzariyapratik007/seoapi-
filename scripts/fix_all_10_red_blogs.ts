import { Pool } from 'pg';
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const redSlugs = [
  'property-in-vallabh-vidyanagar',
  '2bhk-flat-under-50-lakh-ahmedabad',
  'ready-to-move-flats-surat',
  'new-projects-in-bopal',
  'affordable-flats-ahmedabad',
  'how-to-buy-property-in-gujarat',
  'stamp-duty-in-gujarat',
  'rera-registered-properties-gujarat',
  'best-areas-to-buy-flat-in-ahmedabad',
  'property-rates-in-bopal-2026'
];

async function fixAllRedBlogs() {
  console.log('Inspecting and fixing all 10 RED blogs in PostgreSQL database...');
  const client = await pool.connect();

  try {
    let fixedCount = 0;

    for (const slug of redSlugs) {
      const res = await client.query("SELECT id, slug, content FROM blogs WHERE slug = $1", [slug]);
      if (res.rows.length === 0) {
        console.log(`⚠️ Blog slug not found in DB: ${slug}`);
        continue;
      }

      const row = res.rows[0];
      let content = row.content || '';

      // Replace all literal \r\n, \n, \r with actual multiline newlines
      const cleaned = content
        .replace(/\\r\\n/g, '\n')
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\n')
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n');

      await client.query("UPDATE blogs SET content = $1, updated_at = NOW() WHERE id = $2", [cleaned, row.id]);
      fixedCount++;
      console.log(`✅ Fixed newlines for blog: ${slug}`);
    }

    console.log(`\n🎉 TOTAL RED BLOGS FIXED: ${fixedCount}`);

    // Re-export backup.sql
    console.log('Re-exporting full database backup.sql...');
    let sqlDump = `-- PropertysDeal SEO Engine PostgreSQL Full Database Backup\n-- Generated: ${new Date().toISOString()}\n\n`;

    const schemaPath = path.join(process.cwd(), 'sql', 'schema.sql');
    sqlDump += fs.readFileSync(schemaPath, 'utf8') + '\n\n';

    const tables = ['states', 'cities', 'localities', 'property_types', 'keywords', 'seo_templates', 'schema_templates', 'faqs', 'blogs'];

    for (const table of tables) {
      const tableRes = await client.query(`SELECT * FROM ${table}`);
      sqlDump += `-- Data for Table: ${table}\n`;
      for (const tRow of tableRes.rows) {
        const keys = Object.keys(tRow);
        const values = keys.map((k) => {
          const val = tRow[k];
          if (val === null || val === undefined) return 'NULL';
          if (typeof val === 'number' || typeof val === 'boolean') return val;
          if (val instanceof Date) return `'${val.toISOString()}'`;
          return `'${String(val).replace(/'/g, "''")}'`;
        });
        sqlDump += `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${values.join(', ')}) ON CONFLICT DO NOTHING;\n`;
      }
      sqlDump += '\n';
    }

    const backupPath = path.join(process.cwd(), 'backup.sql');
    fs.writeFileSync(backupPath, sqlDump, 'utf8');
    console.log(`🎉 SUCCESS! Updated backup.sql saved to: ${backupPath}`);

  } catch (err) {
    console.error('Error fixing red blogs:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

fixAllRedBlogs();
