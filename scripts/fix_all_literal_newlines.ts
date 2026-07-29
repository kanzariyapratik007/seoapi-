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
  console.log('Fixing literal \\n escape sequences across all blogs in PostgreSQL database...');
  const client = await pool.connect();

  try {
    // 1. Fetch all blogs
    const res = await client.query('SELECT id, slug, content FROM blogs');
    let fixedCount = 0;

    for (const row of res.rows) {
      if (row.content && (row.content.includes('\\n') || row.content.includes('\\r'))) {
        // Replace literal \n with real newline character \n
        const fixedContent = row.content.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n').replace(/\\r/g, '\n');

        await client.query('UPDATE blogs SET content = $1 WHERE id = $2', [fixedContent, row.id]);
        fixedCount++;
      }
    }

    console.log(`✅ Successfully fixed ${fixedCount} blogs in PostgreSQL database!`);

    // 2. Re-export database backup with REAL newlines inside SQL multiline string literals
    console.log('Re-exporting backup.sql with clean multiline formatting...');
    let sqlDump = `-- PropertysDeal SEO Engine PostgreSQL Database Backup (Fixed Newlines)
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
      const tableRes = await client.query(`SELECT * FROM ${table}`);
      sqlDump += `-- Data for Name: ${table}; Type: TABLE DATA;\n`;

      for (const row of tableRes.rows) {
        const keys = Object.keys(row);
        const values = keys.map((k) => {
          const val = row[k];
          if (val === null || val === undefined) return 'NULL';
          if (typeof val === 'number' || typeof val === 'boolean') return val;
          if (val instanceof Date) return `'${val.toISOString()}'`;
          // Escape single quotes correctly while preserving real multiline newlines
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
    console.error('Error fixing literal newlines:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
