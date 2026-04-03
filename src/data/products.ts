import mucKho1 from '@/assets/products/muc-kho-1.jpg';
import mucKho2 from '@/assets/products/muc-kho-2.jpg';
import muc1Nang from '@/assets/products/muc-1-nang.jpg';
import mucTrung from '@/assets/products/muc-trung.jpg';
import caThu1Nang from '@/assets/products/ca-thu-1-nang.jpg';
import caChiVang from '@/assets/products/ca-chi-vang.jpg';
import nemChua from '@/assets/products/nem-chua.jpg';

export interface ProductDescription {
  hook: string;
  intro: string;
  benefits: string[];
  highlights: { origin: string; process: string; packaging: string };
  cooking: { methods: { name: string; detail: string }[]; suggestions: string[] };
  choosingTips: string[];
  realVsFake: { real: string[]; fake: string[] };
  storage: string[];
  suitableFor: string[];
  specs: { origin: string; weight: string; expiry: string };
  commitment: string[];
  cta: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  unit: string;
  images: string[];
  category: string;
  grade: string;
  badges: ('hot' | 'gift' | 'limited')[];
  needs: string[];
  rating: number;
  stock: number;
  description: ProductDescription;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Mực Khô Loại 1',
    slug: 'muc-kho-loai-1',
    price: 1450000,
    unit: 'kg',
    images: [mucKho1],
    category: 'Mực khô',
    grade: 'Cao cấp',
    badges: ['hot', 'gift'],
    needs: ['Biếu', 'Đi lễ'],
    rating: 5,
    stock: 15,
    description: {
      hook: '🔥 Con mực vàng óng, thân dày căng mọng – nướng lên thơm lừng cả xóm, ai đi ngang cũng hỏi mua ở đâu!',
      intro: 'Thịt mực dày, nhai dai sần sật rồi ngọt dần nơi đầu lưỡi. Mùi thơm nắng biển Sầm Sơn quyện vào từng thớ thịt – ăn một miếng là nhớ mãi.',
      benefits: [
        'Thịt dày trên 1.5cm, ngọt tự nhiên, không tẩm hóa chất',
        'Phơi nắng thủ công 3 ngày – giữ trọn hương vị biển',
        'Dễ chế biến: nướng, chiên, xào, nấu cháo đều ngon',
        'Giàu protein, ít mỡ – ăn ngon mà không sợ béo',
      ],
      highlights: {
        origin: 'Mực câu đêm tại ngư trường Sầm Sơn, Thanh Hóa. Tàu về bến là lên phơi ngay trong ngày.',
        process: 'Phơi nắng tự nhiên 3 ngày trên giàn tre truyền thống. Không sấy công nghiệp, không dùng lưu huỳnh.',
        packaging: 'Hút chân không, đóng hộp carton cứng khi mua làm quà biếu. Kèm túi zip bảo quản.',
      },
      cooking: {
        methods: [
          { name: '🔥 Nướng than hoa', detail: 'Nướng lửa nhỏ đều, mực phồng lên vàng rộm. Xé miếng vừa ăn, chấm tương ớt – đỉnh của đỉnh!' },
          { name: '🍳 Chiên bơ tỏi', detail: 'Ngâm nước gạo 30 phút cho mềm, chiên vàng giòn bên ngoài, bên trong vẫn dai ngọt.' },
          { name: '🥘 Xào sa tế', detail: 'Xào lửa lớn với sa tế, hành tây – cay nồng, thơm phức, hao cơm cực kỳ.' },
        ],
        suggestions: ['Nhắm bia lạnh cuối tuần', 'Ăn kèm cơm nóng, dưa chua', 'Nấu cháo mực cho bé ăn dặm'],
      },
      choosingTips: [
        'Màu vàng hổ phách tự nhiên, không quá trắng hay quá đỏ',
        'Thân mực dày, cầm nặng tay, không bị xẹp lép',
        'Mùi thơm nhẹ của biển, không có mùi hắc hay khai',
        'Bẻ thử thấy dai, không giòn vụn',
      ],
      realVsFake: {
        real: ['Màu vàng nâu tự nhiên, không đồng đều 100%', 'Mùi thơm biển nhẹ, dễ chịu', 'Thịt dai, nhai ngọt dần', 'Khi nướng phồng đều, thơm lừng'],
        fake: ['Màu trắng bệch hoặc đỏ bất thường', 'Mùi hắc, nồng hóa chất', 'Thịt bở, nhai không có vị', 'Nướng bị co lại, không phồng'],
      },
      storage: [
        'Ngăn mát tủ lạnh: dùng trong 2 tháng',
        'Ngăn đông -18°C: bảo quản 6-8 tháng',
        'Để trong túi hút chân không, tránh ẩm',
        'Không để chung với thực phẩm có mùi mạnh',
      ],
      suitableFor: ['Nhậu cuối tuần cùng anh em', 'Quà biếu sếp, đối tác – sang mà thiết thực', 'Đi lễ chùa, thăm ông bà'],
      specs: { origin: 'Biển Sầm Sơn, Thanh Hóa', weight: 'Đóng gói 200g / 500g / 1kg', expiry: '6-8 tháng (bảo quản đông lạnh)' },
      commitment: ['100% mực Sầm Sơn chính gốc – không pha trộn', 'Không tẩm hóa chất, không lưu huỳnh', 'Hoàn tiền 100% nếu không đúng chất lượng', 'Đổi trả miễn phí trong 24h'],
      cta: '📞 Anh/chị muốn em giữ hàng cho mình không ạ? Hàng loại 1 tuần nào cũng hết sớm!',
    },
  },
  {
    id: '2',
    name: 'Mực Khô Loại 2',
    slug: 'muc-kho-loai-2',
    price: 1250000,
    unit: 'kg',
    images: [mucKho2],
    category: 'Mực khô',
    grade: 'Loại 1',
    badges: ['hot'],
    needs: ['Ăn gia đình', 'Du lịch'],
    rating: 4,
    stock: 25,
    description: {
      hook: '💰 Ngon ngang loại 1, giá mềm hơn 200k – anh em nhậu cuối tuần chọn loại này là chuẩn bài!',
      intro: 'Vẫn là mực biển Sầm Sơn chính gốc, thịt chắc ngọt tự nhiên. Chỉ khác kích thước nhỏ hơn loại 1 – nhưng nướng lên vẫn thơm lừng, vẫn dai ngọt như thường.',
      benefits: [
        'Hương vị đặc trưng mực Sầm Sơn, không thua loại 1',
        'Giá hợp lý, phù hợp mua ăn hàng ngày',
        'Thịt chắc, phơi 2 nắng đạt chuẩn',
        'Chế biến đa dạng: nướng, xào, rim, nấu canh',
      ],
      highlights: {
        origin: 'Cùng nguồn mực câu Sầm Sơn, chỉ khác size nhỏ hơn. Tàu cá về bến là xử lý ngay.',
        process: 'Phơi tự nhiên 2 ngày nắng to, đảm bảo đúng độ khô. Không dùng máy sấy, giữ nguyên vị.',
        packaging: 'Hút chân không từng gói, kèm nhãn rõ ngày sản xuất và hướng dẫn bảo quản.',
      },
      cooking: {
        methods: [
          { name: '🔥 Nướng sa tế', detail: 'Phết sa tế lên mực, nướng vỉ lửa nhỏ. Mực chín vàng, cay thơm, bia vào là mê!' },
          { name: '🥗 Xào rau củ', detail: 'Ngâm mềm, xào với ớt chuông, hành tây, nấm – bữa cơm gia đình thêm đẳng cấp.' },
          { name: '🍲 Nấu cháo', detail: 'Xé nhỏ nấu cháo – nước cháo ngọt lừ, thơm mùi biển. Bé ăn mê tít.' },
        ],
        suggestions: ['Xé khô nhắm bia tối thứ 7', 'Làm nhân bánh cuốn mực', 'Tẩm bột chiên giòn ăn vặt'],
      },
      choosingTips: [
        'Thân mực đều, không bị gãy nát',
        'Màu vàng nâu nhạt, khô ráo',
        'Mùi thơm tự nhiên, không khai',
        'Cầm chắc tay, không bị ẩm nhũn',
      ],
      realVsFake: {
        real: ['Vàng nâu tự nhiên, hơi loang màu', 'Thơm nhẹ mùi biển', 'Nhai dai, ngọt hậu', 'Khi ngâm nước ra ít bọt'],
        fake: ['Trắng đục hoặc vàng chói bất thường', 'Mùi nồng, hắc hóa chất', 'Bở, nhạt, không có vị', 'Ngâm nước ra nhiều bọt, đổi màu'],
      },
      storage: [
        'Ngăn mát: dùng trong 45 ngày',
        'Ngăn đông: bảo quản 4-6 tháng',
        'Giữ nguyên bao bì hút chân không',
        'Sau khi mở, cho vào túi zip kín, bảo quản lạnh',
      ],
      suitableFor: ['Bữa cơm gia đình cuối tuần', 'Mua về làm quà du lịch Sầm Sơn', 'Nhóm bạn tổ chức tiệc nhỏ tại nhà'],
      specs: { origin: 'Biển Sầm Sơn, Thanh Hóa', weight: 'Đóng gói 200g / 500g / 1kg', expiry: '4-6 tháng (bảo quản đông lạnh)' },
      commitment: ['Mực Sầm Sơn 100%, không pha hàng nơi khác', 'Đổi trả miễn phí trong 24h nếu không hài lòng', 'Ship COD toàn quốc, kiểm hàng trước khi thanh toán'],
      cta: '📞 Anh/chị ơi, loại 2 này bán chạy nhất shop luôn á! Muốn em gói sẵn không ạ?',
    },
  },
  {
    id: '3',
    name: 'Mực 1 Nắng',
    slug: 'muc-1-nang',
    price: 450000,
    unit: 'kg',
    images: [muc1Nang],
    category: 'Hải sản 1 nắng',
    grade: 'Loại 1',
    badges: ['hot'],
    needs: ['Ăn gia đình', 'Du lịch'],
    rating: 5,
    stock: 8,
    description: {
      hook: '🌊 Tươi từ biển, phơi đúng 1 nắng – giữ trọn cái ngọt mà mực khô không bao giờ có được!',
      intro: 'Cắn miếng đầu tiên là thấy khác biệt: thịt mềm, nước ngọt lịm, thơm nắng biển thoang thoảng. Không phải mực tươi, không phải mực khô – mà là tinh hoa của cả hai.',
      benefits: [
        'Thịt mềm, ngọt tự nhiên – giữ 90% dinh dưỡng của mực tươi',
        'Ít qua chế biến nên giàu protein, khoáng chất',
        'Không cần tẩm ướp nhiều, mực đã ngọt sẵn',
        'Nướng 5 phút là ăn được – tiện lợi cho bữa nhậu nhanh',
      ],
      highlights: {
        origin: 'Mực tươi từ bến cá Sầm Sơn, làm sạch ngay khi tàu cập bến. Không qua trung gian.',
        process: 'Phơi duy nhất 1 nắng chiều rồi đông lạnh nhanh -40°C. Khóa trọn vị tươi trong từng con mực.',
        packaging: 'Đóng khay xốp, bọc màng co, giữ lạnh bằng đá gel. Ship đông lạnh toàn quốc.',
      },
      cooking: {
        methods: [
          { name: '🔥 Nướng than hoa', detail: 'Nướng lửa vừa, mực chín tái – thịt mềm, nước ngọt chảy ra. Chấm muối ớt xanh là chuẩn vị!' },
          { name: '🧈 Chiên giòn', detail: 'Tẩm bột mỏng, chiên vàng giòn rụm. Bên ngoài giòn tan, bên trong vẫn mềm ngọt.' },
          { name: '🍺 Nướng mỡ hành', detail: 'Phết mỡ hành lên mực, nướng vàng – mỡ hành thấm vào thịt mực, thơm điên đảo!' },
        ],
        suggestions: ['Chấm muối ớt xanh + chanh', 'Cuốn bánh tráng rau sống', 'Ăn kèm cơm chiên hải sản'],
      },
      choosingTips: [
        'Thịt mực trong, hơi ánh hồng nhạt',
        'Mùi tanh nhẹ tự nhiên của biển, không hôi',
        'Thân mực còn nguyên, không bị rách nát',
        'Khi rã đông, thịt vẫn đàn hồi tốt',
      ],
      realVsFake: {
        real: ['Thịt trong, hơi hồng tự nhiên', 'Mùi biển nhẹ, dễ chịu', 'Rã đông vẫn đàn hồi, không bở', 'Nướng lên ngọt, thơm nắng'],
        fake: ['Trắng bợt hoặc ngả vàng', 'Mùi hắc, tanh nồng', 'Rã đông bị nhũn, ra nhiều nước', 'Nướng bị teo nhỏ, không có vị'],
      },
      storage: [
        'BẮT BUỘC bảo quản ngăn đông -18°C',
        'Dùng trong 3 tháng kể từ ngày mua',
        'Rã đông tự nhiên trong ngăn mát trước khi chế biến',
        'KHÔNG rã đông rồi đông lại – mất ngon',
      ],
      suitableFor: ['BBQ cuối tuần trên sân thượng', 'Bữa nhậu nhanh mà chất', 'Mua về làm quà cho ai chưa thử bao giờ'],
      specs: { origin: 'Bến cá Sầm Sơn, Thanh Hóa', weight: 'Đóng gói 500g / 1kg', expiry: '3 tháng (bảo quản đông lạnh -18°C)' },
      commitment: ['Ship đông lạnh giữ nhiệt 48h bằng đá gel', 'Cam kết tươi đến tay – giao lại miễn phí nếu hàng bị hỏng', 'Không ngâm hóa chất tăng trọng'],
      cta: '📞 Mực 1 nắng hết nhanh lắm anh/chị ơi! Đợt này còn ít, muốn em giữ hàng cho mình không ạ?',
    },
  },
  {
    id: '4',
    name: 'Mực Trứng',
    slug: 'muc-trung',
    price: 500000,
    unit: 'kg',
    images: [mucTrung],
    category: 'Mực khô',
    grade: 'Cao cấp',
    badges: ['gift', 'limited'],
    needs: ['Biếu', 'Đi lễ'],
    rating: 5,
    stock: 5,
    description: {
      hook: '👑 Hiếm có khó tìm – mực trứng Sầm Sơn bụng căng đầy trứng vàng ươm, dân sành ăn gọi là "vàng biển"!',
      intro: 'Cắn vào là trứng mực béo ngậy tan trên đầu lưỡi, hòa quyện với thịt mực thơm ngọt. Cái cảm giác ấy – chỉ mực trứng mới cho được.',
      benefits: [
        'Trứng mực béo ngậy, dinh dưỡng gấp đôi mực thường',
        'Thịt mực ngọt thanh, kết hợp trứng tạo vị lạ miệng',
        'Theo mùa nên rất hiếm – ăn lần nào nhớ lần đó',
        'Thích hợp làm quà VIP – ai nhận cũng trầm trồ',
      ],
      highlights: {
        origin: 'Chỉ có từ tháng 3 đến tháng 6 – mùa mực đẻ trứng tại Sầm Sơn. Qua mùa là hết.',
        process: 'Mỗi con được chọn lọc bằng tay, đảm bảo bụng đầy trứng. Phơi nắng nhẹ 1.5 ngày để giữ nguyên trứng.',
        packaging: 'Đóng hộp quà sang trọng có lót lụa. Kèm thiệp chúc khi mua biếu tặng.',
      },
      cooking: {
        methods: [
          { name: '🔥 Nướng nhẹ lửa', detail: 'Nướng lửa liu riu – trứng chín từ từ, béo ngậy tan trong miệng. Đừng nướng quá lửa kẻo trứng khô!' },
          { name: '🍺 Hấp bia', detail: 'Hấp với bia lon 15 phút – trứng nở bung, mực mềm thơm. Dân nhậu gọi là "món thần thánh".' },
          { name: '🥢 Rim nước mắm', detail: 'Rim nhỏ lửa với nước mắm đường – mực trứng đậm vị, ăn với cơm nóng hao không đếm nổi.' },
        ],
        suggestions: ['Hấp bia + chấm muối tiêu chanh', 'Nướng nguyên con, không cần tẩm ướp', 'Xé nhỏ ăn kèm xôi nếp'],
      },
      choosingTips: [
        'Bụng mực phồng căng, nặng tay khi cầm',
        'Trứng màu vàng cam đều, không bị đen',
        'Thân mực nguyên vẹn, không bị vỡ bụng',
        'Mùi thơm đặc trưng, không hắc',
      ],
      realVsFake: {
        real: ['Bụng căng tròn tự nhiên, trứng vàng cam', 'Cầm nặng tay, bóp thấy chắc', 'Mùi thơm biển đặc trưng', 'Nướng lên trứng nở, béo ngậy'],
        fake: ['Bụng lỏng lẻo, có thể nhồi thêm', 'Nhẹ bất thường so với kích thước', 'Mùi lạ, không tự nhiên', 'Nướng trứng khô cứng, không ngon'],
      },
      storage: [
        'Ngăn đông -18°C: bảo quản 4-5 tháng',
        'Ngăn mát: dùng trong 1 tháng',
        'Hút chân không để giữ trứng không bị oxy hóa',
        'Rã đông từ từ trong ngăn mát trước khi nấu',
      ],
      suitableFor: ['Quà biếu VIP cho sếp, đối tác quan trọng', 'Đi lễ chùa, thăm ông bà ngày Tết', 'Dân sành ăn muốn trải nghiệm đỉnh cao hải sản'],
      specs: { origin: 'Ngư trường Sầm Sơn (mùa tháng 3-6)', weight: 'Đóng gói 300g / 500g', expiry: '4-5 tháng (bảo quản đông lạnh)' },
      commitment: ['Số lượng cực kỳ giới hạn theo mùa', 'Đóng hộp quà sang trọng miễn phí', 'Cam kết mực trứng thật – hoàn tiền nếu trứng không đầy'],
      cta: '📞 Mùa mực trứng chỉ vài tháng thôi anh/chị ơi! Muốn em giữ hàng cho mình không ạ?',
    },
  },
  {
    id: '5',
    name: 'Cá Thu 1 Nắng',
    slug: 'ca-thu-1-nang',
    price: 280000,
    unit: 'kg',
    images: [caThu1Nang],
    category: 'Hải sản 1 nắng',
    grade: 'Loại 1',
    badges: ['hot'],
    needs: ['Ăn gia đình'],
    rating: 4,
    stock: 30,
    description: {
      hook: '🍚 Chiên lên vàng giòn, gắp miếng cá thu thơm lừng chấm nước mắm tỏi ớt – cả nhà tranh nhau ăn!',
      intro: 'Thịt cá thu trắng hồng, chắc nịch, cắn vào là ngọt lịm. Lớp da chiên giòn tan, bên trong mềm thơm – đúng chuẩn bữa cơm Việt ngon lành.',
      benefits: [
        'Giàu Omega-3 tốt cho tim mạch và trí não',
        'Thịt chắc, ít xương dăm – trẻ nhỏ ăn được',
        'Phơi 1 nắng giữ vị tươi, không bị tanh',
        'Giá phải chăng, chế biến nhanh cho bữa cơm hàng ngày',
      ],
      highlights: {
        origin: 'Cá thu đánh bắt sáng sớm tại biển Sầm Sơn. Tàu về là phi lê, làm sạch ngay.',
        process: 'Phi lê bỏ xương, phơi 1 nắng chiều. Thịt se mặt ngoài, bên trong vẫn mềm ẩm tự nhiên.',
        packaging: 'Đóng khay từng con, bọc màng co. Ship đông lạnh kèm đá gel giữ nhiệt 48h.',
      },
      cooking: {
        methods: [
          { name: '🍳 Chiên vàng giòn', detail: 'Chiên lửa vừa đến khi da giòn vàng rộm. Gắp ra đĩa, vắt chanh – ăn với cơm nóng là ngất ngây!' },
          { name: '🔥 Nướng muối ớt', detail: 'Ướp muối ớt 15 phút, nướng than hoa. Thịt cá thơm phức, cuốn bánh tráng rau sống cực đỉnh.' },
          { name: '🥘 Kho tiêu', detail: 'Kho với tiêu đen, nước mắm đường – cá thu đậm vị, mỗi bữa ăn được 2-3 bát cơm.' },
        ],
        suggestions: ['Chấm nước mắm tỏi ớt pha chua ngọt', 'Cuốn bánh tráng + rau thơm + bún', 'Ăn kèm canh chua rau muống'],
      },
      choosingTips: [
        'Thịt cá trắng hồng, không bị ngả vàng',
        'Da cá còn nguyên, bóng mượt',
        'Mùi tanh nhẹ tự nhiên, không hôi',
        'Ấn tay vào thịt đàn hồi, không bị lõm',
      ],
      realVsFake: {
        real: ['Thịt trắng hồng tự nhiên', 'Mùi tanh nhẹ của cá biển', 'Chiên lên thịt chắc, không bở', 'Da cá chiên giòn, vàng đều'],
        fake: ['Thịt nhạt màu hoặc ngả vàng', 'Mùi hôi, tanh nồng bất thường', 'Chiên bị nát, ra nhiều nước', 'Da bong tróc, không giòn'],
      },
      storage: [
        'Ngăn đông -18°C: dùng trong 3 tháng',
        'Rã đông trong ngăn mát 4-6 tiếng trước khi chế biến',
        'KHÔNG ngâm nước nóng để rã đông – thịt cá sẽ bở',
        'Đã rã đông thì chế biến ngay, không đông lại',
      ],
      suitableFor: ['Bữa cơm gia đình mỗi ngày', 'Nội trợ bận rộn cần món nhanh mà ngon', 'Bé ăn dặm, người già cần bổ sung Omega-3'],
      specs: { origin: 'Biển Sầm Sơn, Thanh Hóa', weight: 'Đóng gói 500g / 1kg (2-3 con)', expiry: '3 tháng (bảo quản đông lạnh -18°C)' },
      commitment: ['Cá thu tự nhiên 100%, không nuôi công nghiệp', 'Bảo quản đông lạnh đúng chuẩn ATVSTP', 'Hoàn tiền nếu cá bị tanh hoặc không tươi'],
      cta: '📞 Món này nhà nào cũng cần luôn á! Anh/chị muốn em giữ hàng cho mình không ạ?',
    },
  },
  {
    id: '6',
    name: 'Cá Chỉ Vàng',
    slug: 'ca-chi-vang',
    price: 200000,
    unit: 'kg',
    images: [caChiVang],
    category: 'Cá khô',
    grade: 'Loại 2',
    badges: [],
    needs: ['Ăn gia đình', 'Du lịch'],
    rating: 4,
    stock: 40,
    description: {
      hook: '🍺 Giòn rụm, béo ngậy – nướng lên thơm lừng khắp xóm, anh em kéo qua nhậu không cần mời!',
      intro: 'Con cá chỉ vàng nhỏ xinh mà ngon bất ngờ. Nướng giòn rụm, xé ra từng sợi – vị mặn ngọt hòa quyện, càng nhai càng ghiền. Bia vào là dừng không nổi!',
      benefits: [
        'Giàu canxi tự nhiên – ăn cả xương luôn',
        'Vị mặn ngọt hài hòa, không cần chấm thêm gì',
        'Nướng 3 phút là ăn – nhanh gọn cho bữa nhậu',
        'Giá bình dân, mua 1kg ăn cả tuần',
      ],
      highlights: {
        origin: 'Cá chỉ vàng đánh bắt ngoài khơi Sầm Sơn, phơi khô ngay tại bãi biển.',
        process: 'Phơi nắng tự nhiên 2 ngày trên giàn lưới. Không dùng hóa chất, không tẩy trắng.',
        packaging: 'Đóng túi zip 200g/500g/1kg, hút chân không. Nhỏ gọn dễ mang theo du lịch.',
      },
      cooking: {
        methods: [
          { name: '🔥 Nướng than hoa', detail: 'Nướng trên vỉ than, cá chín vàng giòn rụm. Xé từng sợi nhắm bia – đơn giản mà đỉnh!' },
          { name: '🍳 Chiên giòn', detail: 'Chiên ngập dầu đến khi giòn tan. Bé ăn vặt mê tít, người lớn nhắm bia cũng hợp.' },
          { name: '🥘 Rim mặn ngọt', detail: 'Rim nhỏ lửa với đường, nước mắm, ớt – đậm vị, ăn cơm nóng hao cơm cực kỳ.' },
        ],
        suggestions: ['Nhắm bia lạnh tối thứ 7', 'Cho bé ăn vặt thay snack', 'Mang theo picnic, đi biển'],
      },
      choosingTips: [
        'Cá vàng đều, khô ráo, không bị ẩm',
        'Thân cá nhỏ vừa, đều nhau',
        'Mùi thơm đặc trưng biển, không hắc',
        'Bẻ thấy giòn, không bị dai nhũn',
      ],
      realVsFake: {
        real: ['Vàng nâu tự nhiên, có chỗ đậm nhạt', 'Mùi thơm biển dịu', 'Nướng giòn, thơm lừng', 'Ăn ngọt hậu, không bị mặn chát'],
        fake: ['Vàng chói hoặc trắng bệch', 'Mùi hắc hóa chất', 'Nướng bị cháy nhanh, không giòn', 'Ăn mặn chát, không có vị ngọt'],
      },
      storage: [
        'Để nơi khô ráo, thoáng mát: 2 tháng',
        'Ngăn mát tủ lạnh: 4 tháng',
        'Giữ trong túi zip kín, tránh ẩm mốc',
        'Không để gần nguồn nhiệt hay ánh nắng trực tiếp',
      ],
      suitableFor: ['Anh em nhậu bình dân cuối tuần', 'Gia đình thích đồ khô tiện lợi', 'Du khách mua về làm quà nhẹ nhàng'],
      specs: { origin: 'Biển Sầm Sơn, Thanh Hóa', weight: 'Đóng gói 200g / 500g / 1kg', expiry: '4 tháng (bảo quản nơi khô ráo)' },
      commitment: ['Giá rẻ nhất cho cá chỉ vàng Sầm Sơn chính gốc', 'Mua từ 2kg giảm thêm 10%', 'Đổi trả nếu cá bị ẩm mốc, không đạt chất lượng'],
      cta: '📞 Chỉ 200k/kg thôi, mua ăn cả tuần luôn! Anh/chị muốn em giữ hàng cho mình không ạ?',
    },
  },
  {
    id: '7',
    name: 'Nem Chua Thanh Hóa',
    slug: 'nem-chua',
    price: 45000,
    unit: '10 cái',
    images: [nemChua],
    category: 'Nem chua',
    grade: 'Loại 1',
    badges: ['gift'],
    needs: ['Ăn gia đình', 'Du lịch', 'Biếu'],
    rating: 5,
    stock: 100,
    description: {
      hook: '😋 Chua thanh, cay nhẹ, giòn sần sật – bóc 1 cái là tay tự động bóc tiếp, nghiện thật sự!',
      intro: 'Lớp lá chuối xanh bọc bên ngoài, bên trong là thịt lợn xay mịn trộn bì giòn sần sật. Vị chua dịu, cay nhẹ nơi đầu lưỡi – ăn kèm tỏi ớt là đúng bài.',
      benefits: [
        'Lên men tự nhiên – tốt cho hệ tiêu hóa',
        'Vị chua dịu kích thích vị giác, ăn không ngán',
        'Nhỏ gọn, tiện mang theo – ăn vặt bất cứ lúc nào',
        'Giá siêu rẻ, mua sỉ càng rẻ hơn',
      ],
      highlights: {
        origin: 'Nem chua truyền thống Thanh Hóa, công thức gia truyền 3 đời.',
        process: 'Thịt lợn tươi xay nhuyễn, trộn bì thính, gói lá chuối. Lên men tự nhiên 3-5 ngày đạt chuẩn chua.',
        packaging: 'Gói lá chuối từng chiếc, buộc chun truyền thống. Đóng hộp 10/20/30 cái khi mua làm quà.',
      },
      cooking: {
        methods: [
          { name: '🥢 Ăn sống', detail: 'Bóc lá, ăn ngay kèm tỏi lát + ớt hiểm + lá chìa. Đúng kiểu Thanh Hóa gốc!' },
          { name: '🍳 Chiên giòn', detail: 'Bỏ lá, chiên vàng giòn – vỏ ngoài giòn rụm, bên trong vẫn chua dịu. Món nhậu cấp tốc!' },
          { name: '🔥 Nướng lá', detail: 'Nướng nguyên lá trên bếp than – lá chuối cháy thơm, nem nóng hổi, chua cay đậm vị hơn.' },
        ],
        suggestions: ['Ăn kèm tỏi + ớt + lá chìa (kiểu Thanh Hóa)', 'Cuốn bánh tráng + bún + rau thơm', 'Chiên giòn chấm tương ớt Sriracha'],
      },
      choosingTips: [
        'Lá chuối còn xanh, buộc chặt',
        'Nem chắc tay khi bóp, không bị nhão',
        'Mùi chua dịu tự nhiên, không hôi chua',
        'Bì giòn rõ khi cắn, thịt mịn mềm',
      ],
      realVsFake: {
        real: ['Màu hồng nhạt tự nhiên của thịt lên men', 'Chua dịu, có vị thính thơm', 'Bì giòn, thịt mịn', 'Lá chuối buộc chặt tay'],
        fake: ['Đỏ bất thường do phẩm màu', 'Chua gắt hoặc không có vị', 'Bì nhão, thịt bở', 'Bao bì công nghiệp, không có lá chuối'],
      },
      storage: [
        'Nhiệt độ phòng: ăn trong 3-5 ngày (nem chua nhất)',
        'Ngăn mát tủ lạnh: giữ được 2 tuần',
        'KHÔNG để ngăn đông – nem sẽ mất vị chua đặc trưng',
        'Để nơi thoáng mát, tránh ánh nắng trực tiếp',
      ],
      suitableFor: ['Ăn vặt mọi lúc mọi nơi', 'Quà du lịch Thanh Hóa – nhỏ gọn ai cũng thích', 'Biếu người thân xa quê – gợi nhớ hương vị nhà'],
      specs: { origin: 'Thanh Hóa', weight: 'Gói 10 cái (~300g)', expiry: '5 ngày (nhiệt độ phòng) / 2 tuần (ngăn mát)' },
      commitment: ['Nem làm trong ngày, ship lạnh đảm bảo tươi', 'Hạn sử dụng rõ ràng trên từng gói', 'Mua sỉ từ 50 cái giảm 15%', 'Đổi trả nếu nem bị hỏng khi nhận hàng'],
      cta: '📞 Combo 30 cái giá sỉ chỉ 120k! Anh/chị muốn em giữ hàng cho mình không ạ?',
    },
  },
];

export const categories = ['Mực khô', 'Cá khô', 'Hải sản 1 nắng', 'Nem chua', 'Combo quà biếu'];
export const priceRanges = [
  { label: 'Dưới 200k', min: 0, max: 200000 },
  { label: '200k – 500k', min: 200000, max: 500000 },
  { label: '500k – 1 triệu', min: 500000, max: 1000000 },
  { label: 'Trên 1 triệu', min: 1000000, max: Infinity },
];
export const grades = ['Loại 1', 'Loại 2', 'Cao cấp'];
export const needsList = ['Ăn gia đình', 'Biếu', 'Đi lễ', 'Du lịch'];
export const statusFilters = [
  { label: '🔥 Bán chạy', value: 'hot' as const },
  { label: '⭐ Đánh giá cao', value: 'rating' as const },
  { label: '⏳ Sắp hết', value: 'limited' as const },
];

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN').format(price) + '₫';
}
