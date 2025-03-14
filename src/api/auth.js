const supabase = require('@supabase/supabase-js')

exports.handler = async (event) => {
  const client = supabase.createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  )
  
  // Handle auth requests here
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Auth endpoint" })
  }
} 