const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

import nodemailer from 'npm:nodemailer@6.9.16'

const SMTP_EMAIL = Deno.env.get('SMTP_EMAIL') || 'giangnguyendriedseafood@gmail.com'
const SMTP_PASSWORD = Deno.env.get('SMTP_PASSWORD') || ''
const SMTP_HOST = 'smtp.gmail.com'
const SMTP_PORT = 587

function createTransporter() {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false,
    requireTLS: true,
    auth: {
      user: SMTP_EMAIL,
      pass: SMTP_PASSWORD,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  })
}

async function sendEmail(
  transporter: nodemailer.Transporter,
  to: string,
  subject: string,
  html: string,
) {
  const info = await transporter.sendMail({
    from: `GIANG NGUYÊN GROUP <${SMTP_EMAIL}>`,
    to,
    subject,
    html,
  })

  console.log('Email sent', { to, subject, messageId: info.messageId })
  return info
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

  return `<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f3f4f6;">
<div style="max-width:650px;margin:20px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
  <div style="background:linear-gradient(135deg,#0369a1,#0ea5e9);padding:30px;text-align:center;">
    <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;letter-spacing:1px;">GIANG NGUYEN SEAFOOD</h1>
    <p style="margin:5px 0 0;color:rgba(255,255,255,0.85);font-size:12px;">Hải sản khô Sầm Sơn – Chất lượng tận tâm</p>
  </div>
  <div style="text-align:center;padding:20px 30px 10px;">
    <h2 style="margin:0;font-size:20px;color:#1e293b;font-weight:800;">HÓA ĐƠN ĐẶT HÀNG</h2>
    <p style="margin:6px 0 0;font-size:13px;color:#64748b;">Mã đơn: <strong style="color:#0369a1;">${orderCode}</strong></p>
    <p style="margin:4px 0 0;font-size:12px;color:#64748b;">Ngày: ${new Date().toLocaleDateString('vi-VN')}</p>
  </div>
  <div style="text-align:center;padding:10px 30px;">
    <span style="display:inline-block;padding:6px 20px;border-radius:20px;background:${statusColor};color:#fff;font-size:13px;font-weight:700;">${status}</span>
  </div>
  <div style="padding:15px 30px;">
    <div style="background:#f8fafc;border-radius:8px;padding:15px;border:1px solid #e2e8f0;">
      <h3 style="margin:0 0 8px;font-size:14px;color:#1e293b;">Thông tin khách hàng</h3>
      <p style="margin:3px 0;font-size:13px;color:#475569;">👤 ${order.customer_name || ''}</p>
      <p style="margin:3px 0;font-size:13px;color:#475569;">📞 ${order.customer_phone || ''}</p>
      ${order.customer_email ? `<p style="margin:3px 0;font-size:13px;color:#475569;">📧 ${order.customer_email}</p>` : ''}
      <p style="margin:3px 0;font-size:13px;color:#475569;">📍 ${order.customer_address || ''}</p>
    </div>
  </div>
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
  <div style="padding:15px 30px;">
    <div style="background:#f8fafc;border-radius:8px;padding:15px;border:1px solid #e2e8f0;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:4px 0;font-size:13px;color:#475569;">Tổng tiền hàng:</td><td style="padding:4px 0;font-size:13px;font-weight:700;color:#1e293b;text-align:right;">${totalAmount.toLocaleString('vi-VN')}₫</td></tr>
        ${order.coupon_discount ? `<tr><td style="padding:4px 0;font-size:13px;color:#16a34a;">Giảm giá (mã ${order.coupon_code || ''}):</td><td style="padding:4px 0;font-size:13px;font-weight:700;color:#16a34a;text-align:right;">-${order.coupon_discount.toLocaleString('vi-VN')}₫</td></tr>` : ''}
        <tr style="border-top:1px solid #e2e8f0;"><td style="padding:8px 0 4px;font-size:14px;color:#ea580c;font-weight:700;">Cọc 50%:</td><td style="padding:8px 0 4px;font-size:16px;font-weight:800;color:#ea580c;text-align:right;">${depositAmount.toLocaleString('vi-VN')}₫</td></tr>
        <tr><td style="padding:4px 0;font-size:13px;color:#475569;">Còn lại:</td><td style="padding:4px 0;font-size:13px;font-weight:700;color:#1e293b;text-align:right;">${remainingAmount.toLocaleString('vi-VN')}₫</td></tr>
      </table>
    </div>
  </div>
  ${order.status !== 'deposit_paid' ? `
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
  </div>` : ''}
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
    if (!SMTP_EMAIL || !SMTP_PASSWORD) {
      throw new Error('SMTP chưa được cấu hình đầy đủ')
    }

    const invoiceHtml = generateInvoiceHtml(order)
    const transporter = createTransporter()
    await transporter.verify()

    const emailPromises: Promise<unknown>[] = []

    if (order.customer_email) {
      const customerSubject = type === 'deposit_paid'
        ? `Hóa đơn ${order.order_code} - Đã cọc 50%`
        : `Hóa đơn ${order.order_code} - Chưa thanh toán`
      emailPromises.push(sendEmail(transporter, order.customer_email, customerSubject, invoiceHtml))
    }

    const adminSubject = type === 'deposit_paid'
      ? `Đã cọc 50% ${order.order_code}`
      : `Đơn mới ${order.order_code}`
    emailPromises.push(sendEmail(transporter, SMTP_EMAIL, adminSubject, invoiceHtml))

    const results = await Promise.allSettled(emailPromises)
    transporter.close()

    const failures = results.filter((result) => result.status === 'rejected') as PromiseRejectedResult[]
    if (failures.length > 0) {
      console.error('Email send failures', failures.map((failure) => String(failure.reason)))
      throw new Error(failures.map((failure) => String(failure.reason)).join(' | '))
    }

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
