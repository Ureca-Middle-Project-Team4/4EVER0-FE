import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/Badge';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import type { Brand, BrandCategory } from '@/types/brand';

interface LifeBenefitsStepProps {
  lifeBrands: Brand[];
  selectedLifeBrands: Brand[];
  onToggleBrand: (brand: Brand) => void;
  onCategoryChange: (category: string) => void;
  selectedCategory: BrandCategory;
  loading: boolean;
}

const BRAND_CATEGORIES: { value: BrandCategory; label: string }[] = [
  { value: '전체', label: '전체' },
  { value: '디저트/음료', label: '디저트/음료' },
  { value: '편의점/쇼핑', label: '편의점/쇼핑' },
  { value: '식당/베이커리', label: '베이커리' },
];

export function LifeBenefitsStep({
  lifeBrands,
  selectedLifeBrands,
  onToggleBrand,
  onCategoryChange,
  selectedCategory,
  loading,
}: LifeBenefitsStepProps) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <Badge variant="step">STEP 2</Badge>
        <h2 className="text-lg font-semibold mt-2">라이프 혜택 선택하기</h2>
        <p className="text-sm text-gray-600 mt-1">
          라이프상품 쿠폰 혜택은 매 달 변경할 수 있어요. (MY구독 -&gt; 쿠폰함)
        </p>
      </div>

      {/* 카테고리 선택 */}
      <div className="w-full overflow-x-auto scrollbar-hide touch-scroll">
        <div className="flex gap-2 px-1 py-2">
          {BRAND_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => onCategoryChange(cat.value)}
              className={cn(
                'flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full borde transition-colors',
                selectedCategory === cat.value
                  ? 'bg-pink-500 text-white border-pink-500'
                  : 'border-pink-200 text-pink-700 hover:bg-pink-50 bg-white',
                'whitespace-nowrap shadow-sm',
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 브랜드 목록 */}
      <div className="mt-4">
        {loading ? (
          <div className="text-center py-8">로딩 중...</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {lifeBrands.map((brand) => {
              const isSelected = selectedLifeBrands.find((b) => b.id === brand.id);
              return (
                <Card
                  key={brand.id}
                  className={cn(
                    'cursor-pointer transition-all border border-gray-50',
                    isSelected ? 'ring-2 ring-pink-500 bg-pink-50' : 'hover:shadow-md',
                  )}
                  onClick={() => onToggleBrand(brand)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <img
                        src={brand.image_url}
                        alt={brand.title}
                        className="w-8 h-8 object-contain"
                      />
                      {isSelected && (
                        <div className="w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-medium text-sm">{brand.title}</h3>
                    <p className="text-xs text-gray-600">{brand.category}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
