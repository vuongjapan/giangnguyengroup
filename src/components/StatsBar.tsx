const STATS = [
  { value: '50,000+', label: 'Đơn Hàng Thành Công' },
  { value: '10,000+', label: 'Khách Hàng Tin Tưởng' },
  { value: '4.9/5', label: 'Đánh Giá Trung Bình' },
  { value: '99%', label: 'Hài Lòng Sản Phẩm' },
];

export default function StatsBar() {
  return (
    <section className="py-6 md:py-8 bg-card border-y border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {STATS.map(stat => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl md:text-4xl font-black text-primary">{stat.value}</p>
              <p className="text-[11px] md:text-sm text-muted-foreground font-medium mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
