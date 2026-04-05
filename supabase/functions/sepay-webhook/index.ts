const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { transferAmount, content: description } = body

    if (!transferAmount || !description) {
      return new Response(JSON.stringify({ success: false, message: 'Missing data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Normalize: uppercase, remove spaces
    const normalizedDesc = description.toUpperCase().replace(/\s+/g, '')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Find order matching description
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .neq('status', 'deposit_paid')

    if (!orders || orders.length === 0) {
      return new Response(JSON.stringify({ success: false, message: 'No pending orders' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const matchedOrder = orders.find((o: any) => {
      const normalizedCode = o.order_code.toUpperCase().replace(/\s+/g, '')
      return normalizedDesc.includes(normalizedCode)
    })

    if (!matchedOrder) {
      return new Response(JSON.stringify({ success: false, message: 'No matching order' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const depositAmount = Math.round(matchedOrder.total * 0.5)

    if (transferAmount >= depositAmount) {
      // Update order status
      await supabase
        .from('orders')
        .update({ status: 'deposit_paid' })
        .eq('id', matchedOrder.id)

      // Send confirmation email
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const updatedOrder = { ...matchedOrder, status: 'deposit_paid' }
      
      await fetch(`${supabaseUrl}/functions/v1/send-order-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        },
        body: JSON.stringify({ order: updatedOrder, type: 'deposit_paid' }),
      }).catch(console.error)

      return new Response(JSON.stringify({ success: true, order_code: matchedOrder.order_code }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: false, message: 'Amount insufficient' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('Webhook error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
