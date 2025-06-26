import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { cn } from '@/lib/utils';
import { getMainSubscriptions } from '@/apis/subscription/getMainSubscriptions';
import { getBrands, getBrandsByCategory } from '@/apis/subscription/getLifeSubscriptions';
import { usePostSubscription } from '@/hooks/usePostSubscription';
import type { SubscriptionItem } from '@/types/subscription';
import type { Brand, BrandCategory } from '@/types/brand';

import { SubscriptionHeader } from './SubscriptionHeader';
import { MainSubscriptionStep } from './MainSubscriptionStep';
import { LifeBenefitsStep } from './LifeBenefitsStep';
import { PaymentStep } from './PaymentStep';

interface SubscriptionStepsProps {
  className?: string;
}

type Step = 'main' | 'life' | 'payment';

export const SubscriptionSteps = ({ className }: SubscriptionStepsProps) => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthStore();

  // 단계 관리
  const [currentStep, setCurrentStep] = useState<Step>('main');
  const [selectedMainItems, setSelectedMainItems] = useState<SubscriptionItem[]>([]);
  const [selectedLifeBrands, setSelectedLifeBrands] = useState<Brand[]>([]);

  // 데이터 상태
  const [mainSubscriptions, setMainSubscriptions] = useState<SubscriptionItem[]>([]);
  const [lifeBrands, setLifeBrands] = useState<Brand[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<BrandCategory>('전체');
  const [loading, setLoading] = useState(false);

  // React Query 구독 가입 mutation
  const subscribeMutation = usePostSubscription({
    onSuccess: (data) => {
      console.log('구독 성공:', data.data);
      navigate('/me/subscriptions');
    },
    onError: (error) => {
      console.error('구독 실패:', error);
    },
  });

  // 메인 구독 상품 로딩
  useEffect(() => {
    const loadMainSubscriptions = async () => {
      setLoading(true);
      try {
        const response = await getMainSubscriptions();
        console.log('API 응답:', response);
        if (response.status === 200 && response.data) {
          setMainSubscriptions(response.data);
        }
      } catch (error) {
        console.error('메인 구독 상품 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMainSubscriptions();
  }, []);

  // 라이프 브랜드 로딩
  useEffect(() => {
    if (currentStep !== 'life') return;

    const loadLifeBrands = async () => {
      setLoading(true);
      try {
        const response =
          selectedCategory === '전체'
            ? await getBrands()
            : await getBrandsByCategory(selectedCategory);

        if (response.status === 200 && response.data) {
          setLifeBrands(response.data);
        }
      } catch (error) {
        console.error('라이프 브랜드 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLifeBrands();
  }, [currentStep, selectedCategory]);

  // 메인 구독 선택/해제 (단일 선택)
  const toggleMainSubscription = (item: SubscriptionItem) => {
    setSelectedMainItems((prev) => {
      const exists = prev.find((sub) => sub.id === item.id);
      if (exists) {
        return []; // 이미 선택된 것을 클릭하면 해제
      } else {
        return [item]; // 새로운 것을 클릭하면 기존 선택 해제하고 새로 선택
      }
    });
  };

  // 라이프 브랜드 선택/해제 (단일 선택)
  const toggleLifeBrand = (brand: Brand) => {
    setSelectedLifeBrands((prev) => {
      const exists = prev.find((b) => b.id === brand.id);
      if (exists) {
        return []; // 이미 선택된 것을 클릭하면 해제
      } else {
        return [brand]; // 새로운 것을 클릭하면 기존 선택 해제하고 새로 선택
      }
    });
  };

  // 다음 단계로
  const handleNext = () => {
    if (currentStep === 'main' && selectedMainItems.length > 0) {
      setCurrentStep('life');
    } else if (currentStep === 'life') {
      setCurrentStep('payment');
    } else if (currentStep === 'payment') {
      handleSubscribe();
    }
  };

  // 이전 단계로
  const handlePrev = () => {
    if (currentStep === 'life') {
      setCurrentStep('main');
    } else if (currentStep === 'payment') {
      setCurrentStep('life');
    }
  };

  // 로그인 확인 및 리다이렉트
  const handleLoginCheck = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return false;
    }
    return true;
  };

  // 구독 가입 처리 (단일 선택이)
  const handleSubscribe = async () => {
    if (!handleLoginCheck()) return;

    // 선택된 메인 구독과 라이프 브랜드로 가입 처리
    if (selectedMainItems.length > 0 && selectedLifeBrands.length > 0) {
      subscribeMutation.mutate({
        subscription_id: selectedMainItems[0].id,
        brand_id: selectedLifeBrands[0].id,
      });
    }
  };

  // 카테고리 변경 핸들러
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category as BrandCategory);
  };

  const canGoNext = useMemo(() => {
    switch (currentStep) {
      case 'main':
        return selectedMainItems.length > 0;
      case 'life':
        return selectedLifeBrands.length > 0;
      case 'payment':
        return true;
      default:
        return false;
    }
  }, [currentStep, selectedMainItems, selectedLifeBrands]);
  return (
    <div className={cn('w-full', className)}>
      <SubscriptionHeader
        currentStep={currentStep}
        onPrev={handlePrev}
        onNext={handleNext}
        canGoNext={canGoNext}
        isProcessing={subscribeMutation.isPending}
      />

      <div className="space-y-4 py-4">
        {currentStep === 'main' && (
          <MainSubscriptionStep
            mainSubscriptions={mainSubscriptions}
            selectedMainItems={selectedMainItems}
            onToggleSubscription={toggleMainSubscription}
            loading={loading}
          />
        )}

        {currentStep === 'life' && (
          <LifeBenefitsStep
            lifeBrands={lifeBrands}
            selectedLifeBrands={selectedLifeBrands}
            onToggleBrand={toggleLifeBrand}
            onCategoryChange={handleCategoryChange}
            selectedCategory={selectedCategory}
            loading={loading}
          />
        )}

        {currentStep === 'payment' && (
          <PaymentStep
            selectedMainItems={selectedMainItems}
            selectedLifeBrands={selectedLifeBrands}
            isLoggedIn={isLoggedIn}
            isProcessing={subscribeMutation.isPending}
            onSubscribe={handleSubscribe}
          />
        )}
      </div>
    </div>
  );
};
