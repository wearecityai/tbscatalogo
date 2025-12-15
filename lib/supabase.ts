import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gafppeuwivrxpizulexf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhZnBwZXV3aXZyeHBpenVsZXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMTczNTcsImV4cCI6MjA4MDc5MzM1N30._jyWcrZlbcaMN_56Qqw2nYgRdGuGrDMKk7F1AMn0lG0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

