import { useEffect, useState } from 'react';
import { Benefit } from '@/types/uplus';
import { getMonthlyBenefits } from '@/apis/uplus/benefit';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/pagination';
import { getBrandBackgroundColor } from '@/utils/brandColor';
import { getDday } from '@/utils/format/getDday';
interface UplusBenefitPreviewProps {
  onLoadComplete?: () => void;
}
export const UplusBenefitPreview = ({ onLoadComplete }: UplusBenefitPreviewProps) => {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    getMonthlyBenefits()
      .then((data) => {
        setBenefits(data);
        onLoadComplete?.();
      })
      .catch((err) => {
        console.error('❌ 유플 혜택 조회 실패:', err);
        onLoadComplete?.();
      });
  }, [onLoadComplete]);

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
        {benefits.map((benefit, index) => {
          const dday = getDday(new Date(benefit.date));
          return (
            <SwiperSlide
              key={`${benefit.brand}-${benefit.date}-${index}`}
              className="!w-auto pt-2.5"
            >
              <div
                className={`w-[100px] h-[100px] ${getBrandBackgroundColor(benefit.brand)} 
                            cursor-pointer flex-shrink-0 rounded-3xl relative overflow-hidden 
                            transform transition-transform hover:scale-105 hover:shadow-lg`}
              >
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

      {/* 툴팁 메시지 - 하단 중앙 고정 */}
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
