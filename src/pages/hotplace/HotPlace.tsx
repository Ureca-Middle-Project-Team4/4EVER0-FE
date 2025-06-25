import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getTopCoupons, TopCoupon } from '@/apis/coupon/getTopCoupons';
import TopCouponCard from '@/components/TopCouponCard/TopCouponCard';
import PopupMap from './PopupMap/PopupMap';
import StoreMap from './StoreMap/StoreMap';
import { Card, CardContent } from '@/components/Card';
import { MapPin, Store, TrendingUp } from 'lucide-react';
import { IMAGES } from '@/constant/imagePath';
import LoadingMooner from '@/pages/common/LoadingMooner';
import { fetchLikedCoupons } from '@/apis/like/getLikeCoupons';
import { Button } from '@/components/Button';

const allBrandIds = [1, 2, 3, 4, 5, 6, 7, 8];

const HotPlace = () => {
  const [bestDeals, setBestDeals] = useState<TopCoupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [option, setOption] = useState<'popup' | 'store'>('popup');
  const [mapLoading, setMapLoading] = useState(true);
  const [showMapLoader, setShowMapLoader] = useState(false);

  const [searchParams] = useSearchParams();
  const subscribedBrandIdsParam = searchParams.get('subscribedBrandIds');
  const [selectedBrandIds, setSelectedBrandIds] = useState<number[] | null>(null);

  //렌더링 시 하트 설정 방법
  useEffect(() => {
    if (subscribedBrandIdsParam) {
      // 쿼리 파라미터가 있으면 최우선
      const brandIds = subscribedBrandIdsParam
        .split(',')
        .map((id) => Number(id))
        .filter((id) => !isNaN(id));
      setSelectedBrandIds(brandIds.length > 0 ? brandIds : []);
    } else {
      // 쿼리 파라미터 없으면, API 호출
      const loadLikedBrandIds = async () => {
        try {
          const likedCoupons = await fetchLikedCoupons();
          const brandIds = Array.from(new Set(likedCoupons.map((c) => c.brand_id)));
          setSelectedBrandIds(brandIds.length > 0 ? brandIds : [1, 3, 4]);
        } catch {
          setSelectedBrandIds([1, 3, 4]);
        }
      };
      loadLikedBrandIds();
    }
  }, [subscribedBrandIdsParam]);

  useEffect(() => {
    if (mapLoading) {
      const timer = setTimeout(() => setShowMapLoader(true), 2000);
      return () => clearTimeout(timer);
    } else {
      setShowMapLoader(false);
    }
  }, [mapLoading]);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const result = await getTopCoupons();
        setBestDeals(result);
      } catch (error) {
        console.error('쿠폰 API 호출 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  const getDiscountLabel = (deal: TopCoupon) => {
    if (!deal) return '';
    return deal.discountType === 'PERCENT'
      ? `${deal.discountValue}% 할인`
      : `${deal.discountValue.toLocaleString()}원 할인`;
  };

  return (
    <div className="space-y-4 min-h-full overflow-y">
      {/* 헤더 섹션 */}
      <div className="px-4 ">
        <div className="flex items-start gap-2 mt-4 text-brand-darkblue">
          <h2 className="title-1 flex items-center text-brand-darkblue gap-2">
            <img src={IMAGES.MOONER['mooner-hotplace']} alt="문어 아이콘" className="w-15 h-15" />
            요즘 뜨는 핫플레이스를 찾고, <br />내 근처 쿠폰을 저장해보세요!
          </h2>
        </div>
        {/* MZ PICK 배너 */}
        <div className="mt-6 mb-4">
          <Card className="bg-gradient-to-r from-brand-yellow to-brand-red text-white">
            <CardContent className="py-2 px-3">
              <div className="flex flex-col items-center justify-center text-center gap-1">
                {/* 아이콘 + 제목 가로 정렬 */}
                <div className="flex items-center justify-center gap-1">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-bold">요즘 핫한 MZ들의 PICK은?!</span>
                </div>
                {/* 설명 문구 */}
                {/* <span className="font-semibold text-sm">
                  지금 Top3 쿠폰을 확인하고 지도에서 주변 매장을 찾아보세요 !
                </span> */}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 인기 쿠폰 섹션 */}
      <div className="px-4">
        {/* 쿠폰 리스트 */}
        <div className="grid grid-cols-3 sm:grid-cols-3 xs:grid-cols-2 gap-4 justify-items-center pt-4">
          {[0, 1, 2].map((index) => (
            <TopCouponCard
              key={index}
              deal={bestDeals[index]}
              index={index}
              isLoading={isLoading}
              getDiscountLabel={getDiscountLabel}
            />
          ))}
        </div>
      </div>

      {/* 맵 선택 섹션 */}
      <div className="px-4 pt-5">
        {/* <h1 className="text-xl font-bold text-brand-darkblue mb-4">지도 보기</h1> */}
        <div className="w-[90%] mx-auto flex justify-center items-center gap-5">
          <Button
            variant="categoryFilter"
            size="categoryFilter"
            onClick={() => setOption('popup')}
            className={option === 'popup' ? 'bg-blue-50 border-blue-200' : 'border-border'}
          >
            <MapPin className={`w-6 h-6 ${option === 'popup' ? 'text-blue-600' : ''}`} />
            <span className={`caption-1 font-medium ${option === 'popup' ? 'text-blue-600' : ''}`}>
              팝업맵 보기
            </span>
          </Button>

          <Button
            variant="categoryFilter"
            size="categoryFilter"
            onClick={() => setOption('store')}
            className={option === 'store' ? 'bg-blue-50 border-blue-200' : 'border-border'}
          >
            <Store className={`w-6 h-6 ${option === 'store' ? 'text-blue-600' : ''}`} />
            <span
              className={`caption-1 font-medium text-md ${option === 'store' ? 'text-blue-600' : ''}`}
            >
              스토어맵 보기
            </span>
          </Button>
        </div>
      </div>

      {/* 지도 컨텐츠 */}
      <div className="px-4 pb-4">
        <Card>
          <CardContent className="p-0 h-125">
            {showMapLoader ? (
              <div className="h-[600px] flex items-center justify-center">
                <LoadingMooner />
              </div>
            ) : option === 'popup' ? (
              <PopupMap onLoadingChange={setMapLoading} />
            ) : (
              <StoreMap
                key={selectedBrandIds?.join('-') ?? ''}
                allBrandIds={allBrandIds}
                selectedIds={selectedBrandIds ?? []}
                onLoadingChange={setMapLoading}
                onChangeSelectedIds={setSelectedBrandIds}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HotPlace;
