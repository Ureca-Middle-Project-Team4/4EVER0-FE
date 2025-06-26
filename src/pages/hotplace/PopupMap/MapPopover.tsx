import React from 'react';

interface PopupData {
  id: number;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  image_url: string;
}

interface MapPopoverProps {
  popup: PopupData;
  index?: number;
  children: React.ReactNode;
  showIndex?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function MapPopover({
  popup,
  children,
  open = false,
  onOpenChange,
}: MapPopoverProps) {
  if (!open) return <>{children}</>;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      style={{ pointerEvents: 'auto' }} // ← 이 줄 추가
    >
      {children}
      <div className="px-4 py-2 bg-gray-100 border-border rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-700">매장 정보</div>

          <button
            onClick={() => onOpenChange?.(false)}
            className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
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
      <div className="p-4 gap-y-1 gap-x-1 bg-white shadow-md rounded-2xl">
        {/* 메인 콘텐츠 - 좌측 정보, 우측 이미지 */}
        <div className="flex items-center gap-3 mb-4">
          {/* 좌측 정보 */}
          <div className="flex-1 min-w-0">
            {/* 매장 이름 */}
            <h4 className="font-semibold text-gray-900 text-sm truncate mb-1">{popup.name}</h4>

            {/* 주소 */}
            <p className="text-xs text-gray-600 mb-2 line-clamp-2">{popup.address}</p>

            {/* 설명 (쿠폰 정보 대신) */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-[#EC4899]">상세 정보</p>
              <p className="text-xs text-gray-500 line-clamp-2">
                {popup.description?.trim() ? popup.description : '특이사항 없음'}
              </p>
            </div>
          </div>

          {/* 우측 원형 이미지 */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-sm">
              <img
                src={popup.image_url}
                alt={popup.name}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
