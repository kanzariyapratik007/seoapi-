import { Pool } from 'pg';
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function reexportBackupWithUpsert() {
  console.log('Generating backup.sql with UPDATE ON CONFLICT for PostgreSQL import...');
  const client = await pool.connect();

  try {
    let sqlDump = `-- PropertysDeal SEO Engine PostgreSQL Full Database Backup\n-- Generated: ${new Date().toISOString()}\n\n`;

    const schemaPath = path.join(process.cwd(), 'sql', 'schema.sql');
    sqlDump += fs.readFileSync(schemaPath, 'utf8') + '\n\n';

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

        if (table === 'blogs') {
          sqlDump += `INSERT INTO blogs (${keys.join(', ')}) VALUES (${values.join(', ')}) ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, title = EXCLUDED.title, updated_at = NOW();\n`;
        } else if (table === 'keywords') {
          sqlDump += `INSERT INTO keywords (${keys.join(', ')}) VALUES (${values.join(', ')}) ON CONFLICT (id) DO UPDATE SET phrase = EXCLUDED.phrase, is_active = EXCLUDED.is_active;\n`;
        } else {
          sqlDump += `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${values.join(', ')}) ON CONFLICT DO NOTHING;\n`;
        }
      }
      sqlDump += '\n';
    }

    const backupPath = path.join(process.cwd(), 'backup.sql');
    fs.writeFileSync(backupPath, sqlDump, 'utf8');
    console.log(`🎉 SUCCESS! Updated backup.sql with UPSERT saved to: ${backupPath}`);

  } catch (err) {
    console.error('Error re-exporting backup:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

reexportBackupWithUpsert();
