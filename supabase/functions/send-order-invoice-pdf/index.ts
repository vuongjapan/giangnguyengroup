// Generate PDF invoice for an order, upload to private storage,
// then email the customer (and admin) with a time-limited download link.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { jsPDF } from 'https://esm.sh/jspdf@2.5.2'
import nodemailer from 'npm:nodemailer@6.9.16'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SMTP_EMAIL = Deno.env.get('SMTP_EMAIL') || 'giangnguyendriedseafood@gmail.com'
const SMTP_PASSWORD = Deno.env.get('SMTP_PASSWORD') || ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const SIGNED_URL_TTL = 60 * 60 * 24 * 30 // 30 days

// ---- helpers ----
function fmtVnd(n: number) {
  return (n || 0).toLocaleString('vi-VN') + ' d'
}

// Strip Vietnamese diacritics so default jsPDF (Helvetica) can render them.
// jsPDF built-in fonts only support latin-1; the on-screen email keeps full Vietnamese.
function noDiacritics(s: string) {
  return (s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
}

function buildPdf(order: any): Uint8Array {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 40
  let y = 50

  // Header
  doc.setFillColor(12, 74, 110)
  doc.rect(0, 0, pageWidth, 90, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text('GIANG NGUYEN GROUP', margin, 40)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(noDiacritics('Hai san kho Sam Son - Chat luong tan tam'), margin, 60)
  doc.text(noDiacritics('Hotline: 0123 456 789  |  giangnguyendriedseafood@gmail.com'), margin, 75)

  y = 120
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text(noDiacritics('HOA DON BAN HANG'), pageWidth / 2, y, { align: 'center' })

  y += 25
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(noDiacritics(`Ma don: ${order.order_code || '-'}`), margin, y)
  const created = order.created_at ? new Date(order.created_at).toLocaleString('vi-VN') : ''
  doc.text(noDiacritics(`Ngay: ${created}`), pageWidth - margin, y, { align: 'right' })

  // Customer info
  y += 25
  doc.setFont('helvetica', 'bold')
  doc.text(noDiacritics('Thong tin khach hang:'), margin, y)
  doc.setFont('helvetica', 'normal')
  y += 16
  doc.text(noDiacritics(`Ho ten: ${order.customer_name || ''}`), margin, y)
  y += 14
  doc.text(noDiacritics(`Dien thoai: ${order.customer_phone || ''}`), margin, y)
  y += 14
  if (order.customer_email) {
    doc.text(noDiacritics(`Email: ${order.customer_email}`), margin, y)
    y += 14
  }
  doc.text(noDiacritics(`Dia chi: ${order.customer_address || ''}`), margin, y, { maxWidth: pageWidth - margin * 2 })
  y += 25

  // Items table header
  doc.setFillColor(241, 245, 249)
  doc.rect(margin, y, pageWidth - margin * 2, 22, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('STT', margin + 8, y + 15)
  doc.text(noDiacritics('San pham'), margin + 40, y + 15)
  doc.text('SL', pageWidth - margin - 180, y + 15, { align: 'right' })
  doc.text(noDiacritics('Don gia'), pageWidth - margin - 90, y + 15, { align: 'right' })
  doc.text(noDiacritics('Thanh tien'), pageWidth - margin - 8, y + 15, { align: 'right' })
  y += 22

  // Items rows
  doc.setFont('helvetica', 'normal')
  const items = Array.isArray(order.items) ? order.items : []
  items.forEach((item: any, idx: number) => {
    const qty = item.quantity || 1
    const price = item.price || 0
    const lineTotal = qty * price
    const rowH = 20
    if (idx % 2 === 1) {
      doc.setFillColor(250, 250, 250)
      doc.rect(margin, y, pageWidth - margin * 2, rowH, 'F')
    }
    doc.text(String(idx + 1), margin + 8, y + 14)
    const name = noDiacritics(item.name || '')
    doc.text(name.length > 40 ? name.slice(0, 40) + '...' : name, margin + 40, y + 14)
    doc.text(`${qty} ${noDiacritics(item.unit || 'kg')}`, pageWidth - margin - 180, y + 14, { align: 'right' })
    doc.text(fmtVnd(price), pageWidth - margin - 90, y + 14, { align: 'right' })
    doc.text(fmtVnd(lineTotal), pageWidth - margin - 8, y + 14, { align: 'right' })
    y += rowH

    // page break safety
    if (y > 720) {
      doc.addPage()
      y = 50
    }
  })

  // Totals
  const total = order.total || 0
  const deposit = Math.round(total * 0.5)
  const remaining = total - deposit

  y += 10
  doc.setDrawColor(200)
  doc.line(margin, y, pageWidth - margin, y)
  y += 20

  doc.setFont('helvetica', 'normal')
  doc.text(noDiacritics('Tong cong:'), pageWidth - margin - 200, y)
  doc.text(fmtVnd(total), pageWidth - margin - 8, y, { align: 'right' })
  y += 18
  doc.text(noDiacritics('Tien coc 50%:'), pageWidth - margin - 200, y)
  doc.text(fmtVnd(deposit), pageWidth - margin - 8, y, { align: 'right' })
  y += 18
  doc.setFont('helvetica', 'bold')
  doc.text(noDiacritics('Con lai khi nhan hang:'), pageWidth - margin - 200, y)
  doc.text(fmtVnd(remaining), pageWidth - margin - 8, y, { align: 'right' })

  // Status
  y += 30
  const statusText = order.status === 'deposit_paid'
    ? 'TRANG THAI: DA COC 50%'
    : order.status === 'paid'
    ? 'TRANG THAI: DA THANH TOAN DU'
    : 'TRANG THAI: CHUA THANH TOAN'
  doc.setFontSize(11)
  doc.setTextColor(order.status === 'pending' ? 234 : 22, order.status === 'pending' ? 88 : 163, order.status === 'pending' ? 12 : 74)
  doc.text(noDiacritics(statusText), margin, y)

  // Footer
  doc.setTextColor(120, 120, 120)
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(9)
  doc.text(
    noDiacritics('Cam on Quy khach da tin tuong va lua chon Giang Nguyen Group!'),
    pageWidth / 2,
    800,
    { align: 'center' },
  )

  const buf = doc.output('arraybuffer')
  return new Uint8Array(buf)
}

function emailHtml(order: any, downloadUrl: string) {
  const total = order.total || 0
  const deposit = Math.round(total * 0.5)
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f0f4f8;">
  <div style="max-width:600px;margin:20px auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#0c4a6e,#0ea5e9);padding:28px;text-align:center;color:#fff;">
      <div style="font-size:22px;font-weight:900;letter-spacing:1px;">GIANG NGUYÊN GROUP</div>
      <div style="font-size:12px;opacity:.9;margin-top:4px;">Hải sản khô Sầm Sơn</div>
    </div>
    <div style="padding:28px;">
      <h2 style="margin:0 0 12px;color:#0c4a6e;">Hóa đơn ${order.order_code}</h2>
      <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 16px;">
        Kính gửi <b>${order.customer_name || 'Quý khách'}</b>,<br/>
        Cảm ơn Quý khách đã đặt hàng. Vui lòng nhấn nút bên dưới để tải <b>file PDF hóa đơn</b>.
      </p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 18px;margin:18px 0;">
        <div style="font-size:13px;color:#64748b;">Tổng đơn hàng</div>
        <div style="font-size:22px;font-weight:800;color:#0c4a6e;">${total.toLocaleString('vi-VN')}₫</div>
        <div style="font-size:12px;color:#64748b;margin-top:4px;">Tiền cọc 50%: <b>${deposit.toLocaleString('vi-VN')}₫</b></div>
      </div>
      <div style="text-align:center;margin:24px 0;">
        <a href="${downloadUrl}" style="display:inline-block;background:#0ea5e9;color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:15px;box-shadow:0 4px 12px rgba(14,165,233,0.3);">
          📄 Tải hóa đơn PDF
        </a>
      </div>
      <p style="color:#94a3b8;font-size:12px;text-align:center;margin:8px 0 0;">
        Link tải có hiệu lực trong 30 ngày. Nếu link hết hạn, vui lòng liên hệ chúng tôi để được gửi lại.
      </p>
    </div>
    <div style="background:#f8fafc;padding:18px;text-align:center;color:#64748b;font-size:12px;border-top:1px solid #e2e8f0;">
      Hotline: 0123 456 789 · giangnguyendriedseafood@gmail.com
    </div>
  </div>
  </body></html>`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orderId, sendEmail: shouldSend = true } = await req.json()
    if (!orderId) {
      return new Response(JSON.stringify({ error: 'Missing orderId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!SUPABASE_URL || !SERVICE_KEY) throw new Error('Supabase env not configured')

    // Verify caller is admin
    const authHeader = req.headers.get('Authorization') || ''
    const userClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY') || '', {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: userRes } = await userClient.auth.getUser()
    if (!userRes?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const admin = createClient(SUPABASE_URL, SERVICE_KEY)
    const { data: roleRow } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', userRes.user.id)
      .eq('role', 'admin')
      .maybeSingle()
    if (!roleRow) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Fetch order
    const { data: order, error: orderErr } = await admin.from('orders').select('*').eq('id', orderId).maybeSingle()
    if (orderErr || !order) throw new Error('Đơn hàng không tồn tại')

    // Generate PDF
    const pdfBytes = buildPdf(order)
    const filePath = `${order.order_code || order.id}/invoice-${Date.now()}.pdf`
    const { error: upErr } = await admin.storage
      .from('order-invoices')
      .upload(filePath, pdfBytes, { contentType: 'application/pdf', upsert: true })
    if (upErr) throw upErr

    // Signed URL (30 days)
    const { data: signed, error: signErr } = await admin.storage
      .from('order-invoices')
      .createSignedUrl(filePath, SIGNED_URL_TTL)
    if (signErr || !signed?.signedUrl) throw signErr || new Error('Không tạo được link tải')

    // Send email
    let emailSent = false
    let sendError: string | null = null
    if (shouldSend && order.customer_email && SMTP_PASSWORD) {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: { user: SMTP_EMAIL, pass: SMTP_PASSWORD },
        connectionTimeout: 10000,
      })
      try {
        await transporter.verify()
        await transporter.sendMail({
          from: `GIANG NGUYÊN GROUP <${SMTP_EMAIL}>`,
          to: order.customer_email,
          subject: `Hóa đơn PDF - ${order.order_code}`,
          html: emailHtml(order, signed.signedUrl),
        })
        emailSent = true
      } catch (mailErr: any) {
        sendError = mailErr?.message || 'SMTP send failed'
      } finally {
        transporter.close()
      }
    } else if (shouldSend && !order.customer_email) {
      sendError = 'Đơn hàng không có email khách hàng'
    } else if (shouldSend && !SMTP_PASSWORD) {
      sendError = 'Chưa cấu hình SMTP_PASSWORD'
    }

    // Persist tracking on the order
    if (shouldSend) {
      const newStatus = emailSent ? 'sent' : 'failed'
      const updatePayload: Record<string, any> = {
        invoice_pdf_status: newStatus,
        invoice_pdf_last_url: signed.signedUrl,
        invoice_pdf_last_error: emailSent ? null : sendError,
      }
      if (emailSent) {
        updatePayload.invoice_pdf_sent_at = new Date().toISOString()
        updatePayload.invoice_pdf_send_count = (order.invoice_pdf_send_count || 0) + 1
      }
      await admin.from('orders').update(updatePayload).eq('id', orderId)
    }

    if (shouldSend && !emailSent && sendError) {
      return new Response(
        JSON.stringify({ error: sendError, downloadUrl: signed.signedUrl, filePath, emailSent: false }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        downloadUrl: signed.signedUrl,
        filePath,
        emailSent,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err: any) {
    console.error('send-order-invoice-pdf error:', err)
    return new Response(JSON.stringify({ error: err?.message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
