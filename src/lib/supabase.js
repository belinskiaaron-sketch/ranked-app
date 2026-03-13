import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pvedlsqerrrfbrlbaong.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2ZWRsc3FlcnJyZmJybGJhb25nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MzY2MTEsImV4cCI6MjA4OTAxMjYxMX0.lyK8C89Giktw6VPpWRSWurKRwQ_BsoUQjl86it-lg8M'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
