export interface Brand {
  id: number;
  name: string;
  imageUrl: string;
  description: string;
  category?: string;
}

// 월별 혜택 조회용 (미리보기)
export interface BenefitPreview {
  brand: string;
  date: string;
  imageUrl: string;
}

// 특정 날짜 혜택 조회용 (상세)
export interface BenefitDetail {
  brand: string;
  date: string;
  imageUrl: string;
  description: string;
  category: string;
}

// 기존 Benefit 인터페이스를 BenefitPreview로 대체하거나 유지
export interface Benefit extends BenefitPreview {
  category?: string;
}
