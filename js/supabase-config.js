// ============================================================
// SUPABASE CONFIGURATION
// Replace with your actual Supabase Project URL and Anon Key
//https://exrqzgznqyqtfuwuszyk.supabase.co
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4cnF6Z3pucXlxdGZ1d3VzenlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMTU0MDIsImV4cCI6MjA5MTU5MTQwMn0.MkXXB_xeoBRT9aB2VL_BOM37zdQ6LjH6bvRkkIIi55o
// ============================================================

const SUPABASE_URL = 'https://exrqzgznqyqtfuwuszyk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4cnF6Z3pucXlxdGZ1d3VzenlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMTU0MDIsImV4cCI6MjA5MTU5MTQwMn0.MkXXB_xeoBRT9aB2VL_BOM37zdQ6LjH6bvRkkIIi55o';

// 🚀 Initialize Supabase client ONLY ONCE
const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// 🌐 Make it globally accessible
window.supabaseClient = supabaseClient;

// ✅ Debug message
console.log('✅ Supabase connected successfully');