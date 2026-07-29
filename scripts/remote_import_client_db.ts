import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const clientDbUrl = 'postgresql://postgres:postgrespassword@173.212.254.242:5432/seo_engine';

async function remoteImport() {
  console.log('Connecting to client remote database at:', clientDbUrl);
  const pool = new Pool({ connectionString: clientDbUrl, ssl: false, connectionTimeoutMillis: 10000 });

  try {
    const client = await pool.connect();
    console.log('✅ Connected successfully to remote client database!');

    const backupPath = path.join(process.cwd(), 'backup.sql');
    console.log('Reading backup.sql file...');
    const sqlContent = fs.readFileSync(backupPath, 'utf8');

    console.log('Executing backup.sql on client database (this may take a few seconds)...');
    await client.query(sqlContent);

    console.log('🎉 SUCCESS! backup.sql executed successfully on remote client database!');

    const checkRes = await client.query('SELECT count(*) FROM blogs');
    console.log('Total blogs now in client DB:', checkRes.rows[0].count);

    const checkRealEstate = await client.query("SELECT id, slug FROM blogs WHERE slug = 'real-estate-gujarat'");
    console.log('real-estate-gujarat exists in client DB?', checkRealEstate.rows.length > 0);

    client.release();
  } catch (err) {
    console.error('❌ Remote import error:', err);
  } finally {
    await pool.end();
  }
}

remoteImport();
