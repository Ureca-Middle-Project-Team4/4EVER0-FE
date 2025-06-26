import { useState } from 'react';
import { Benefit } from '@/types/uplus';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/pagination';
import { getBrandBackgroundColor } from '@/utils/brandColor';
import { getDday } from '@/utils/format/getDday';
import { cn } from '@/lib/utils';

interface UplusBenefitPreviewProps {
  selectedCategory: string;
  benefits: Benefit[] | null;
}

export const UplusBenefitPreview = ({ selectedCategory, benefits }: UplusBenefitPreviewProps) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (benefits === null) {
    return null; // 로딩 메시지 제거
  }

  // 카테고리 필터링 적용
  const filteredBenefits =
    selectedCategory === '전체'
      ? (benefits ?? [])
      : (benefits ?? []).filter((benefit) => benefit.category === selectedCategory);

  const sortedBenefits = [...(filteredBenefits ?? [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <div
      className="w-full overflow-visible relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <Swiper
        slidesPerView="auto"
        spaceBetween={12}
        freeMode
        pagination={{ clickable: true, dynamicBullets: true }}
        modules={[FreeMode, Pagination]}
        className="benefit-swiper overflow-visible"
        style={{ paddingBottom: '30px' }}
      >
        {sortedBenefits.map((benefit, index) => {
          const benefitDate = new Date(benefit.date);
          const isPast = benefitDate < new Date(new Date().setHours(0, 0, 0, 0));
          const dday = getDday(benefitDate);

          return (
            <SwiperSlide
              key={`${benefit.brand}-${benefit.date}-${index}`}
              className="!w-auto pt-2.5"
            >
              <div
                className={cn(
                  'w-[100px] h-[100px] cursor-pointer flex-shrink-0 rounded-3xl relative overflow-hidden transform transition-transform hover:scale-105',
                  getBrandBackgroundColor(benefit.brand),
                )}
              >
                {/* 지난 혜택일 경우 어둡게 오버레이 추가 */}
                {isPast && (
                  <div className="absolute inset-0 bg-black/40 z-20 pointer-events-none" />
                )}
                {/* D-day - 왼쪽 상단 */}
                <div className="absolute top-2.5 left-4 text-white font-semibold text-base z-10 tracking-wider">
                  {dday}
                </div>

                {/* 브랜드 로고 - 오른쪽 하단, 원형 */}
                <div className="absolute bottom-3 right-3 w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg z-10">
                  <img
                    src={benefit.imageUrl}
                    alt={benefit.brand}
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const fallbackElement = target.parentElement?.querySelector(
                        '.fallback-text',
                      ) as HTMLElement;
                      if (fallbackElement) {
                        fallbackElement.style.display = 'flex';
                      }
                    }}
                  />
                  <div className="fallback-text w-full h-full rounded-full bg-gray-100 items-center justify-center text-xs font-bold text-gray-600 hidden">
                    {benefit.brand.slice(0, 2)}
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* 툴팁 메시지 */}
      {showTooltip && (
        <div
          className="absolute left-1/2 bottom-[-36px] -translate-x-1/2 z-50 px-3 py-1.5
                      bg-neutral-800 text-white text-xs rounded-lg shadow-xl 
                      pointer-events-none transition-opacity duration-200 animate-fade-in 
                      font-medium tracking-wide"
        >
          좌우로 넘겨보세요!
        </div>
      )}
    </div>
  );
};
