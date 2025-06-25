import { BillSummaryCard } from '@/components/ui/billsummarycard';
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/Card';
import { useQuery } from '@tanstack/react-query';
import { fetchCurrentPlan } from '@/apis/plan/getCurrentPlan';
import { useUserProfile } from '@/stores/useUserProfile';
import {
  Ticket,
  Package,
  FolderHeart,
  Stamp,
  ClipboardCheck,
  Calendar,
  ChevronRight,
  LinkIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { IMAGES } from '@/constant/imagePath';
import { fetchUserCoupons } from '@/apis/coupon/getUserCoupons';
import LoadingMooner from '@/pages/common/LoadingMooner';
import Empty from '@/pages/common/Empty';

const MyPage: React.FC = () => {
  const {
    data: plan,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['currentPlan'],
    queryFn: fetchCurrentPlan,
  });
  const { data: profile } = useUserProfile();

  const month = `${new Date().getMonth() + 1}월`;

  const { data: coupons = [] } = useQuery({
    queryKey: ['userCoupons'],
    queryFn: fetchUserCoupons,
    refetchOnMount: true,
  });

  const availableCoupons = coupons.filter((c) => c.isUsed === false);

  const [showErrorFallback, setShowErrorFallback] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (isLoading) {
      timeout = setTimeout(() => setShowErrorFallback(true), 5000);
    } else {
      setShowErrorFallback(false);
    }

    return () => clearTimeout(timeout);
  }, [isLoading]);

  if (isLoading) {
    if (showErrorFallback) {
      return (
        <Empty
          imageSrc={IMAGES.MOONER['mooner-sad']}
          altText="요금제 에러"
          message="요금제를 불러오지 못했습니다"
          buttonText="다시 시도하기"
          onClickButton={refetch}
        />
      );
    }

    return (
      <div className="fixed inset-0 z-55 bg-white items-center flex justify-center">
        <div className="scale-125">
          <LoadingMooner />
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <Empty
        imageSrc={IMAGES.MOONER['mooner-sad']}
        altText="요금제 에러"
        message="요금제를 불러오지 못했습니다"
        buttonText="다시 시도하기"
        onClickButton={refetch}
      />
    );
  }

  const formatUsage = (
    label: string,
    variant: 'data' | 'call' | 'sharedData' | 'sms',
    value: string,
  ) => {
    if (!value) {
      return {
        label,
        variant,
        current: 0,
        total: 1,
        displayText: '0',
      };
    }
    const isUnlimited = value.includes('무제한');
    const total =
      variant === 'data'
        ? 30
        : variant === 'sharedData'
          ? 60
          : variant === 'sms'
            ? 200
            : variant === 'call'
              ? 1000
              : 1;
    const numeric = isUnlimited ? total : Number(value.replace(/[^0-9.]/g, ''));
    return {
      label,
      variant,
      current: numeric,
      total,
      displayText: isUnlimited ? '무제한' : variant === 'sms' ? `${numeric}건` : value,
    };
  };

  const usageData = [
    formatUsage('데이터', 'data', plan.data),
    formatUsage('통화', 'call', plan.voice),
    formatUsage('공유데이터', 'sharedData', plan.share_data),
    formatUsage('문자', 'sms', plan.sms),
  ];

  return (
    <div className="pb-20 min-h-full">
      <div className="bg-white pt-4 pb-6 px-4">
        <div className="flex items-center gap-3 mb-4">
          <img src={IMAGES.MOONER['mooner-phone']} alt="문어 아이콘" className="w-15 h-15" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              안녕하세요, {profile?.name ?? '고객'} 님!
            </h1>
            <p className="text-sm text-gray-500">오늘도 무너와 함께 레벨업 해봐요</p>
          </div>
        </div>

        {profile?.email && (
          <div className="bg-gray-100 rounded-lg p-3 mb-2">
            <p className="text-sm text-gray-600">📧 {profile.email}</p>
          </div>
        )}
      </div>
      <div className="px-4">
        <h1 className="text-xl font-bold text-brand-darkblue mb-4">내 요금제</h1>
        <BillSummaryCard
          phoneNumber={profile?.phoneNumber ?? '010-****-****'}
          planName={plan.name}
          month={month}
          amount={Number(plan.price)}
          usageData={usageData}
        />
        <h1 className="text-xl font-bold text-brand-darkblue mt-4 mb-4">등급 안내</h1>
        <div className="space-y-4">
          {typeof profile?.point === 'number' && (
            <Card className="bg-white p-0 shadow-sm border-0 overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-brand-yellow p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/50 rounded-full flex items-center justify-center">
                        <span className="text-xl leading-none">💸</span>
                      </div>
                      <div>
                        <p className="text-sm text-brand-darkblue">쌓인 포인트</p>
                        <p className="text-xl font-bold text-[#e63e3e]">
                          {profile.point.toLocaleString()}P
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-brand-darkblue">패밀리 레벨까지</p>
                      <p className="text-sm font-bold text-brand-darkblue">
                        {(5000 - profile.point).toLocaleString()}P 더!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-brand-darkblue font-medium">
                      무너랑 함께 패밀리 레벨 도전중..
                    </span>
                  </div>

                  <div className="relative">
                    <div className="w-full h-4 bg-white rounded-full overflow-hidden border border-brand-yellow">
                      <div
                        className="h-full bg-gradient-to-r from-brand-yellow to-[#f94941] rounded-full transition-all duration-500 ease-out relative"
                        style={{ width: `${(profile.point / 5000) * 100}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                      </div>
                    </div>
                    <div
                      className="absolute top-0 transform -translate-x-1/2 -translate-y-1 transition-all duration-500"
                      style={{
                        left: `${Math.max(8, Math.min(92, (profile.point / 5000) * 100))}%`,
                      }}
                    >
                      <div
                        className="w-8 h-8 bg-brand-yellow rounded-full flex items-center justify-center text-base shadow-sm border-2 border-white -mt-1"
                        style={{ fontSize: '18px' }}
                      >
                        🏃‍♂️
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-brand-darkblue mt-3">
                    <span className="font-medium">시작</span>
                    <span className="bg-white px-2 py-1 font-lg rounded-full font-bold text-[#e63e3e]">
                      {((profile.point / 5000) * 100).toFixed(0)}% 완주
                    </span>
                    <span className="font-medium">
                      패밀리 레벨 <br />
                      5000
                    </span>
                  </div>
                </div>

                {typeof profile?.attendanceStreak === 'number' && (
                  <div className="p-3 bg-white">
                    <div className="flex items-center justify-center gap-2">
                      <Calendar className="w-4 h-4 text-positive" />
                      <span className="text-sm font-medium text-brand-darkblue">
                        {profile.attendanceStreak}일 연속 출석 중이에요!
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <h1 className="text-xl font-bold text-brand-darkblue mb-4 align-center">
            자주 찾는 메뉴
          </h1>
          <div className="flex gap-3">
            <Link to="coupons" className="w-1/2">
              <div className="w-full bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-14 h-11 bg-white rounded-full flex items-center justify-center">
                      <Ticket className="w-6 h-6 text-[#e0b817]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-brand-darkblue whitespace-nowrap">
                        쿠폰함
                      </p>
                      <p className="text-lg font-bold text-brand-darkblue">
                        {availableCoupons.length}개
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 ml-4 text-gray-400" />
                </div>
              </div>
            </Link>

            <Link to="/me/mooner-zone" className="w-1/2">
              <div className="w-full bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-14 h-11 flex items-center justify-center mr-1">
                      <LinkIcon className="w-6 h-6 text-[#f87171]" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-brand-darkblue">무너존</p>
                      <p className="text-lg font-bold text-brand-darkblue">HOT</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 ml-4 text-gray-400" />
                </div>
              </div>
            </Link>
          </div>

          <h1 className="text-xl font-bold text-brand-darkblue mb-4 align-center">내 서비스</h1>
          <div className="space-y-2">
            <Link to="subscriptions">
              <div className="flex items-center justify-between py-3 px-1 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-red-light rounded-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-brand-red" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">나의 유독 Pick </span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Link>

            <Link to="/mission" state={{ scrollTo: 'mission-list' }}>
              <div className="flex items-center justify-between py-3 px-1 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-yellow-light rounded-full flex items-center justify-center">
                    <ClipboardCheck className="w-5 h-5 text-brand-darkblue" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">이번 달의 출석 기록</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Link>

            <Link to="/mission" state={{ scrollTo: 'attendance' }}>
              <div className="flex items-center justify-between py-3 px-1 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-positive-bg rounded-full flex items-center justify-center">
                    <Stamp className="w-5 h-5 text-positive" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">매일매일 출석 체크</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Link>

            <Link to="likes">
              <div className="flex items-center justify-between py-3 px-1 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-darkblue-light rounded-full flex items-center justify-center">
                    <FolderHeart className="w-5 h-5 text-brand-darkblue" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">좋아요한 쿠폰 목록</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Link>
          </div>

          <h1 className="text-xl font-bold text-brand-darkblue mb-4 align-center">요금제 변경</h1>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-xl p-4 text-center hover:bg-blue-100 transition-colors cursor-pointer">
              <span className="text-sm font-medium text-brand-darkblue">다른 요금제 구경하기</span>
            </div>
            <div className="bg-negative-bg rounded-xl p-4 text-center hover:bg-negative/20 transition-colors cursor-pointer">
              <span className="text-sm font-medium text-negative">요금제 해지하기</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
