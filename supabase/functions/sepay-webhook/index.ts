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
    console.log('SePay webhook received:', JSON.stringify(body))

    const transferAmount = Number(body.transferAmount ?? body.amount ?? body.creditAmount ?? 0)
    const description = String(body.content ?? body.description ?? body.transferContent ?? '')

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

    // Find pending orders only
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'pending')

    if (!orders || orders.length === 0) {
      console.log('No pending orders found')
      return new Response(JSON.stringify({ success: false, message: 'No pending orders' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const matchedOrder = orders.find((o: any) => {
      const normalizedCode = o.order_code.toUpperCase().replace(/\s+/g, '')
      return normalizedDesc.includes(normalizedCode)
    })

    if (!matchedOrder) {
      console.log('No matching order for description:', description)
      return new Response(JSON.stringify({ success: false, message: 'No matching order' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const depositAmount = Math.round(Number(matchedOrder.total || 0) * 0.5)

    if (transferAmount < depositAmount) {
      console.log(`Amount ${transferAmount} < deposit ${depositAmount}`)
      return new Response(JSON.stringify({ success: false, message: 'Amount insufficient' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Atomic update: only update if still pending (prevents double processing)
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({ status: 'deposit_paid' })
      .eq('id', matchedOrder.id)
      .eq('status', 'pending')
      .select('*')
      .maybeSingle()

    if (updateError) throw updateError

    if (!updatedOrder) {
      console.log('Order already processed:', matchedOrder.order_code)
      return new Response(JSON.stringify({ success: true, already_processed: true, order_code: matchedOrder.order_code }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Send deposit confirmation email
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    let emailSent = true

    try {
      const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-order-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        },
        body: JSON.stringify({ order: updatedOrder, type: 'deposit_paid' }),
      })

      if (!emailResponse.ok) {
        emailSent = false
        console.error('Deposit email failed:', await emailResponse.text())
      }
    } catch (emailError) {
      emailSent = false
      console.error('Deposit email error:', emailError)
    }

    console.log('Order paid:', updatedOrder.order_code, 'email_sent:', emailSent)

    return new Response(JSON.stringify({ success: true, order_code: matchedOrder.order_code, email_sent: emailSent }), {
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
