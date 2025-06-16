import { BillSummaryCard } from '@/components/ui/billsummarycard';
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchCurrentPlan } from '@/apis/plan/getCurrentPlan';
import { useUserProfile } from '@/stores/useUserProfile';

const MyPage: React.FC = () => {
  const {
    data: plan,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['currentPlan'],
    queryFn: fetchCurrentPlan,
  });
  const { data: profile } = useUserProfile();

  const month = `${new Date().getMonth() + 1}월`;

  if (isLoading) return <p className="p-4">로딩 중...</p>;
  if (error || !plan) return <p className="p-4">요금제를 불러오지 못했습니다.</p>;

  return (
    <div className="p-4 mt-12">
      <BillSummaryCard
        phoneNumber={profile?.phoneNumber ?? '010-****-****'}
        planName={plan.name}
        month={month}
        amount={Number(plan.price)}
        usageData={[
          {
            label: '데이터',
            variant: 'data',
            current: plan.data === '무제한' ? 1 : Number(plan.data.replace('GB', '')),
            total: 1,
            displayText: plan.data,
          },
          {
            label: '통화',
            variant: 'call',
            current: plan.voice === '무제한' ? 1 : Number(plan.voice.replace('분', '')),
            total: 1,
            displayText: plan.voice,
          },
          {
            label: '문자',
            variant: 'sms',
            current: plan.sms === '무제한' ? 1 : Number(plan.sms),
            total: 1,
            displayText: plan.sms === '무제한' ? '무제한' : `${plan.sms}건`,
          },
        ]}
      />
      <Outlet />
    </div>
  );
};

export default MyPage;

{
  /* <nav>
        <Link to="coupons">쿠폰</Link> |<Link to="likes">좋아요</Link> |
        <Link to="events">이벤트</Link> |<Link to="change-plans">요금제 변경</Link>
      </nav> */
}
