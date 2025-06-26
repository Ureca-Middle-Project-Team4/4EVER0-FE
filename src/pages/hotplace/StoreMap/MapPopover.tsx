import React from 'react';
import { BRAND_META } from './Branddata';

interface StoreData {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  brandName: string;
}

interface MapPopoverProps {
  store: StoreData;
  index?: number;
  children: React.ReactNode;
  showIndex?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function StorePopover({
  store,
  children,
  open = false,
  onOpenChange,
}: MapPopoverProps) {
  if (!open) return <>{children}</>;

  const meta = BRAND_META.find((b) => b.name === store.brandName);

  const brandLogoUrl = meta?.logoUrl ?? ''; // 브랜드가 없다면 빈 문자열

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      style={{ pointerEvents: 'auto' }}
      className="
        absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
        z-10 w-80 shadow-lg overflow-hidden rounded-2xl gap-2
      "
    >
      {children}

      {/* 헤더 */}
      <div className="px-4 py-2 bg-gray-100 border-border rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-700">매장 정보</div>
          <button
            onClick={() => onOpenChange?.(false)}
            className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {/* X 아이콘 */}
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* 본문 */}
      <div className="p-4 bg-white rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          {/* 좌측 정보 */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 text-sm truncate mb-1">{store.name}</h4>
            <p className="text-xs text-gray-600 mb-2 line-clamp-2">{store.address}</p>
            {/* 2) meta가 있으면 benefit, 없으면 기본 텍스트 */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-blue-600">사용 가능 쿠폰</p>
              <p className="text-xs text-gray-500">{meta?.benefit ?? '쿠폰 정보 없음'}</p>
            </div>
          </div>

          {/* 우측 로고 이미지 */}
          <div>
            {brandLogoUrl && (
              <img
                src={brandLogoUrl}
                alt={store.brandName}
                className="w-15 h-15 shadow-md object-contain rounded-2xl"
              />
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onOpenChange?.(false)}
            className="flex-1 px-3 py-2 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
          >
            닫기
          </button>
          <button
            onClick={() => {
              console.log('상세 정보:', store);
            }}
            className="flex-1 px-3 py-2 text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-md transition-all shadow-sm hover:shadow-md"
          >
            상세보기
          </button>
        </div>
      </div>
    </div>
  );
}
