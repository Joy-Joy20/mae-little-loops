import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pafabwbjzjvkgatbirko.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhZmFid2Jqemp2a2dhdGJpcmtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3OTg3NjYsImV4cCI6MjA5MTM3NDc2Nn0.awMxPalEb94oE17229mymLbMqJKqYvrEHpidiNmcJSg";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
