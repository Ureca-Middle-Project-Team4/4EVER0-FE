import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchUserCoupons } from '@/apis/coupon/getUserCoupons';
import type { Coupon } from '@/types/coupon';
import { Ticket } from 'lucide-react';
import Empty from '@/pages/common/Empty';
import { IMAGES } from '@/constant/imagePath';
import { Coupon as CouponCard } from '@/components/Coupon/Coupon';

const Coupons: React.FC = () => {
  const { data: coupons = [], isLoading } = useQuery<Coupon[]>({
    queryKey: ['userCoupons'],
    queryFn: fetchUserCoupons,
  });

  const availableCoupons = coupons.filter((c) => !c.isUsed);
  if (isLoading) return <div className="p-4">로딩 중...</div>;
  console.log(
    availableCoupons.map((c) => ({
      title: c.title,
      startDate: c.startDate,
      endDate: c.endDate,
    })),
  );

  return (
    <div className="px-4 py-6 pb-24">
      <div className="text-center mb-6">
        <div className="text-center flex flex-col items-center gap-1">
          <Ticket className="w-5 h-5 text-yellow-600" />
          <div className="text-3xl font-bold">{availableCoupons.length}개</div>
          <div className="text-sm text-gray-500">보유 쿠폰</div>
        </div>
      </div>

      {availableCoupons.length === 0 ? (
        <Empty
          imageSrc={IMAGES.MOONER['mooner-sad']}
          altText="보유 쿠폰 없음"
          message="보유한 쿠폰이 없습니다."
          buttonText="유독 라이프 혜택 PICK 하러가기"
          buttonLink="/home"
        />
      ) : (
        <div className="flex flex-col gap-4">
          {availableCoupons.map((coupon) => (
            <CouponCard
              key={coupon.couponId}
              type="owned"
              brandName={coupon.brand.name}
              description={coupon.title}
              dateRange={`${coupon.startDate?.replace(/-/g, '.')} - ${coupon.endDate?.replace(/-/g, '.')}`}
              imageUrl={coupon.brand.imageUrl}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Coupons;
