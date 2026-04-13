export interface Store {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  hours: string;
  image?: string;
}

export const stores: Store[] = [
  {
    id: 'store-1',
    name: 'Cửa hàng 1 – Chợ Cột Đỏ',
    address: 'Quầy số 7A7B – Đại lý hải sản khô chợ Cột Đỏ, Sầm Sơn, Thanh Hóa',
    lat: 19.7580,
    lng: 105.9040,
    phone: '0933562286',
    hours: '7:00 – 21:00',
  },
  {
    id: 'store-2',
    name: 'Cửa hàng 2 – FLC Sầm Sơn',
    address: 'LK29 – Khu nghỉ dưỡng FLC Sầm Sơn, Thanh Hóa',
    lat: 19.7420,
    lng: 105.8980,
    phone: '0933562286',
    hours: '7:00 – 21:00',
  },
  {
    id: 'store-3',
    name: 'Cửa hàng 3 – Nguyễn Thị Minh Khai',
    address: 'Số 50 Nguyễn Thị Minh Khai, Trường Sơn, Sầm Sơn, Thanh Hóa',
    lat: 19.7650,
    lng: 105.9100,
    phone: '0933562286',
    hours: '7:00 – 21:00',
  },
];
