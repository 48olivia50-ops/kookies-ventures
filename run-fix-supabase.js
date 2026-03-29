import pg from 'pg';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runSQL() {
    // Get the DIRECT_URL from environment (for superuser access)
    const connectionString = process.env.DIRECT_URL;

    if (!connectionString) {
        console.error('❌ DIRECT_URL environment variable is not set');
        process.exit(1);
    }

    console.log('🔌 Connecting to Supabase database...');

    const client = new pg.Client({
        connectionString,
        // Supabase may require SSL
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        // Determine which SQL file to run based on command line argument
        const sqlFile = process.argv[2] || 'fix-supabase-migrations.sql';
        console.log(`📝 Running SQL file: ${sqlFile}`);

        const sql = readFileSync(join(__dirname, sqlFile), 'utf-8');
        await client.query(sql);

        console.log('✅ SQL executed successfully!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.message.includes('authentication failed')) {
            console.error('');
            console.error('⚠️  Authentication failed. Please check your database credentials in .env');
        }
        process.exit(1);
    } finally {
        await client.end();
        console.log('🔌 Connection closed');
    }
}

runSQL();
