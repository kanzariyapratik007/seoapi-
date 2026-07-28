import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL environment variable is missing.');
  process.exit(1);
}

const pool = new Pool({ connectionString });

async function main() {
  console.log('Generating full PostgreSQL database backup.sql...');
  const client = await pool.connect();

  try {
    let sqlDump = `-- PropertysDeal SEO Engine PostgreSQL Database Backup
-- Generated: ${new Date().toISOString()}

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

`;

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
      const res = await client.query(`SELECT * FROM ${table}`);
      console.log(`Exporting ${res.rows.length} rows from table '${table}'...`);

      sqlDump += `-- Data for Name: ${table}; Type: TABLE DATA;\n`;

      for (const row of res.rows) {
        const keys = Object.keys(row);
        const values = keys.map((k) => {
          const val = row[k];
          if (val === null || val === undefined) return 'NULL';
          if (typeof val === 'number' || typeof val === 'boolean') return val;
          if (val instanceof Date) return `'${val.toISOString()}'`;
          return `'${String(val).replace(/'/g, "''").replace(/\n/g, '\\n')}'`;
        });

        sqlDump += `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${values.join(', ')}) ON CONFLICT DO NOTHING;\n`;
      }
      sqlDump += `\n`;
    }

    const backupPath = path.join(process.cwd(), 'backup.sql');
    fs.writeFileSync(backupPath, sqlDump, 'utf8');
    console.log(`🎉 SUCCESS! Database backup created at: ${backupPath}`);

  } catch (err) {
    console.error('Error generating database backup:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
