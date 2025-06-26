// 선택된 날짜의 상세 혜택 내용 표시
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
} from '@/components/Modal/Modal';
import { getBenefitByDate } from '@/apis/uplus/benefit';
import { BenefitDetail } from '@/types/uplus';
import { getCategoryEmoji } from '@/utils/emoji/getCategoryEmoji';
import { formatDateWithDay } from '@/utils/format/formatDateWithDay';
import { getDday } from '@/utils/format/getDday';
import Empty from '@/pages/common/Empty';
import { IMAGES } from '@/constant/imagePath';
import { useNavigate } from 'react-router-dom';

interface BenefitDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
}

export const BenefitDetailModal = ({ isOpen, onClose, selectedDate }: BenefitDetailModalProps) => {
  const [benefits, setBenefits] = useState<BenefitDetail[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && selectedDate) {
      setLoading(true);
      setError(null);
      setBenefits(null);

      const dateString = format(selectedDate, 'yyyy-MM-dd');

      getBenefitByDate(dateString)
        .then((data) => {
          setBenefits(data);
        })
        .catch((err) => {
          console.error('❌ 날짜별 혜택 조회 실패:', err);
          setError('혜택 정보를 불러오는데 실패했습니다.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, selectedDate]);

  if (!selectedDate) return null;

  const formattedDate = formatDateWithDay(selectedDate);
  const dday = getDday(selectedDate);

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent size="sm" className="max-h-[80vh] overflow-hidden border-0">
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2">
            📅 {formattedDate}
            <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              {dday}
            </span>
          </ModalTitle>
          <ModalDescription>이 날짜의 유플투쁠 혜택을 확인하세요</ModalDescription>
        </ModalHeader>

        <div className="overflow-y-auto max-h-96 scrollbar-hide">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">혜택 정보를 불러오는 중...</div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-8">
              <div className="text-red-500">{error}</div>
            </div>
          )}

          {benefits && benefits.length === 0 && (
            <Empty
              imageSrc={IMAGES.MOONER['mooner-sad']}
              altText="슬픈 무너"
              message="이 날짜에는 제공되는 혜택이 없어요."
              buttonText="닫기"
              onClickButton={() => navigate(-1)}
            />
          )}

          {benefits && benefits.length > 0 && (
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div
                  key={`${benefit.brand}-${index}`}
                  className="flex items-start gap-4 p-4 border-0 rounded-lg drop-shadow-sm hover:bg-gray-50 transition-colors"
                >
                  {/* 브랜드 로고 */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}
                  >
                    <img
                      src={benefit.imageUrl}
                      alt={benefit.brand}
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    <div className="w-8 h-8 bg-white bg-opacity-80 rounded-full items-center justify-center text-xs font-bold text-gray-700 hidden">
                      {benefit.brand.slice(0, 2)}
                    </div>
                  </div>

                  {/* 혜택 정보 */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{benefit.brand}</h3>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full flex items-center gap-1">
                        {getCategoryEmoji(benefit.category)} {benefit.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ModalContent>
    </Modal>
  );
};
