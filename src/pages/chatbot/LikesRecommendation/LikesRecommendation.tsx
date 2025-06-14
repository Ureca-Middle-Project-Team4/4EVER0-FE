import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/Button';
import { useLikesRecommendationMutation } from '@/hooks/useChatMutation';
import { useChatStore } from '@/stores/useChatStore';

interface LikesRecommendationProps {
  onComplete: () => void;
  isMunerTone?: boolean;
}

export const LikesRecommendation: React.FC<LikesRecommendationProps> = ({
  onComplete,
  isMunerTone = true,
}) => {
  const [recommendationComplete, setRecommendationComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { currentSessionId, addMessage, updateLastBotMessage } = useChatStore();
  const fullResponseRef = useRef('');
  const likesRecommendationMutation = useLikesRecommendationMutation();

  // 디버깅용 로그
  useEffect(() => {
    console.log('LikesRecommendation 컴포넌트 마운트됨');
    console.log('currentSessionId:', currentSessionId);
    console.log('isMunerTone:', isMunerTone);
    return () => {
      console.log('LikesRecommendation 컴포넌트 언마운트됨');
    };
  }, [currentSessionId, isMunerTone]);

  const handleGetRecommendation = useCallback(async () => {
    console.log('추천 요청 시작');

    if (!currentSessionId) {
      console.error('currentSessionId가 없습니다');
      return;
    }

    setIsLoading(true);

    // 사용자 메시지 추가
    const userMessageId = addMessage(
      currentSessionId,
      '좋아요한 서비스 기반으로 추천해 주세요',
      'user',
    );
    console.log('사용자 메시지 추가됨:', userMessageId);

    // 빈 봇 메시지 미리 추가
    const botMessageId = addMessage(currentSessionId, '', 'bot');
    console.log('봇 메시지 추가됨:', botMessageId);

    fullResponseRef.current = '';

    try {
      console.log('스트리밍 요청 시작...');

      await likesRecommendationMutation.mutateAsync({
        sessionId: currentSessionId,
        tone: isMunerTone ? 'muneoz' : 'general',
        onChunk: (chunk: string) => {
          console.log('청크 받음:', chunk.substring(0, 50) + '...');
          fullResponseRef.current += chunk;
          // 실시간으로 메시지 업데이트
          updateLastBotMessage(currentSessionId, fullResponseRef.current);
        },
      });

      console.log('스트리밍 완료. 전체 응답:', fullResponseRef.current);
      setRecommendationComplete(true);
    } catch (error) {
      console.error('추천 요청 에러:', error);
      updateLastBotMessage(currentSessionId, '추천을 가져오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [
    currentSessionId,
    addMessage,
    updateLastBotMessage,
    likesRecommendationMutation,
    isMunerTone,
  ]);

  const handleComplete = useCallback(() => {
    console.log('추천 완료 처리');
    setRecommendationComplete(false);
    fullResponseRef.current = '';
    onComplete();
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      <div className="p-4 bg-blue-50 rounded-lg w-full">
        <h3 className="font-bold text-lg mb-2">서비스 추천</h3>
        <p className="text-sm text-gray-600">
          좋아요하신 브랜드를 바탕으로 맞춤 구독을 추천해드릴게요!
        </p>
        <p className="text-xs text-gray-500 mt-1">톤: {isMunerTone ? '무너' : '일반'}</p>
      </div>

      {/* 디버깅 정보 */}
      <div className="p-2 bg-gray-100 rounded text-xs w-full">
        <p>세션 ID: {currentSessionId || '없음'}</p>
        <p>로딩 상태: {isLoading ? '로딩 중' : '대기'}</p>
        <p>추천 완료: {recommendationComplete ? '완료' : '미완료'}</p>
        <p>응답 길이: {fullResponseRef.current.length}</p>
        <p>톤 설정: {isMunerTone ? '무너' : '일반'}</p>
      </div>

      {!recommendationComplete ? (
        <Button
          onClick={handleGetRecommendation}
          disabled={isLoading || likesRecommendationMutation.isPending}
          className="w-full"
        >
          {isLoading || likesRecommendationMutation.isPending
            ? '추천 받는 중...'
            : '좋아요한 서비스 기반 추천 받기'}
        </Button>
      ) : (
        <Button onClick={handleComplete} className="w-full">
          처음으로 돌아가기
        </Button>
      )}

      {/* 실시간 응답 미리보기 */}
      {fullResponseRef.current && (
        <div className="w-full p-3 bg-green-50 rounded-lg">
          <h4 className="font-semibold mb-2">실시간 응답:</h4>
          <div className="text-sm whitespace-pre-wrap max-h-40 overflow-y-auto">
            {fullResponseRef.current}
          </div>
        </div>
      )}
    </div>
  );
};
