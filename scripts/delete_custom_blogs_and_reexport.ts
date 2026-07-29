import { Pool } from 'pg';
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const targetSlugs = [
  'flat-gift-city-gandhinagar',
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

async function deleteCustomBlogsAndReexport() {
  console.log('Deleting custom blog entries from PostgreSQL database to fallback to dynamic SEO engine templates...');
  const client = await pool.connect();

  try {
    for (const slug of targetSlugs) {
      const res = await client.query("DELETE FROM blogs WHERE slug = $1", [slug]);
      console.log(`Deleted blog '${slug}': ${res.rowCount} row(s) deleted`);
    }

    // Now re-export backup.sql
    console.log('\nRe-exporting clean backup.sql...');
    let sqlDump = `-- PropertysDeal SEO Engine PostgreSQL Full Database Backup\n-- Generated: ${new Date().toISOString()}\n\n`;

    const schemaPath = path.join(process.cwd(), 'sql', 'schema.sql');
    sqlDump += fs.readFileSync(schemaPath, 'utf8') + '\n\n';

    // Clear blogs table completely in backup.sql so DB import drops existing custom rows!
    sqlDump += `-- Truncate blogs table before insert\nTRUNCATE TABLE blogs CASCADE;\n\n`;

    const tables = [
      'states',
      'cities',
      'localities',
      'property_types',
      'keywords',
      'seo_templates',
      'schema_templates',
      'faqs',
      'blogs'
    ];

    for (const table of tables) {
      const tableRes = await client.query(`SELECT * FROM ${table}`);
      sqlDump += `-- Data for Table: ${table}\n`;

      for (const row of tableRes.rows) {
        const keys = Object.keys(row);
        const values = keys.map((k) => {
          const val = row[k];
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
    console.log(`🎉 SUCCESS! Clean backup.sql saved to: ${backupPath}`);

  } catch (err) {
    console.error('Error deleting custom blogs:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

deleteCustomBlogsAndReexport();
