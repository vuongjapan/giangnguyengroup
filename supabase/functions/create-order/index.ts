const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!

function generateOrderCode() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const random = String(Math.floor(1000 + Math.random() * 9000))
  return `SEVQR GN${y}${m}${d}${random}`
}

async function getAuthenticatedUserId(req: Request) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: { user }, error } = await authClient.auth.getUser()
  if (error || !user) return null
  return user.id
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const customer = body.customer || {}
    const items = Array.isArray(body.items) ? body.items : []
    const subtotal = Math.max(0, Math.round(Number(body.totalPrice || 0)))
    const hotelDiscount = Math.max(0, Math.round(Number(body.hotelDiscount || 0)))
    const pointsEarned = Math.max(0, Math.round(Number(body.pointsEarned || 0)))
    const couponCode = String(body.couponCode || '').trim().toUpperCase()

    if (!customer.name?.trim() || !customer.phone?.trim() || !customer.address?.trim()) {
      return new Response(JSON.stringify({ error: 'Thiếu thông tin khách hàng' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!items.length || subtotal <= 0) {
      return new Response(JSON.stringify({ error: 'Đơn hàng không hợp lệ' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userId = await getAuthenticatedUserId(req)
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
    const afterHotelPrice = Math.max(0, subtotal - hotelDiscount)

    let appliedCoupon: any = null
    let couponDiscount = 0

    if (couponCode) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode)
        .eq('is_active', true)
        .maybeSingle()

      if (!coupon) {
        return new Response(JSON.stringify({ error: 'Mã giảm giá không hợp lệ' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        return new Response(JSON.stringify({ error: 'Mã giảm giá đã hết hạn' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (coupon.used_count >= coupon.max_uses) {
        return new Response(JSON.stringify({ error: 'Mã giảm giá đã hết lượt sử dụng' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (afterHotelPrice < coupon.min_order) {
        return new Response(JSON.stringify({ error: `Đơn tối thiểu ${coupon.min_order.toLocaleString('vi-VN')}₫` }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      appliedCoupon = coupon
      couponDiscount = Math.round(afterHotelPrice * coupon.discount_percent / 100)
    }

    const total = Math.max(0, afterHotelPrice - couponDiscount)
    const orderCode = generateOrderCode()

    const { data: createdOrder, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_code: orderCode,
        customer_name: customer.name.trim(),
        customer_phone: customer.phone.trim(),
        customer_email: String(customer.email || '').trim(),
        customer_address: customer.address.trim(),
        items,
        total,
        status: 'pending',
        user_id: userId,
        points_earned: userId ? pointsEarned : 0,
        points_used: 0,
      })
      .select('*')
      .single()

    if (orderError) throw orderError

    // Update coupon usage (optimistic lock)
    if (appliedCoupon) {
      await supabase
        .from('coupons')
        .update({ used_count: appliedCoupon.used_count + 1 })
        .eq('id', appliedCoupon.id)
        .eq('used_count', appliedCoupon.used_count)
    }

    const orderForEmail = {
      ...createdOrder,
      subtotal,
      hotel_discount: hotelDiscount,
      coupon_code: appliedCoupon?.code || null,
      coupon_discount: couponDiscount,
    }

    // Send email (non-blocking, don't fail order if email fails)
    let emailSent = true
    try {
      const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-order-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ order: orderForEmail, type: 'new_order' }),
      })

      if (!emailResponse.ok) {
        emailSent = false
        const errText = await emailResponse.text()
        console.error('Email failed:', emailResponse.status, errText)
      }
    } catch (emailError) {
      emailSent = false
      console.error('Email error:', emailError)
    }

    return new Response(JSON.stringify({
      success: true,
      emailSent,
      order: orderForEmail,
      depositAmount: Math.round(total * 0.5),
      remainingAmount: total - Math.round(total * 0.5),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Create order error:', error)
    return new Response(JSON.stringify({ error: error.message || 'Không thể tạo đơn hàng' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
