export type Coupon = {
  couponId: number;
  title: string;
  discount_value: number;
  discount_type: 'PERCENT' | 'FIXED';
  brand: {
    id: number;
    name: string;
    imageUrl: string;
    category?: string | null;
  };
  isUsed: boolean;
  startDate?: string;
  endDate?: string;
};
export type RawCoupon = {
  couponId: number;
  title: string;
  discount_value: number;
  discount_type: 'PERCENT' | 'FIXED';
  brand: {
    id: number;
    name: string;
    imageUrl: string;
    category?: string | null;
  };
  isUsed: boolean;
  start_date: string;
  end_date: string;
};
export interface PlaceInfo {
  id?: number; // 서버에서 id가 없다면 선택적
  name: string;
  lat: number;
  lng: number;
  address: string;
}

export interface NearbyCouponsResponse {
  success: boolean;
  message: string;
  data: {
    places: PlaceInfo[];
  };
}
