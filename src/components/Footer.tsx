export default function Footer() {
  return (
    <footer className="ocean-gradient text-primary-foreground mt-12">
      <div className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-xl font-extrabold mb-3">GIANG NGUYEN <span className="text-accent">SEAFOOD</span></h3>
          <p className="text-sm text-primary-foreground/80">Chuyên hải sản khô đặc sản biển Sầm Sơn – Cao cấp – Quà biếu – Du lịch</p>
        </div>
        <div>
          <h4 className="font-bold mb-3">Liên hệ</h4>
          <div className="space-y-1 text-sm text-primary-foreground/80">
            <p>📞 Hotline: 0123.456.789</p>
            <p>📧 giangnguyendriedseafood@gmail.com</p>
            <p>📍 Sầm Sơn, Thanh Hóa</p>
          </div>
        </div>
        <div>
          <h4 className="font-bold mb-3">Chính sách</h4>
          <div className="space-y-1 text-sm text-primary-foreground/80">
            <p>✅ Cam kết 100% hải sản sạch</p>
            <p>🚚 Miễn phí ship đơn từ 500k</p>
            <p>🔄 Đổi trả trong 24h</p>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/20 py-4 text-center text-xs text-primary-foreground/60">
        © 2024 Giang Nguyen Seafood. All rights reserved.
      </div>
    </footer>
  );
}
