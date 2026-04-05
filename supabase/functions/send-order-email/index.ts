const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SMTP_EMAIL = Deno.env.get('SMTP_EMAIL') || ''
const SMTP_PASSWORD = Deno.env.get('SMTP_PASSWORD') || ''

async function sendEmail(to: string, subject: string, html: string) {
  // Use Deno's SMTP via fetch to Gmail
  const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: SMTP_EMAIL, name: 'Giang Nguyen Seafood' },
      subject,
      content: [{ type: 'text/html', value: html }],
    }),
  }).catch(() => null)

  // Fallback: use Supabase Edge Function with resend-like approach
  // For now, use a simple SMTP relay approach
  if (!response || !response.ok) {
    // Try direct SMTP via Deno
    const { SMTPClient } = await import('https://deno.land/x/denomailer@1.6.0/mod.ts')
    const client = new SMTPClient({
      connection: {
        hostname: 'smtp.gmail.com',
        port: 587,
        tls: true,
        auth: { username: SMTP_EMAIL, password: SMTP_PASSWORD },
      },
    })
    await client.send({
      from: SMTP_EMAIL,
      to,
      subject,
      content: 'auto',
      html,
    })
    await client.close()
  }
}

function generateInvoiceHtml(order: any) {
  const items = order.items || []
  const totalAmount = order.total || 0
  const depositAmount = Math.round(totalAmount * 0.5)
  const remainingAmount = totalAmount - depositAmount
  const orderCode = order.order_code || ''
  const qrUrl = `https://qr.sepay.vn/img?acc=104002912582&bank=VietinBank&amount=${depositAmount}&des=${encodeURIComponent(orderCode)}`
  const status = order.status === 'deposit_paid' ? '✅ ĐÃ CỌC 50%' : '⏳ CHƯA THANH TOÁN'
  const statusColor = order.status === 'deposit_paid' ? '#16a34a' : '#ea580c'

  const itemRows = items.map((item: any, i: number) => `
    <tr style="border-bottom:1px solid #e5e7eb;">
      <td style="padding:10px;text-align:center;font-size:13px;">${i + 1}</td>
      <td style="padding:10px;font-size:13px;">${item.name || ''}</td>
      <td style="padding:10px;text-align:center;font-size:13px;">${item.unit || 'kg'}</td>
      <td style="padding:10px;text-align:center;font-size:13px;">${item.quantity || 1}</td>
      <td style="padding:10px;text-align:right;font-size:13px;">${(item.price || 0).toLocaleString('vi-VN')}₫</td>
      <td style="padding:10px;text-align:right;font-size:13px;font-weight:bold;">${((item.price || 0) * (item.quantity || 1)).toLocaleString('vi-VN')}₫</td>
    </tr>
  `).join('')

  return `
<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f3f4f6;">
<div style="max-width:650px;margin:20px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#0369a1,#0ea5e9);padding:30px;text-align:center;">
    <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;letter-spacing:1px;">GIANG NGUYEN SEAFOOD</h1>
    <p style="margin:5px 0 0;color:rgba(255,255,255,0.85);font-size:12px;">Hải sản khô Sầm Sơn – Chất lượng tận tâm</p>
  </div>

  <!-- Invoice Title -->
  <div style="text-align:center;padding:20px 30px 10px;">
    <h2 style="margin:0;font-size:20px;color:#1e293b;font-weight:800;">HÓA ĐƠN ĐẶT HÀNG</h2>
    <p style="margin:6px 0 0;font-size:13px;color:#64748b;">Mã đơn: <strong style="color:#0369a1;">${orderCode}</strong></p>
    <p style="margin:4px 0 0;font-size:12px;color:#64748b;">Ngày: ${new Date().toLocaleDateString('vi-VN')}</p>
  </div>

  <!-- Status Badge -->
  <div style="text-align:center;padding:10px 30px;">
    <span style="display:inline-block;padding:6px 20px;border-radius:20px;background:${statusColor};color:#fff;font-size:13px;font-weight:700;">${status}</span>
  </div>

  <!-- Customer Info -->
  <div style="padding:15px 30px;">
    <div style="background:#f8fafc;border-radius:8px;padding:15px;border:1px solid #e2e8f0;">
      <h3 style="margin:0 0 8px;font-size:14px;color:#1e293b;">Thông tin khách hàng</h3>
      <p style="margin:3px 0;font-size:13px;color:#475569;">👤 ${order.customer_name || ''}</p>
      <p style="margin:3px 0;font-size:13px;color:#475569;">📞 ${order.customer_phone || ''}</p>
      ${order.customer_email ? `<p style="margin:3px 0;font-size:13px;color:#475569;">📧 ${order.customer_email}</p>` : ''}
      <p style="margin:3px 0;font-size:13px;color:#475569;">📍 ${order.customer_address || ''}</p>
    </div>
  </div>

  <!-- Products Table -->
  <div style="padding:0 30px;">
    <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
      <thead>
        <tr style="background:#f1f5f9;">
          <th style="padding:10px;font-size:12px;color:#475569;text-align:center;">STT</th>
          <th style="padding:10px;font-size:12px;color:#475569;text-align:left;">Sản phẩm</th>
          <th style="padding:10px;font-size:12px;color:#475569;text-align:center;">ĐVT</th>
          <th style="padding:10px;font-size:12px;color:#475569;text-align:center;">SL</th>
          <th style="padding:10px;font-size:12px;color:#475569;text-align:right;">Đơn giá</th>
          <th style="padding:10px;font-size:12px;color:#475569;text-align:right;">Thành tiền</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>
  </div>

  <!-- Totals -->
  <div style="padding:15px 30px;">
    <div style="background:#f8fafc;border-radius:8px;padding:15px;border:1px solid #e2e8f0;">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:13px;">
        <span style="color:#475569;">Tổng tiền hàng:</span>
        <span style="font-weight:700;color:#1e293b;">${totalAmount.toLocaleString('vi-VN')}₫</span>
      </div>
      ${order.coupon_discount ? `
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:13px;">
        <span style="color:#16a34a;">Giảm giá (mã ${order.coupon_code || ''}):</span>
        <span style="font-weight:700;color:#16a34a;">-${order.coupon_discount.toLocaleString('vi-VN')}₫</span>
      </div>` : ''}
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:14px;border-top:1px solid #e2e8f0;padding-top:8px;">
        <span style="color:#ea580c;font-weight:700;">Cọc 50%:</span>
        <span style="font-weight:800;color:#ea580c;font-size:16px;">${depositAmount.toLocaleString('vi-VN')}₫</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:13px;">
        <span style="color:#475569;">Còn lại:</span>
        <span style="font-weight:700;color:#1e293b;">${remainingAmount.toLocaleString('vi-VN')}₫</span>
      </div>
    </div>
  </div>

  <!-- QR Payment -->
  <div style="text-align:center;padding:15px 30px;">
    <h3 style="margin:0 0 10px;font-size:15px;color:#1e293b;">Quét QR để thanh toán cọc</h3>
    <img src="${qrUrl}" alt="QR thanh toán" width="200" height="200" style="border-radius:8px;border:2px solid #e2e8f0;" />
    <div style="margin-top:10px;background:#fef3c7;border-radius:8px;padding:12px;border:1px solid #fbbf24;">
      <p style="margin:2px 0;font-size:12px;color:#92400e;">🏦 Ngân hàng: <strong>VietinBank</strong></p>
      <p style="margin:2px 0;font-size:12px;color:#92400e;">👤 Chủ TK: <strong>VAN THI MINH LINH</strong></p>
      <p style="margin:2px 0;font-size:12px;color:#92400e;">💳 STK: <strong>104002912582</strong></p>
      <p style="margin:2px 0;font-size:12px;color:#92400e;">📝 Nội dung CK: <strong style="color:#dc2626;">${orderCode}</strong></p>
      <p style="margin:2px 0;font-size:12px;color:#92400e;">💰 Số tiền cọc: <strong style="color:#dc2626;">${depositAmount.toLocaleString('vi-VN')}₫</strong></p>
    </div>
  </div>

  <!-- Footer -->
  <div style="background:#f8fafc;padding:20px 30px;text-align:center;border-top:1px solid #e2e8f0;">
    <p style="margin:0;font-size:12px;color:#64748b;">Hotline: <strong>098.661.7939</strong> | Zalo: <strong>098.661.7939</strong></p>
    <p style="margin:4px 0 0;font-size:11px;color:#94a3b8;">© ${new Date().getFullYear()} Giang Nguyen Seafood – Sầm Sơn, Thanh Hóa</p>
  </div>

</div>
</body>
</html>`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { order, type } = await req.json()
    if (!order || !order.order_code) {
      return new Response(JSON.stringify({ error: 'Missing order data' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const invoiceHtml = generateInvoiceHtml(order)

    const emailPromises: Promise<void>[] = []

    // Send to customer
    if (order.customer_email) {
      const customerSubject = type === 'deposit_paid'
        ? `✅ Xác nhận cọc ${order.order_code} - Giang Nguyen Seafood`
        : `🧾 Hóa đơn ${order.order_code} - Chưa thanh toán`
      emailPromises.push(sendEmail(order.customer_email, customerSubject, invoiceHtml))
    }

    // Send to admin
    const adminSubject = type === 'deposit_paid'
      ? `✅ Đã cọc: ${order.order_code} - ${order.customer_name}`
      : `🆕 Đơn mới: ${order.order_code} - ${order.customer_name}`
    emailPromises.push(sendEmail(SMTP_EMAIL, adminSubject, invoiceHtml))

    await Promise.allSettled(emailPromises)

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('Email error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
