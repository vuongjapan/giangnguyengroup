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
  // ===== CHÀO HỎI / TẠM BIỆT =====
  {
    keywords: ['xin chào', 'hello', 'hi ', 'chào shop', 'chào em', 'chào bạn', 'chào ad', 'alo', 'có ai ko', 'có ai không', 'có ai đó không'],
    reply: 'Chào anh/chị! 😊 Em là trợ lý **Giang Nguyên Seafood** - hải sản khô Sầm Sơn. Em có thể giúp gì cho anh/chị ạ?',
  },
  {
    keywords: ['tạm biệt', 'bye', 'goodbye', 'hẹn gặp lại', 'chào tạm biệt'],
    reply: 'Dạ em chào anh/chị 👋 Hẹn gặp lại anh/chị ạ! Có gì cần thì nhắn em hoặc gọi **0833.552.286** nhé!',
  },
  {
    keywords: ['cảm ơn', 'cám ơn', 'thanks', 'thank you', 'thank', 'tks', 'thx'],
    reply: 'Dạ em cảm ơn anh/chị 🥰 Có gì cần tư vấn thêm anh/chị nhắn em ngay nhé!',
  },
  {
    keywords: ['ok', 'oki', 'okay', 'được rồi', 'ừ', 'vâng', 'dạ vâng'],
    reply: 'Dạ vâng ạ! 😊 Anh/chị cần em hỗ trợ thêm gì không ạ?',
  },

  // ===== GIỜ MỞ CỬA =====
  {
    keywords: ['giờ mở cửa', 'mấy giờ mở', 'mấy giờ đóng', 'mở mấy giờ', 'đóng mấy giờ', 'giờ làm việc', 'giờ bán hàng', 'giờ đóng cửa', 'làm việc lúc nào', 'mở cửa lúc', 'cuối tuần có mở'],
    reply: '🕖 Cửa hàng em mở **7:00 - 21:00** tất cả các ngày trong tuần (kể cả thứ 7, chủ nhật và lễ tết) ạ!',
  },

  // ===== ĐỊA CHỈ / CỬA HÀNG =====
  {
    keywords: ['địa chỉ', 'ở đâu', 'chỗ nào', 'cửa hàng ở', 'showroom', 'shop ở đâu', 'đến cửa hàng', 'tới cửa hàng', 'có chi nhánh', 'mấy cửa hàng', 'mấy chi nhánh', 'bao nhiêu cửa hàng'],
    reply: '📍 Giang Nguyên có **3 cửa hàng** tại Sầm Sơn, Thanh Hóa:\n\n1. **Quầy 7A-7B Chợ Cột Đỏ**\n2. **LK29 FLC Sầm Sơn**\n3. **Số 50 Nguyễn Thị Minh Khai, Trường Sơn**\n\nMở 7:00 - 21:00 hàng ngày. Hotline: **0833.552.286**',
  },
  {
    keywords: ['google map', 'chỉ đường', 'đường đi', 'bản đồ'],
    reply: '🗺 Anh/chị tìm "**Giang Nguyên Seafood Sầm Sơn**" trên Google Maps là ra ngay 3 cửa hàng nhé. Cần em gửi link cụ thể không ạ?',
  },

  // ===== LIÊN HỆ / HOTLINE =====
  {
    keywords: ['hotline', 'số điện thoại', 'sđt', 'số đt', 'liên hệ', 'zalo', 'facebook', 'fanpage', 'messenger', 'gọi cho shop', 'số shop'],
    reply: '📞 **Hotline: 0833.552.286**\n💬 **Zalo: 0833.552.286**\n\nEm trực **7:00 - 21:00** hàng ngày, anh/chị nhắn/gọi lúc nào cũng được ạ!',
  },

  // ===== SHIP / VẬN CHUYỂN =====
  {
    keywords: ['freeship', 'free ship', 'miễn phí ship', 'miễn phí vận chuyển'],
    reply: '🚚 Bên em **freeship đơn từ 500.000đ** toàn quốc ạ!\nTuần này còn mã **FREESHIP5** miễn phí ship cho đơn từ **300k**.',
  },
  {
    keywords: ['phí ship', 'phí vận chuyển', 'ship bao nhiêu', 'tiền ship', 'cước vận chuyển', 'phí giao hàng'],
    reply: '🚚 Phí ship em tính theo địa chỉ:\n- Đơn **từ 500k**: **MIỄN PHÍ** toàn quốc\n- Đơn dưới 500k: **25-40k** tùy khu vực\n- Tuần này: mã **FREESHIP5** cho đơn từ 300k',
  },
  {
    keywords: ['bao lâu nhận', 'mấy ngày nhận', 'mấy ngày tới', 'giao bao lâu', 'giao mất bao lâu', 'thời gian giao', 'khi nào nhận', 'mấy hôm nhận', 'ship mấy ngày'],
    reply: '⏰ Bên em giao **2-3 ngày làm việc** trên toàn quốc ạ. Hà Nội & các tỉnh lân cận thường **1-2 ngày**, miền Nam **3-4 ngày** ạ!',
  },
  {
    keywords: ['ship hà nội', 'ship sài gòn', 'ship hcm', 'ship miền nam', 'ship miền bắc', 'ship toàn quốc', 'có ship tỉnh', 'ship đi tỉnh'],
    reply: '✈️ Bên em **giao toàn quốc** ạ - Hà Nội 1-2 ngày, miền Trung 2-3 ngày, miền Nam 3-4 ngày. Freeship đơn từ 500k!',
  },
  {
    keywords: ['đơn vị ship', 'ship qua đâu', 'giao bằng', 'gửi qua', 'ghn', 'ghtk', 'viettel post', 'j&t'],
    reply: '📦 Bên em ship qua **GHN, GHTK, Viettel Post** tùy khu vực để tối ưu thời gian giao nhanh nhất cho anh/chị ạ!',
  },

  // ===== ĐỔI TRẢ / BẢO HÀNH =====
  {
    keywords: ['đổi trả', 'đổi hàng', 'trả hàng', 'hoàn tiền', 'hoàn hàng', 'bảo hành', 'hàng lỗi', 'sản phẩm lỗi', 'hỏng hàng'],
    reply: '✅ Bên em **đổi trả trong 7 ngày** nếu sản phẩm có lỗi từ NSX (mốc, hư hỏng, sai mô tả).\n\nAnh/chị chụp ảnh + giữ nguyên bao bì rồi nhắn Zalo **0833.552.286** em xử lý ngay ạ!',
  },

  // ===== THANH TOÁN =====
  {
    keywords: ['cod', 'ship cod', 'nhận hàng trả tiền', 'trả tiền sau', 'thanh toán khi nhận'],
    reply: '💵 Bên em hỗ trợ **COD toàn quốc** ạ - anh/chị nhận hàng, kiểm tra rồi mới thanh toán cho shipper!',
  },
  {
    keywords: ['thanh toán', 'chuyển khoản', 'tài khoản', 'số tk', 'stk', 'banking', 'qr', 'momo', 'vietinbank'],
    reply: '💳 Bên em nhận **COD** hoặc **chuyển khoản** đều được:\n\n🏦 **VietinBank: 104002912582**\n👤 **VAN THI MINH LINH**\n\nNội dung: SEVQR + mã đơn hàng ạ!',
  },
  {
    keywords: ['hoá đơn', 'hóa đơn', 'vat', 'xuất hoá đơn', 'xuất hóa đơn', 'hoá đơn đỏ', 'hóa đơn đỏ'],
    reply: '🧾 Bên em **xuất hoá đơn VAT** cho khách doanh nghiệp/khách sạn ạ. Anh/chị gửi thông tin công ty qua Zalo **0833.552.286** em làm ngay!',
  },

  // ===== ĐẶT HÀNG / SẢN PHẨM =====
  {
    keywords: ['đặt hàng', 'mua hàng', 'order', 'đặt mua', 'làm sao mua', 'cách đặt', 'cách mua'],
    reply: '🛒 Anh/chị có thể đặt 3 cách:\n1. **Đặt trên website** - chọn sản phẩm → giỏ hàng → thanh toán\n2. **Gọi/nhắn Zalo: 0833.552.286**\n3. **Đến trực tiếp** 1 trong 3 cửa hàng tại Sầm Sơn\n\nAnh/chị muốn đặt sản phẩm nào ạ?',
  },
  {
    keywords: ['còn hàng', 'còn không', 'hết hàng', 'có hàng không', 'có sẵn không', 'sẵn không', 'có không'],
    reply: '✅ Hiện tại bên em **đầy đủ hàng** tất cả các sản phẩm ạ! Anh/chị quan tâm sản phẩm nào em báo giá luôn?',
  },
  {
    keywords: ['khuyến mãi', 'giảm giá', 'sale', 'ưu đãi', 'voucher', 'mã giảm', 'mã giảm giá', 'tuần này có gì', 'có deal gì'],
    reply: '🎁 **Khuyến mãi tuần này (28/04 - 04/05):**\n- Mực khô loại 1 **giảm 10%**\n- Combo gia đình **giảm 15%**\n- Mã **FREESHIP5** miễn phí ship đơn từ 300k\n- Mua **2kg mực khô tặng 1 hũ ruốc** Sầm Sơn',
  },
  {
    keywords: ['quà tặng', 'làm quà', 'biếu tặng', 'biếu sếp', 'tặng sếp', 'tặng người yêu', 'tặng tết', 'quà biếu'],
    reply: '🎁 Bên em có **Combo Quà Tặng cao cấp 2.190.000đ** - đóng hộp sang trọng, có túi giấy thương hiệu, rất phù hợp biếu tặng ạ. Anh/chị cần em tư vấn thêm không?',
  },
  {
    keywords: ['bảo quản', 'để được bao lâu', 'hạn sử dụng', 'date', 'hsd', 'để tủ lạnh'],
    reply: '🧊 **Cách bảo quản hải sản khô bên em:**\n- Mực khô: ngăn đá **6 tháng**, ngăn mát 1 tháng\n- Cá một nắng: **bắt buộc ngăn đá**, rã đông trước khi nấu\n- Đóng gói **hút chân không**, có giấy VSATTP đầy đủ ạ!',
  },

  // ===== AI / TRỢ LÝ =====
  {
    keywords: ['bạn là ai', 'em là ai', 'ai đang trả lời', 'người thật không', 'có phải bot', 'là bot', 'là ai vậy', 'chatbot'],
    reply: '🤖 Em là **trợ lý AI** của Giang Nguyên Seafood - hỗ trợ tư vấn nhanh 24/7. Nếu cần gặp nhân viên thật, anh/chị gọi **0833.552.286** nhé ạ!',
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
