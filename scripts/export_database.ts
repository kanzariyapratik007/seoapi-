import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL environment variable is missing.');
  process.exit(1);
}

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

async function main() {
  console.log('Generating full self-contained PostgreSQL database backup.sql (Schema + Data)...');
  const client = await pool.connect();

  try {
    const schemaPath = path.join(process.cwd(), 'sql', 'schema.sql');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');

    let sqlDump = `-- PropertysDeal SEO Engine PostgreSQL Full Database Backup (Schema + Data)
-- Generated: ${new Date().toISOString()}

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- ============================================================================
-- 1. DATABASE SCHEMA CREATION (TABLES & ENUMS)
-- ============================================================================
${schemaContent}

-- ============================================================================
-- 2. DATA INSERTIONS
-- ============================================================================
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

      sqlDump += `-- Data for Table: ${table}\n`;

      for (const row of res.rows) {
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
      sqlDump += `\n`;
    }

    const backupPath = path.join(process.cwd(), 'backup.sql');
    fs.writeFileSync(backupPath, sqlDump, 'utf8');
    console.log(`🎉 SUCCESS! Complete database backup created at: ${backupPath}`);

  } catch (err) {
    console.error('Error generating database backup:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
