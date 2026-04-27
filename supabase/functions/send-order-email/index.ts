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

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  pending:      { label: 'ĐƠN MỚI - CHỜ XÁC NHẬN', color: '#92400e', bg: '#fef3c7', icon: '⏳' },
  confirmed:    { label: 'ĐÃ XÁC NHẬN',             color: '#1d4ed8', bg: '#dbeafe', icon: '✅' },
  deposit_paid: { label: 'ĐÃ CỌC 50%',                color: '#15803d', bg: '#dcfce7', icon: '💰' },
  shipping:     { label: 'ĐANG GIAO HÀNG',            color: '#6d28d9', bg: '#ede9fe', icon: '🚚' },
  delivered:    { label: 'HOÀN TẤT',                  color: '#166534', bg: '#bbf7d0', icon: '🎉' },
  cancelled:    { label: 'ĐÃ HUỶ',                    color: '#b91c1c', bg: '#fee2e2', icon: '✖️' },
}

function getSiteOrigin() {
  return Deno.env.get('SITE_ORIGIN') || 'https://giangnguyengroup.lovable.app'
}

function generateInvoiceHtml(order: any) {
  const items = order.items || []
  const totalAmount = order.total || 0
  const depositAmount = Math.round(totalAmount * 0.5)
  const remainingAmount = totalAmount - depositAmount
  const orderCode = order.order_code || ''
  const qrUrl = `https://qr.sepay.vn/img?acc=104002912582&bank=VietinBank&amount=${depositAmount}&des=${encodeURIComponent(orderCode)}`
  const st = STATUS_MAP[order.status as string] || STATUS_MAP.pending
  const trackUrl = `${getSiteOrigin()}/tra-cuu-don?code=${encodeURIComponent(orderCode)}&phone=${encodeURIComponent(order.customer_phone || '')}`
  const confirmDepositUrl = `${getSiteOrigin()}/tra-cuu-don?code=${encodeURIComponent(orderCode)}&phone=${encodeURIComponent(order.customer_phone || '')}&action=confirm_deposit`

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
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f0f4f8;">
<div style="max-width:650px;margin:20px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.1);">
  
  <!-- Header with gradient + logo emblem -->
  <div style="background:linear-gradient(135deg,#0c4a6e,#0369a1,#0ea5e9);padding:30px 30px 25px;text-align:center;">
    <div style="display:inline-block;background:rgba(255,255,255,0.12);border:2px solid rgba(255,255,255,0.3);border-radius:50%;width:56px;height:56px;line-height:52px;font-size:28px;margin-bottom:10px;">🦑</div>
    <div>
      <span style="display:block;font-size:10px;color:rgba(255,255,255,0.75);font-weight:700;letter-spacing:2px;text-transform:uppercase;">CÔNG TY TNHH</span>
      <span style="display:block;font-size:24px;color:#fff;font-weight:900;letter-spacing:2px;line-height:1.1;">GIANG NGUYÊN</span>
      <span style="display:block;font-size:18px;color:#fbbf24;font-weight:900;letter-spacing:3px;line-height:1.2;">GROUP</span>
    </div>
    <p style="margin:10px 0 0;color:rgba(255,255,255,0.9);font-size:11px;letter-spacing:1px;">★ Hải sản khô Sầm Sơn – Chất lượng tận tâm ★</p>
    <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:11px;">📍 Quầy 7A–7B Chợ Cột Đỏ · 50 Nguyễn Thị Minh Khai, Sầm Sơn · 7:00–21:00</p>
    <p style="margin:2px 0 0;color:rgba(255,255,255,0.75);font-size:11px;">📞 0933.562.286 · giangnguyendriedseafood@gmail.com</p>
  </div>

  <!-- Invoice title -->
  <div style="text-align:center;padding:22px 30px 10px;">
    <div style="display:inline-block;background:linear-gradient(135deg,#0369a1,#0ea5e9);color:#fff;padding:9px 28px;border-radius:30px;font-size:17px;font-weight:800;letter-spacing:1px;">
      📋 HÓA ĐƠN ĐẶT HÀNG
    </div>
    <p style="margin:12px 0 0;font-size:14px;color:#64748b;">Mã đơn: <strong style="color:#0369a1;font-size:16px;">${orderCode}</strong></p>
    <p style="margin:4px 0 0;font-size:12px;color:#94a3b8;">📅 ${new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>

  <!-- Status badge -->
  <div style="text-align:center;padding:5px 30px 15px;">
    <span style="display:inline-block;padding:9px 26px;border-radius:25px;background:${st.bg};color:${st.color};border:1.5px solid ${st.color}33;font-size:14px;font-weight:800;letter-spacing:0.5px;">${st.icon} ${st.label}</span>
  </div>

  <!-- Customer info -->
  <div style="padding:0 30px 15px;">
    <div style="background:linear-gradient(135deg,#f0f9ff,#e0f2fe);border-radius:12px;padding:18px;border:1px solid #bae6fd;">
      <h3 style="margin:0 0 10px;font-size:14px;color:#0369a1;font-weight:800;">👤 THÔNG TIN KHÁCH HÀNG</h3>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:3px 0;font-size:13px;color:#475569;width:30px;">📛</td><td style="padding:3px 0;font-size:13px;color:#1e293b;font-weight:600;">${order.customer_name || ''}</td></tr>
        <tr><td style="padding:3px 0;font-size:13px;color:#475569;">📞</td><td style="padding:3px 0;font-size:13px;color:#1e293b;">${order.customer_phone || ''}</td></tr>
        ${order.customer_email ? `<tr><td style="padding:3px 0;font-size:13px;color:#475569;">📧</td><td style="padding:3px 0;font-size:13px;color:#1e293b;">${order.customer_email}</td></tr>` : ''}
        <tr><td style="padding:3px 0;font-size:13px;color:#475569;">📍</td><td style="padding:3px 0;font-size:13px;color:#1e293b;">${order.customer_address || ''}</td></tr>
      </table>
    </div>
  </div>

  <!-- Product table -->
  <div style="padding:0 30px;">
    <table style="width:100%;border-collapse:collapse;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
      <thead>
        <tr style="background:linear-gradient(135deg,#0369a1,#0ea5e9);">
          <th style="padding:12px 8px;font-size:11px;color:#fff;text-align:center;font-weight:700;">STT</th>
          <th style="padding:12px 8px;font-size:11px;color:#fff;text-align:left;font-weight:700;">SẢN PHẨM</th>
          <th style="padding:12px 8px;font-size:11px;color:#fff;text-align:center;font-weight:700;">ĐVT</th>
          <th style="padding:12px 8px;font-size:11px;color:#fff;text-align:center;font-weight:700;">SL</th>
          <th style="padding:12px 8px;font-size:11px;color:#fff;text-align:right;font-weight:700;">ĐƠN GIÁ</th>
          <th style="padding:12px 8px;font-size:11px;color:#fff;text-align:right;font-weight:700;">THÀNH TIỀN</th>
        </tr>
      </thead>
      <tbody>${items.map((item: any, i: number) => `
        <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f8fafc'};border-bottom:1px solid #e2e8f0;">
          <td style="padding:10px 8px;text-align:center;font-size:13px;color:#475569;vertical-align:top;">${i + 1}</td>
          <td style="padding:10px 8px;font-size:13px;font-weight:600;color:#1e293b;">
            ${item.name || ''}
            ${item.description || item.note ? `<div style="margin-top:3px;font-size:11px;font-weight:400;color:#64748b;line-height:1.4;">${item.description || item.note}</div>` : ''}
            ${item.grade ? `<span style="display:inline-block;margin-top:4px;font-size:10px;font-weight:600;color:#0369a1;background:#e0f2fe;padding:1px 8px;border-radius:10px;">${item.grade}</span>` : ''}
          </td>
          <td style="padding:10px 8px;text-align:center;font-size:13px;color:#475569;vertical-align:top;">${item.unit || 'kg'}</td>
          <td style="padding:10px 8px;text-align:center;font-size:13px;font-weight:700;color:#0369a1;vertical-align:top;">${item.quantity || 1}</td>
          <td style="padding:10px 8px;text-align:right;font-size:13px;color:#475569;vertical-align:top;">${(item.price || 0).toLocaleString('vi-VN')}₫</td>
          <td style="padding:10px 8px;text-align:right;font-size:13px;font-weight:700;color:#1e293b;vertical-align:top;">${((item.price || 0) * (item.quantity || 1)).toLocaleString('vi-VN')}₫</td>
        </tr>
      `).join('')}</tbody>
    </table>
  </div>

  <!-- Summary -->
  <div style="padding:15px 30px;">
    <div style="background:linear-gradient(135deg,#fefce8,#fef9c3);border-radius:12px;padding:18px;border:1px solid #fde68a;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:5px 0;font-size:14px;color:#475569;">Tổng tiền hàng:</td><td style="padding:5px 0;font-size:15px;font-weight:700;color:#1e293b;text-align:right;">${totalAmount.toLocaleString('vi-VN')}₫</td></tr>
        ${order.coupon_discount ? `<tr><td style="padding:5px 0;font-size:14px;color:#16a34a;">🎟️ Giảm giá (${order.coupon_code || ''}):</td><td style="padding:5px 0;font-size:14px;font-weight:700;color:#16a34a;text-align:right;">-${order.coupon_discount.toLocaleString('vi-VN')}₫</td></tr>` : ''}
        <tr style="border-top:2px solid #f59e0b;"><td style="padding:10px 0 5px;font-size:16px;color:#ea580c;font-weight:800;">💰 Cọc 50%:</td><td style="padding:10px 0 5px;font-size:18px;font-weight:900;color:#ea580c;text-align:right;">${depositAmount.toLocaleString('vi-VN')}₫</td></tr>
        <tr><td style="padding:5px 0;font-size:14px;color:#475569;">Còn lại nhận hàng:</td><td style="padding:5px 0;font-size:15px;font-weight:700;color:#1e293b;text-align:right;">${remainingAmount.toLocaleString('vi-VN')}₫</td></tr>
      </table>
    </div>
  </div>

  <!-- QR Payment -->
  ${order.status !== 'deposit_paid' ? `
  <div style="padding:0 30px 20px;text-align:center;">
    <div style="background:linear-gradient(135deg,#f0f9ff,#e0f2fe);border-radius:12px;padding:20px;border:1px solid #bae6fd;">
      <h3 style="margin:0 0 12px;font-size:16px;color:#0369a1;font-weight:800;">🏦 QUÉT QR ĐỂ THANH TOÁN CỌC</h3>
      <img src="${qrUrl}" alt="QR thanh toán" width="200" height="200" style="border-radius:12px;border:3px solid #0ea5e9;" />
      <div style="margin-top:15px;background:#fff;border-radius:10px;padding:15px;border:1px solid #e2e8f0;text-align:left;">
        <p style="margin:4px 0;font-size:13px;color:#1e293b;">🏦 Ngân hàng: <strong>VietinBank</strong></p>
        <p style="margin:4px 0;font-size:13px;color:#1e293b;">👤 Chủ TK: <strong>VAN THI MINH LINH</strong></p>
        <p style="margin:4px 0;font-size:13px;color:#1e293b;">💳 STK: <strong style="color:#0369a1;font-size:15px;">104002912582</strong></p>
        <p style="margin:4px 0;font-size:13px;color:#1e293b;">📝 Nội dung: <strong style="color:#dc2626;font-size:15px;">${orderCode}</strong></p>
        <p style="margin:4px 0;font-size:13px;color:#1e293b;">💰 Số tiền: <strong style="color:#ea580c;font-size:15px;">${depositAmount.toLocaleString('vi-VN')}₫</strong></p>
      </div>
    </div>
  </div>` : ''}

  <!-- CTA buttons -->
  <div style="padding:5px 30px 25px;text-align:center;">
    ${order.status !== 'deposit_paid' && order.status !== 'delivered' && order.status !== 'cancelled' ? `
      <a href="${confirmDepositUrl}" style="display:inline-block;background:linear-gradient(135deg,#16a34a,#22c55e);color:#fff;text-decoration:none;padding:13px 28px;border-radius:30px;font-weight:800;font-size:14px;margin:6px 4px;box-shadow:0 4px 12px rgba(22,163,74,0.3);">
        ✅ Tôi đã chuyển cọc
      </a>
    ` : ''}
    <a href="${trackUrl}" style="display:inline-block;background:#fff;color:#0369a1;text-decoration:none;padding:12px 26px;border-radius:30px;font-weight:700;font-size:14px;margin:6px 4px;border:2px solid #0ea5e9;">
      📦 Theo dõi đơn
    </a>
    <p style="margin:10px 0 0;font-size:11px;color:#94a3b8;">Hoặc nhắn Zalo <strong style="color:#0369a1;">0933.562.286</strong> kèm mã <strong>${orderCode}</strong></p>
  </div>

  <!-- Footer -->
  <div style="background:linear-gradient(135deg,#0c4a6e,#0369a1);padding:25px 30px;text-align:center;">
    <p style="margin:0;font-size:13px;color:#fff;font-weight:700;">CÔNG TY TNHH GIANG NGUYÊN GROUP</p>
    <p style="margin:6px 0;font-size:12px;color:rgba(255,255,255,0.8);">📞 Hotline: 0933.562.286 | Zalo: 0933.562.286</p>
    <p style="margin:4px 0;font-size:12px;color:rgba(255,255,255,0.8);">📧 giangnguyendriedseafood@gmail.com</p>
    <p style="margin:4px 0;font-size:12px;color:rgba(255,255,255,0.8);">📍 Sầm Sơn, Thanh Hóa</p>
    <hr style="border:none;border-top:1px solid rgba(255,255,255,0.2);margin:12px 0;" />
    <p style="margin:0;font-size:10px;color:rgba(255,255,255,0.5);">© ${new Date().getFullYear()} Giang Nguyên Group – Hải sản khô & Hải sản một nắng Sầm Sơn</p>
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

    const stLabel = (STATUS_MAP[order.status as string] || STATUS_MAP.pending).label

    if (order.customer_email) {
      const customerSubject = `[Giang Nguyên] Đơn ${order.order_code} – ${stLabel}`
      emailPromises.push(sendEmail(transporter, order.customer_email, customerSubject, invoiceHtml))
    }

    const adminSubject = `🔔 [${stLabel}] ${order.order_code} – ${order.customer_name || ''}`
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
