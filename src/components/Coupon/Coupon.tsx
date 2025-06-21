import React from 'react';
import { Download, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CouponProps } from './Coupon.types';
import { couponVariants } from './couponVariants';

export const Coupon: React.FC<CouponProps> = ({
  type,
  brandName,
  description,
  dateRange,
  imageUrl,
}) => {
  const isOwned = type === 'owned';
  const isLiked = type === 'liked';
  const isHot = type === 'hot';

  const styleType = isHot ? 'hotUrgent' : type;

  return (
    <div className="relative flex w-full max-w-md overflow-hidden border border-gray-200 rounded-[1rem] bg-white">
      <div className="flex-1 px-4 py-3 relative bg-white rounded-l-[1rem]">
        <div className="flex items-center gap-2">
          {imageUrl && (
            <img
              src={imageUrl}
              alt={`${brandName} 로고`}
              className="w-10 h-10 mr-3 object-contain rounded-full"
            />
          )}
          <div>
            <p className="subtitle-1">{brandName}</p>
            <p className="body-2 text-gray-600">{description}</p>
            {dateRange && <p className="text-xs text-gray-600">{dateRange}</p>}
          </div>
        </div>
      </div>

      <div className="relative w-4 bg-transparent">
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px border-l border-dashed border-gray-300" />
        <div className="absolute top-0 left-0 w-4 h-4 rounded-bl-full bg-white" />
        <div className="absolute bottom-0 left-0 w-4 h-4 rounded-tl-full bg-white" />
      </div>

      <div className="relative w-20">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-white left-0"
            style={{
              top: `${i * 14 + 8}px`,
              transform: 'translateX(-50%)',
            }}
          />
        ))}

        <div
          className={cn(
            'h-full w-full flex flex-col items-center justify-center px-1 text-white text-center whitespace-pre',
            couponVariants({ type: styleType }),
          )}
        >
          {isOwned && <span className="caption-2">발급 완료</span>}

          {isHot && (
            <>
              <span className="caption-2">쿠폰 받기</span>
              <Download className="w-4 h-4 mt-1" />
            </>
          )}

          {isLiked && <Heart className="w-4.5 h-4.5 text-white" />}
        </div>
      </div>
    </div>
  );
};
