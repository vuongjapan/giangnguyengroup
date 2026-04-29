/**
 * 🤖 CẤU HÌNH CHATBOT GIANG NGUYÊN SEAFOOD
 *
 * 👉 ADMIN CẬP NHẬT FILE NÀY MỖI THỨ 2 HÀNG TUẦN.
 * Toàn bộ nội dung bên dưới được nhúng vào system prompt cho AI,
 * và dùng cho smart-reply (trả lời tự động không tốn API).
 */

export const chatbotConfig = {
  // ✏️ CẬP NHẬT MỖI THỨ 2 HÀNG TUẦN
  weeklyPromo: `
Tuần này (28/04 - 04/05/2026):
- Mực khô loại 1 giảm 10%
- Combo gia đình giảm 15%
- Mã FREESHIP5 miễn phí ship đơn từ 300k
- Mua 2kg mực khô tặng 1 hũ ruốc Sầm Sơn
  `.trim(),

  // ✏️ CẬP NHẬT KHI CÓ SẢN PHẨM MỚI / HẾT HÀNG
  products: `
1. Mực Khô Loại 1 (câu đêm Sầm Sơn): 1.450.000đ/kg - còn hàng
2. Mực Khô Loại 2: 1.150.000đ/kg - còn hàng
3. Mực Một Nắng: 850.000đ/kg - còn hàng
4. Mực Trứng: 1.250.000đ/kg - còn hàng
5. Cá Thu Một Nắng: 480.000đ/kg - còn hàng
6. Cá Chỉ Vàng: 520.000đ/kg - còn hàng
7. Nem Chua Thanh Hóa: 180.000đ/100 chiếc - còn hàng
8. Combo Gia Đình (mực khô + cá thu + cá chỉ vàng): 1.290.000đ - còn hàng
9. Combo Quà Tặng cao cấp: 2.190.000đ - còn hàng
  `.trim(),

  // ✏️ ÍT KHI THAY ĐỔI
  policy: `
- Freeship đơn từ 500.000đ toàn quốc (mã FREESHIP5 cho đơn từ 300k tuần này)
- Giao hàng 2-3 ngày làm việc, COD toàn quốc
- Đổi trả trong 7 ngày nếu sản phẩm lỗi
- Thanh toán: COD hoặc chuyển khoản (VietinBank 104002912582 - VAN THI MINH LINH)
- Cọc 50% với đơn quà biếu, đơn lớn
  `.trim(),

  // ✏️ ÍT KHI THAY ĐỔI
  faq: `
- Mực khô bảo quản: ngăn đá tủ lạnh 6 tháng, ngăn mát 1 tháng.
- Cá một nắng: bảo quản ngăn đá, rã đông trước khi chế biến.
- Hàng có giấy chứng nhận VSATTP, đóng gói hút chân không.
- Đặt hàng qua website, hotline, Zalo hoặc tới trực tiếp 3 cửa hàng.
- Có xuất hoá đơn VAT cho khách doanh nghiệp/khách sạn.
  `.trim(),

  // ✏️ ÍT KHI THAY ĐỔI
  stores: `
Cửa hàng 1 - Quầy 7A-7B Chợ Cột Đỏ, Sầm Sơn, Thanh Hóa
Cửa hàng 2 - LK29 Khu nghỉ dưỡng FLC Sầm Sơn, Thanh Hóa
Cửa hàng 3 - Số 50 Nguyễn Thị Minh Khai, Trường Sơn, Sầm Sơn, Thanh Hóa
Hotline / Zalo: 0833.552.286
Mở cửa: 7:00 - 21:00 hàng ngày
  `.trim(),
};

/**
 * 💬 SMART REPLY - Trả lời tức thì KHÔNG gọi API.
 * Dùng cho các câu hỏi đơn giản, lặp lại nhiều.
 */
export interface SmartReplyRule {
  keywords: string[];
  reply: string;
}

