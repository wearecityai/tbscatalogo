
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load env vars from .env.local
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    console.log('Testing Supabase connection...');
    console.log('URL:', supabaseUrl);

    try {
        // 1. Test Read
        console.log('\n1. Testing Read (collections)...');
        const { data: readData, error: readError } = await supabase
            .from('collections')
            .select('*')
            .limit(1);

        if (readError) {
            console.error('Read Error:', readError);
        } else {
            console.log('Read Success. Count:', readData.length);
        }

        // 2. Test Write
        console.log('\n2. Testing Write (collections)...');
        const testName = `test_collection_${Date.now()}`;
        const { data: writeData, error: writeError } = await supabase
            .from('collections')
            .insert({ name: testName, description: 'Test description' })
            .select();

        if (writeError) {
            console.error('Write Error:', writeError);
        } else {
            console.log('Write Success:', writeData);

            // Cleanup
            console.log('Cleaning up...');
            await supabase.from('collections').delete().eq('name', testName);
        }

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

testConnection();
