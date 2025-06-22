import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://haiwteyfxsxoekzkoeqx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhaXd0ZXlmeHN4b2VremtvZXF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1OTE1NzYsImV4cCI6MjA2NTE2NzU3Nn0.lFu_DRplxTDy1FB9VyRkO5cjCtju0sLolwafrdSk44A'

export const supabase = createClient(supabaseUrl, supabaseKey)