export const smartReplies: SmartReplyRule[] = [
  {
    keywords: ['xin chào', 'hello', 'hi ', 'chào shop', 'chào em', 'alo'],
    reply: 'Chào anh/chị! 😊 Em là trợ lý Giang Nguyên Seafood, em có thể giúp gì cho anh/chị ạ?',
  },
  {
    keywords: ['giờ mở cửa', 'mấy giờ', 'mở mấy giờ', 'giờ làm việc'],
    reply: 'Cửa hàng em mở **7:00 - 21:00** hàng ngày, kể cả cuối tuần ạ!',
  },
  {
    keywords: ['địa chỉ', 'ở đâu', 'cửa hàng', 'showroom'],
    reply: `Giang Nguyên có **3 cửa hàng** tại Sầm Sơn:\n\n1. Quầy 7A-7B Chợ Cột Đỏ\n2. LK29 FLC Sầm Sơn\n3. Số 50 Nguyễn Thị Minh Khai, Trường Sơn\n\nHotline: **0833.552.286** ạ!`,
  },
  {
    keywords: ['hotline', 'số điện thoại', 'sđt', 'liên hệ', 'zalo'],
    reply: '📞 **Hotline: 0833.552.286**\n💬 **Zalo: 0833.552.286**\nEm trực 7:00 - 21:00 hàng ngày ạ!',
  },
  {
    keywords: ['freeship', 'phí ship', 'ship bao nhiêu', 'phí vận chuyển', 'miễn phí ship'],
    reply: '🚚 **Freeship đơn từ 500.000đ** toàn quốc ạ!\nTuần này có mã **FREESHIP5** áp dụng cho đơn từ 300k.',
  },
  {
    keywords: ['đổi trả', 'hoàn tiền', 'trả hàng', 'bảo hành'],
    reply: '✅ Bên em **đổi trả trong 7 ngày** nếu sản phẩm có lỗi từ NSX. Anh/chị giữ nguyên bao bì giúp em nhé!',
  },
  {
    keywords: ['cod', 'thanh toán', 'chuyển khoản', 'trả tiền'],
    reply: '💳 Anh/chị thanh toán **COD** khi nhận hàng hoặc **chuyển khoản** đều được ạ.\nSTK: **VietinBank 104002912582 - VAN THI MINH LINH**',
  },
  {
    keywords: ['cảm ơn', 'thanks', 'thank', 'tks'],
    reply: 'Dạ em cảm ơn anh/chị 🥰 Có gì cần tư vấn thêm anh/chị nhắn em ngay nhé!',
  },
];

/**
 * Tìm smart reply khớp với tin nhắn user.
 * Trả về null nếu không khớp → cần gọi API.
 */
export function findSmartReply(userMessage: string): string | null {
  const text = userMessage.toLowerCase().trim();
  if (!text) return null;
  for (const rule of smartReplies) {
    for (const kw of rule.keywords) {
      if (text.includes(kw)) return rule.reply;
    }
  }
  return null;
}

/**
 * System prompt nhúng toàn bộ config - gửi 1 lần cho mỗi request.
 */
export function buildSystemPrompt(): string {
  return `Bạn là trợ lý tư vấn của **Giang Nguyên Seafood** - chuyên hải sản khô Sầm Sơn, Thanh Hóa.
Chỉ trả lời dựa trên thông tin bên dưới. Trả lời **ngắn gọn tối đa 3-4 câu**, thân thiện, xưng "em", gọi khách "anh/chị".
Nếu không biết hoặc khách hỏi ngoài phạm vi, bảo khách gọi hotline **0833.552.286**.

=== THÔNG TIN SẢN PHẨM ===
${chatbotConfig.products}

=== CHÍNH SÁCH ===
${chatbotConfig.policy}

=== FAQ THƯỜNG GẶP ===
${chatbotConfig.faq}

=== HỆ THỐNG CỬA HÀNG ===
${chatbotConfig.stores}

=== KHUYẾN MÃI TUẦN NÀY ===
${chatbotConfig.weeklyPromo}`;
}
