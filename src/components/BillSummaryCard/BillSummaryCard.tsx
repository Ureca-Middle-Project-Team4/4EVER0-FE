import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import { Progress } from '@/components/Progress/Progress';
import { BillSummaryCardProps } from './BillSummaryCard.types';
import { formatPrice } from '@/utils/priceUtils';

const BillSummaryCard = ({
  phoneNumber,
  planName,
  month,
  amount,
  usageData,
  isExpanded: controlledExpanded,
  onToggle,
}: BillSummaryCardProps) => {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const expanded = controlledExpanded ?? internalExpanded;

  const handleToggle = () => {
    if (onToggle) onToggle();
    else setInternalExpanded(!expanded);
  };

  return (
    <div className="w-full rounded-xl p-4 shadow-sm bg-card text-card-foreground border border-gray-50 hover:shadow-md transition-all">
      <div className="flex justify-between items-center mb-1">
        <p className="title-2">{phoneNumber}</p>
        <button
          onClick={handleToggle}
          className="w-8 h-8 p-1 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-full transition"
          aria-label="상세 요금 펼치기"
        >
          {expanded ? (
            <ChevronUpIcon className="w-5 h-5" />
          ) : (
            <ChevronDownIcon className="w-5 h-5" />
          )}
        </button>
      </div>
      <p className="caption-1 text-gray-400 mb-3">{planName}</p>
      <hr className="border-t border-gray-200 my-3" />
      <p className="body-1 mb-0">{month} 청구요금</p>
      <div className="flex justify-between items-center mt-1">
        <p className="caption-1 text-gray-400">납부 완료</p>
        <p className="title-1 text-[var(--color-brand-darkblue)] text-right">
          {formatPrice(amount)}
        </p>
      </div>
      {expanded && usageData && (
        <div className="mt-4 space-y-4">
          {usageData.map((item, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between caption-1 text-gray-700">
                <span>{item.label}</span>
                <span>{item.displayText ? ` ${item.displayText}` : ''}</span>
              </div>
              <Progress
                variant={item.variant}
                current={item.current}
                total={item.total}
                showFraction={false}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BillSummaryCard;
