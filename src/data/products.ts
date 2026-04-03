import mucKho1 from '@/assets/products/muc-kho-1.jpg';
import mucKho2 from '@/assets/products/muc-kho-2.jpg';
import muc1Nang from '@/assets/products/muc-1-nang.jpg';
import mucTrung from '@/assets/products/muc-trung.jpg';
import caThu1Nang from '@/assets/products/ca-thu-1-nang.jpg';
import caChiVang from '@/assets/products/ca-chi-vang.jpg';
import nemChua from '@/assets/products/nem-chua.jpg';

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
  description: {
    hook: string;
    benefits: string;
    features: string;
    usage: string;
    audience: string;
    commitment: string;
    cta: string;
  };
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
      hook: 'Con mực vàng óng, thân dày căng mọng – chuẩn hàng loại 1 biển Sầm Sơn chỉ dành cho ai biết thưởng thức!',
      benefits: 'Giàu protein tự nhiên, ít mỡ, giữ nguyên vị ngọt biển khơi. Phơi nắng thủ công 3 ngày giúp thịt mực dẻo dai, thơm đậm.',
      features: 'Mực nguyên con, thân dày trên 1.5cm, màu vàng hổ phách đều. Được tuyển chọn từ mẻ câu mực đêm tại bãi biển Sầm Sơn.',
      usage: 'Nướng than hoa chấm tương ớt, xé nhỏ nhắm bia, hoặc chiên giòn bơ tỏi. Ngâm nước gạo 30 phút để mực mềm hơn khi nấu.',
      audience: 'Dành cho quý ông biết nhậu đúng chất, hoặc làm quà biếu sếp, đối tác – sang trọng mà thiết thực.',
      commitment: 'Cam kết 100% mực Sầm Sơn chính gốc. Hoàn tiền nếu không đúng chất lượng.',
      cta: 'Đặt ngay – Hàng loại 1 số lượng có hạn mỗi tuần!',
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
      hook: 'Ngon không kém loại 1, giá mềm hơn – lựa chọn thông minh cho bữa nhậu cuối tuần cùng anh em!',
      benefits: 'Hương vị mực biển Sầm Sơn đặc trưng, thịt chắc ngọt. Phù hợp cả nướng, chiên và nấu cháo cho cả nhà.',
      features: 'Mực nguyên con size trung, thân mỏng hơn loại 1 nhưng vẫn đảm bảo độ tươi và hương vị. Phơi tự nhiên 2 ngày.',
      usage: 'Nướng lửa nhỏ đều, xé miếng vừa ăn. Tẩm gia vị sa tế cho bữa nhậu thêm đỉnh. Hoặc xào với rau củ cho bữa cơm gia đình.',
      audience: 'Gia đình yêu hải sản, nhóm bạn hay tổ chức tiệc nhỏ, hoặc mua về làm quà du lịch Sầm Sơn.',
      commitment: 'Đổi trả miễn phí trong 24h nếu hàng không tươi, không đúng mô tả.',
      cta: 'Mua liền – Giá tốt nhất cho mực khô chất lượng!',
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
      hook: 'Mực tươi từ biển, phơi đúng 1 nắng – giữ trọn vị ngọt tự nhiên mà mực khô không thể có!',
      benefits: 'Kết hợp hoàn hảo giữa mực tươi và mực khô: thịt mềm, ngọt, thơm nắng biển. Giá trị dinh dưỡng cao vì ít qua chế biến.',
      features: 'Mực được làm sạch ngay tại bến cá, phơi duy nhất 1 nắng rồi đông lạnh nhanh. Thịt trong, không phẩm màu, không chất bảo quản.',
      usage: 'Nướng than hoa hoặc chiên giòn – không cần tẩm ướp nhiều vì mực đã ngọt sẵn. Chấm muối ớt xanh cực đỉnh!',
      audience: 'Ai yêu vị tươi nguyên bản của biển, thích nướng BBQ cuối tuần, hoặc cần món nhậu nhanh mà chất.',
      commitment: 'Ship đông lạnh giữ nhiệt 48h. Cam kết tươi đến tay hoặc giao lại miễn phí.',
      cta: 'Đặt gấp – Mực 1 nắng hết rất nhanh mỗi đợt!',
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
      hook: 'Hiếm và đặc biệt – mực trứng Sầm Sơn chỉ có theo mùa, bụng căng đầy trứng vàng ươm!',
      benefits: 'Trứng mực béo ngậy, thịt mực thơm ngọt – sự kết hợp mà dân sành ăn gọi là "vàng biển". Dinh dưỡng gấp đôi mực thường.',
      features: 'Chỉ thu hoạch vào mùa mực đẻ (tháng 3-6). Mỗi con đều được chọn lọc, bụng đầy trứng. Phơi nắng nhẹ giữ nguyên trứng.',
      usage: 'Nướng nhẹ lửa để trứng chín đều mà không bị khô. Hoặc hấp bia – trứng tan trong miệng, thịt mực ngọt lịm.',
      audience: 'Người sành ăn muốn trải nghiệm đỉnh cao hải sản Sầm Sơn. Quà biếu VIP cho người đặc biệt.',
      commitment: 'Số lượng cực kỳ giới hạn. Đóng hộp sang trọng khi mua làm quà biếu.',
      cta: 'Đặt trước ngay – Mùa mực trứng chỉ vài tháng trong năm!',
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
      hook: 'Cá thu Sầm Sơn phơi 1 nắng – thịt chắc ngọt, chiên lên vàng giòn, cả nhà ai cũng mê!',
      benefits: 'Omega-3 dồi dào, tốt cho tim mạch và trí não. Thịt cá thu chắc, ít xương dăm, trẻ nhỏ ăn được.',
      features: 'Cá thu tươi đánh bắt sáng sớm, phi lê sạch xương, phơi 1 nắng chiều. Thịt trắng hồng, không tanh.',
      usage: 'Chiên vàng giòn ăn cơm nóng. Hoặc nướng muối ớt, cuốn bánh tráng rau sống – bữa tối chuẩn vị Việt.',
      audience: 'Bà nội trợ muốn bữa cơm gia đình thêm ngon. Giá cả phải chăng, dễ chế biến, ai cũng thích.',
      commitment: 'Cam kết cá thu tự nhiên, không nuôi công nghiệp. Bảo quản đông lạnh đúng chuẩn.',
      cta: 'Thêm vào giỏ – Món ngon mỗi ngày cho cả nhà!',
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
      hook: 'Giòn rụm, béo ngậy – cá chỉ vàng Sầm Sơn là "bạn nhậu" số 1 của dân biển!',
      benefits: 'Canxi tự nhiên cao, ăn cả xương. Vị mặn ngọt hài hòa, nướng lên thơm lừng khắp xóm.',
      features: 'Cá chỉ vàng tươi, phơi khô tự nhiên không hóa chất. Thân cá nhỏ vừa, vàng đều, thơm đặc trưng biển Sầm Sơn.',
      usage: 'Nướng than hoa xé ăn nhậu bia. Hoặc chiên giòn cho bé ăn vặt. Rim mặn ngọt ăn cơm cũng tuyệt.',
      audience: 'Anh em nhậu bình dân, gia đình thích đồ khô tiện lợi, khách du lịch mua về làm quà nhẹ.',
      commitment: 'Giá rẻ nhất thị trường cho cá chỉ vàng Sầm Sơn chính gốc. Mua nhiều giảm thêm.',
      cta: 'Mua ngay – Giá chỉ 200k/kg, nhậu cả tuần không chán!',
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
      hook: 'Nem chua Thanh Hóa chính gốc – chua thanh, cay nhẹ, giòn sần sật, ăn một cái là nghiện!',
      benefits: 'Lên men tự nhiên tốt cho tiêu hóa. Vị chua dịu kích thích vị giác, ăn kèm tỏi ớt là đúng bài.',
      features: 'Nem gói lá chuối truyền thống, bên trong thịt lợn tươi xay nhuyễn, trộn bì thính. Lên men 3-5 ngày đạt chuẩn.',
      usage: 'Bóc lá ăn ngay kèm tỏi ớt. Hoặc chiên giòn, rán vàng – biến tấu thành món nhậu sang.',
      audience: 'Mọi lứa tuổi, từ trẻ em đến người lớn. Đặc biệt phù hợp làm quà du lịch – nhỏ gọn, dễ mang.',
      commitment: 'Nem làm trong ngày, ship lạnh đảm bảo tươi ngon. Hạn dùng rõ ràng trên bao bì.',
      cta: 'Đặt combo 30 cái giá sỉ – Quà du lịch ai cũng thích!',
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
