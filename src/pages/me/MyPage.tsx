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
  Crown,
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

  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useUserProfile();

  const month = `${new Date().getMonth() + 1}월`;

  useEffect(() => {
    refetchProfile(); // Fetch the user profile on component mount
  }, [refetchProfile]);

  const { data: coupons = [] } = useQuery({
    queryKey: ['userCoupons'],
    queryFn: fetchUserCoupons,
    refetchOnMount: true,
  });

  const availableCoupons = coupons.filter((c) => c.isUsed === false);

  const [shouldShowLoading, setShouldShowLoading] = useState(false);

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setShouldShowLoading(true), 2000);
      return () => clearTimeout(timer);
    } else {
      setShouldShowLoading(false);
    }
  }, [isLoading]);

  if (isLoading && shouldShowLoading) return <LoadingMooner />;

  if (error) {
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
    formatUsage('데이터', 'data', plan?.data ?? ''),
    formatUsage('통화', 'call', plan?.voice ?? ''),
    formatUsage('공유데이터', 'sharedData', plan?.share_data ?? ''),
    formatUsage('문자', 'sms', plan?.sms ?? ''),
  ];

  return (
    <div className="pb-20 min-h-full">
      {/* 헤더 영역 */}
      <div className="bg-white pt-8 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <img src={IMAGES.MOONER['mooner-phone']} alt="문어 아이콘" className="w-12 h-12" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              안녕하세요, {profile?.name ?? '고객'} 님! 👋
            </h1>
            <p className="text-sm text-gray-500">오늘도 무너와 함께 레벨업 해봐요! 🚀</p>
          </div>
        </div>

        {profile?.email && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-600">📧 {profile.email}</p>
          </div>
        )}
      </div>

      <h1 className="text-xl font-bold text-brand-darkblue mb-4">등급 안내</h1>
      <div className="space-y-4">
        {/* 포인트 & 등급 카드 (최상단으로 이동) */}
        {typeof profile?.point === 'number' && (
          <Card className="bg-white p-0 shadow-sm border-0 overflow-hidden">
            <CardContent className="p-0">
              {/* 포인트 헤더 */}
              <div className="bg-gradient-to-r from-brand-red to-brand-red-hover p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Crown className="w-5 h-5 text-whites" />
                    </div>
                    <div>
                      <p className="text-sm text-white/80">쌓인 포인트</p>
                      <p className="text-xl font-bold text-white">
                        {profile.point.toLocaleString()}P ✨
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/80">패밀리 레벨까지</p>
                    <p className="text-lg font-bold text-brand-yellow">
                      {(5000 - profile.point).toLocaleString()}P 더!
                    </p>
                  </div>
                </div>
              </div>

              {/* 진행바 영역 */}
              <div className="p-4 bg-brand-yellow-light">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">🐙</span>
                  <span className="text-sm text-brand-darkblue font-medium">
                    무너랑 함께 패밀리 레벨 도전중...
                  </span>
                  <span className="text-sm">🎯</span>
                </div>

                {/* 프로그레스바 */}
                <div className="relative">
                  <div className="w-full h-4 bg-white rounded-full overflow-hidden border border-brand-yellow">
                    <div
                      className="h-full bg-gradient-to-r from-brand-yellow to-brand-yellow-hover rounded-full transition-all duration-500 ease-out relative"
                      style={{ width: `${(profile.point / 5000) * 100}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                    </div>
                  </div>
                  {/* 진행 중인 위치에 무너 이모지 */}
                  <div
                    className="absolute top-0 transform -translate-x-1/2 -translate-y-1 transition-all duration-500"
                    style={{ left: `${Math.max(8, Math.min(92, (profile.point / 5000) * 100))}%` }}
                  >
                    <div className="w-6 h-6 bg-brand-yellow rounded-full flex items-center justify-center text-xs shadow-sm border-2 border-white">
                      🐙
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-brand-darkblue mt-3">
                  <span className="font-medium">시작! 💪</span>
                  <span className="bg-brand-yellow px-2 py-1 rounded-full font-bold text-brand-darkblue">
                    와! {((profile.point / 5000) * 100).toFixed(0)}% 완주! 🏃‍♂️
                  </span>
                  <span className="font-medium">패밀리 레벨 🏆</span>
                </div>
              </div>

              {/* 출석 정보 */}
              {typeof profile?.attendanceStreak === 'number' && (
                <div className="p-3 bg-positive-bg border-t">
                  <div className="flex items-center justify-center gap-2">
                    <Calendar className="w-4 h-4 text-positive" />
                    <span className="text-sm font-medium text-positive">
                      {profile.attendanceStreak}일 연속 출석 중이에요! 🔥
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 내 요금제 */}
        {(() => {
          if (profileLoading) {
            return (
              <div className="space-y-2 py-4 px-4 bg-gray-200 rounded-lg text-center">
                <h3 className="text-lg font-bold text-gray-700">요금제를 불러오는 중입니다...</h3>
              </div>
            );
          }
          if (plan) {
            return (
              <>
                <h1 className="text-xl font-bold text-brand-darkblue mb-4 align-center">
                  내 요금제
                </h1>
                <BillSummaryCard
                  phoneNumber={profile?.phoneNumber ?? '010-****-****'}
                  planName={plan?.name ?? '기본 요금제'}
                  month={month}
                  amount={Number(plan?.price)}
                  usageData={usageData}
                />
              </>
            );
          }
          return (
            <div className="space-y-2 py-4 px-4 bg-gray-200 rounded-lg text-center">
              <h3 className="text-lg font-bold text-gray-700">요금제가 없어요 😢</h3>
              <p className="text-sm text-gray-500">
                아직 가입한 요금제가 없습니다.
                <br />
                무너와 함께 완벽한 요금제를 찾아보세요! 🚀
              </p>
            </div>
          );
        })()}

        {/* 빠른 액세스 */}
        <h1 className="text-xl font-bold text-brand-darkblue mb-4 align-center">자주 찾는 메뉴</h1>
        <div className="flex gap-3">
          <Link to="coupons">
            <div className="bg-brand-yellow-light border border-brand-yellow rounded-xl p-4 hover:bg-brand-yellow/20 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-yellow rounded-full flex items-center justify-center">
                    <Ticket className="w-5 h-5 text-brand-darkblue" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-darkblue">쿠폰함 💝</p>
                    <p className="text-lg font-bold text-brand-darkblue">
                      {availableCoupons.length}개 대기중!
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
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

        {/* 내 서비스 */}
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
          <Link to="/plans">
            <div className="bg-blue-50 rounded-xl p-4 text-center hover:bg-blue-100 transition-colors cursor-pointer">
              <span className="text-sm font-medium text-brand-darkblue">다른 요금제 구경하기</span>
            </div>
          </Link>
          <Link to={`/plans/${profile?.planId}`}>
            <div className="bg-negative-bg rounded-xl p-4 text-center hover:bg-negative/20 transition-colors cursor-pointer">
              <span className="text-sm font-medium text-negative">요금제 해지하기</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
