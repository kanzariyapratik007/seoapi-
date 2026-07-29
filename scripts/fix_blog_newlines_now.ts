import { Pool } from 'pg';
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL environment variable is missing.');
  process.exit(1);
}

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

async function main() {
  console.log('Inspecting and fixing all raw literal slash-n strings in PostgreSQL database...');
  const client = await pool.connect();

  try {
    const res = await client.query('SELECT id, slug, content FROM blogs');
    let fixedCount = 0;

    for (const row of res.rows) {
      if (!row.content) continue;

      // Check if string contains literal "\n" (two characters: \ and n)
      if (row.content.indexOf('\\n') !== -1 || row.content.indexOf('\\r') !== -1) {
        // Replace all literal \r\n and \n with actual newline character \n
        const newContent = row.content
          .replace(/\\r\\n/g, '\n')
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\n');

        await client.query('UPDATE blogs SET content = $1, updated_at = NOW() WHERE id = $2', [newContent, row.id]);
        fixedCount++;
        console.log(`Fixed literal \\n for blog id ${row.id}: ${row.slug}`);
      }
    }

    console.log(`\n🎉 TOTAL BLOGS FIXED WITH REAL NEWLINES: ${fixedCount}`);

    // Check flat-gift-city-gandhinagar content after fix
    const checkRes = await client.query("SELECT content FROM blogs WHERE slug = 'flat-gift-city-gandhinagar'");
    if (checkRes.rows.length > 0) {
      console.log('\n--- SAMPLE GIFT CITY BLOG CONTENT SNIPPET AFTER FIX ---');
      console.log(checkRes.rows[0].content.substring(0, 300));
    }

    // Now re-export database backup backup.sql with clean real multiline string literals
    console.log('\nRe-exporting clean backup.sql file...');
    let sqlDump = `-- PropertysDeal SEO Engine PostgreSQL Full Database Backup
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
`;

    const schemaPath = path.join(process.cwd(), 'sql', 'schema.sql');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    sqlDump += schemaContent + '\n\n';

    sqlDump += `-- ============================================================================
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
      const tableRes = await client.query(`SELECT * FROM ${table}`);
      sqlDump += `-- Data for Table: ${table}\n`;

      for (const row of tableRes.rows) {
        const keys = Object.keys(row);
        const values = keys.map((k) => {
          const val = row[k];
          if (val === null || val === undefined) return 'NULL';
          if (typeof val === 'number' || typeof val === 'boolean') return val;
          if (val instanceof Date) return `'${val.toISOString()}'`;
          // Preserve real multiline newlines inside single quotes for SQL import
          return `'${String(val).replace(/'/g, "''")}'`;
        });

        sqlDump += `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${values.join(', ')}) ON CONFLICT DO NOTHING;\n`;
      }
      sqlDump += `\n`;
    }

    const backupPath = path.join(process.cwd(), 'backup.sql');
    fs.writeFileSync(backupPath, sqlDump, 'utf8');
    console.log(`🎉 SUCCESS! Clean backup.sql re-exported to: ${backupPath}`);

  } catch (err) {
    console.error('Error fixing blog newlines:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
