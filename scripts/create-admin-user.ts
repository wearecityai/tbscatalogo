// Script to create admin user in Supabase
// Run this once: npx tsx scripts/create-admin-user.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gafppeuwivrxpizulexf.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Use service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  const email = 'a.llorens.selles@gmail.com';
  const password = 'miaufaelgat';

  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    });

    if (error) {
      console.error('Error creating user:', error);
      return;
    }

    console.log('Admin user created successfully:', data.user?.email);
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

createAdminUser();

