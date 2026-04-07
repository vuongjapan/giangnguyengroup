const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orderCode, customerPhone, customerEmail } = await req.json()
    const normalizedOrderCode = String(orderCode || '').trim()
    const normalizedPhone = String(customerPhone || '').trim()
    const normalizedEmail = String(customerEmail || '').trim().toLowerCase()

    if (!normalizedOrderCode || (!normalizedPhone && !normalizedEmail)) {
      return new Response(JSON.stringify({ error: 'Thiếu mã đơn hoặc thông tin xác minh' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
    let query = supabase
      .from('orders')
      .select('order_code,status,updated_at,total,customer_phone,customer_email')
      .eq('order_code', normalizedOrderCode)

    query = normalizedPhone ? query.eq('customer_phone', normalizedPhone) : query.eq('customer_email', normalizedEmail)

    const { data: order, error } = await query.maybeSingle()
    if (error) throw error

    if (!order) {
      return new Response(JSON.stringify({ error: 'Không tìm thấy đơn hàng' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({
      success: true,
      status: order.status,
      orderCode: order.order_code,
      updatedAt: order.updated_at,
      total: order.total,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Order status error:', error)
    return new Response(JSON.stringify({ error: error.message || 'Không thể kiểm tra trạng thái đơn hàng' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})