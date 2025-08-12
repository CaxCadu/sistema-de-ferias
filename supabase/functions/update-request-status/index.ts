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
        JSON.stringify({ error: 'Acesso negado. Apenas gestores podem atualizar solicitações.' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Parse request body
    const { request_id, status } = await req.json()

    // Validate required fields
    if (!request_id || !status) {
      return new Response(
        JSON.stringify({ error: 'Campos obrigatórios: request_id, status' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Validate status
    const validStatuses = ['pendente', 'aprovado', 'rejeitado', 'rh_notificado']
    if (!validStatuses.includes(status)) {
      return new Response(
        JSON.stringify({ error: 'Status inválido' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Update request status
    const { data, error } = await supabaseClient
      .from('solicitacoes')
      .update({
        status,
        approved_at: status !== 'pendente' ? new Date().toISOString() : null,
        approved_by: status !== 'pendente' ? user.id : null
      })
      .eq('id', request_id)
      .select()
      .single()

    if (error) {
      console.error('Error updating request status:', error)
      return new Response(
        JSON.stringify({ error: 'Erro ao atualizar status da solicitação' }),
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