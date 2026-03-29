import pg from 'pg';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function fixSupabaseMigrations() {
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

        // Read the SQL fix file
        const sqlFix = readFileSync(join(__dirname, 'fix-supabase-migrations.sql'), 'utf-8');

        console.log('📝 Executing migration fix...');
        await client.query(sqlFix);

        console.log('✅ Migration schema created successfully!');
        console.log('');
        console.log('The supabase_migrations.schema_migrations table has been created.');
        console.log('This should resolve the "relation does not exist" error.');

    } catch (error) {
        console.error('❌ Error fixing migrations:', error.message);
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

fixSupabaseMigrations();
