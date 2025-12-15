
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://gafppeuwivrxpizulexf.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhZnBwZXV3aXZyeHBpenVsZXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMTczNTcsImV4cCI6MjA4MDc5MzM1N30._jyWcrZlbcaMN_56Qqw2nYgRdGuGrDMKk7F1AMn0lG0';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: Could not find Supabase credentials (checked .env.local and hardcoded fallbacks)');
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
