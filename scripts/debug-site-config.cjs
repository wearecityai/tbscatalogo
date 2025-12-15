
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://gafppeuwivrxpizulexf.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhZnBwZXV3aXZyeHBpenVsZXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMTczNTcsImV4cCI6MjA4MDc5MzM1N30._jyWcrZlbcaMN_56Qqw2nYgRdGuGrDMKk7F1AMn0lG0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugSiteConfig() {
    console.log('Debugging Site Config...');

    try {
        // 1. Check if row exists
        console.log('\n1. Checking if site_config row exists...');
        const { data: readData, error: readError } = await supabase
            .from('site_config')
            .select('*')
            .eq('id', 1);

        if (readError) {
            console.error('Read Error:', readError);
        } else {
            console.log('Read Result:', readData);
            if (readData.length === 0) {
                console.log('WARNING: Row with id=1 does NOT exist.');
            }
        }

        // 2. Try to Upsert
        console.log('\n2. Trying to Upsert site_config...');
        const { data: upsertData, error: upsertError } = await supabase
            .from('site_config')
            .upsert({
                id: 1,
                site_name: 'Lumina Debug',
                logo_url: null,
                footer_text: 'Debug Footer',
                social_links: []
            })
            .select();

        if (upsertError) {
            console.error('Upsert Error (FULL OBJECT):', JSON.stringify(upsertError, null, 2));
        } else {
            console.log('Upsert Success:', upsertData);
        }

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

debugSiteConfig();
