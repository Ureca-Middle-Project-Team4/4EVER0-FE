export type UsageVariant = 'data' | 'call' | 'video' | 'sms';

export interface UsageData {
  label: string;
  variant: UsageVariant;
  current: number;
  total: number;
  displayText?: string;
}

export interface BillSummaryCardProps {
  phoneNumber: string;
  planName: string;
  month: string;
  amount: number;
  isExpanded?: boolean;
  usageData?: UsageData[];
  onToggle?: () => void;
}
