import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get user from JWT
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Check if user is manager
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role, is_manager')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'manager' && !profile.is_manager)) {
      return new Response(
        JSON.stringify({ error: 'Acesso negado. Apenas gestores podem ver todas as solicitações.' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get pending requests with user profile data
    const { data, error } = await supabaseClient
      .from('solicitacoes')
      .select(`
        *,
        profiles!solicitacoes_user_id_fkey (
          name,
          email,
          employee_type
        )
      `)
      .eq('status', 'pendente')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching pending requests:', error)
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar solicitações pendentes' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(
      JSON.stringify({ data }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})