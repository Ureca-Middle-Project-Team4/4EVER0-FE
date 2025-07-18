import { useState } from 'react';
import { BaseCalendar } from '@/components/Calendar/BaseCalendar';
import { format, isSameDay } from 'date-fns';
import { Benefit } from '@/types/uplus';
import { getBrandDotColor } from '@/utils/brandColor';
import { BenefitDetailModal } from './UplusBenefitDetail';

interface UplusCalendarProps {
  selectedCategory: string;
  benefits: Benefit[] | null;
}

export const UplusCalendar = ({ selectedCategory, benefits }: UplusCalendarProps) => {
  const [month, setMonth] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // 날짜 클릭 핸들러
  const handleDateClick = (date: Date, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return;
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  if (!benefits) {
    return null; // 로딩 메시지 제거
  }

  // 선택된 카테고리에 따라 필터링
  const filteredBenefits =
    selectedCategory === '전체'
      ? benefits
      : benefits.filter((b) => b.category === selectedCategory);

  return (
    <>
      <BaseCalendar
        currentMonth={month}
        onMonthChange={setMonth}
        renderDay={(date, isCurrentMonth) => {
          // 해당 날짜의 모든 혜택 찾기 (필터된 데이터에서만)
          const dayBenefits = filteredBenefits.filter((benefit) =>
            isSameDay(new Date(benefit.date), date),
          );

          return (
            <div
              className="flex flex-col items-center justify-center h-full relative cursor-pointer hover:bg-gray-50 transition-colors rounded"
              onClick={() => handleDateClick(date, isCurrentMonth)}
            >
              <span className="relative z-10">{format(date, 'd')}</span>

              {/* 혜택이 있는 날짜에 작은 점들 표시 */}
              {dayBenefits.length > 0 && isCurrentMonth && (
                <div className="absolute bottom-1 flex gap-0.5 justify-center">
                  {dayBenefits.slice(0, 3).map((benefit, index) => (
                    <div
                      key={`${benefit.brand}-${index}`}
                      className={`w-1.5 h-1.5 ${getBrandDotColor(benefit.brand)} rounded-full`}
                      title={benefit.brand}
                    />
                  ))}
                  {/* 2개 이상의 혜택이 있으면 +표시 */}
                  {dayBenefits.length > 2 && (
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex items-center justify-center">
                      <span className="text-[4px] text-white font-bold leading-none">+</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        }}
      />
      {/* 모달 추가 */}
      <BenefitDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedDate}
      />
    </>
  );
};
