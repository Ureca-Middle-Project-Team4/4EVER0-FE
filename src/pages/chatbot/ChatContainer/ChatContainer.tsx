import React, { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '@/stores/useChatStore';
import {
  useChatMutation,
  useUBTIMutation,
  useLikesRecommendationMutation,
  useUsageRecommendationMutation,
} from '@/hooks/useChatMutation';
import { useStreamingChat } from '@/hooks/useStreamingChat';
import { UBTIOverlay } from '../UBTIOverlay';
import { ChatHeader } from '../ChatHeader';
import { ChatMessages } from '../ChatMessages';
import { ChatInputArea } from '../ChatInputArea/ChatInputArea';
import { LoadingOverlay } from '../../ubti/LoadingOverlay';
import { SubscriptionRecommendationsData } from '@/types/streaming';
import { fetchUBTIResult } from '@/apis/ubti/ubti';

export const ChatContainer: React.FC = () => {
  const [isMunerTone, setIsMunerTone] = useState(false);
  const [isLoadingResult, setIsLoadingResult] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);
  const navigate = useNavigate();

  // Zustand store에서 상태와 액션 분리
  const sessions = useChatStore((state) => state.sessions);
  const currentSessionId = useChatStore((state) => state.currentSessionId);
  const createSession = useChatStore.getState().createSession;
  const addMessage = useChatStore.getState().addMessage;
  const endSession = useChatStore.getState().endSession;

  const handleUBTIResultClick = async () => {
    if (!currentSessionId) return;
    setIsLoadingResult(true); // 로딩 시작

    try {
      const result = await fetchUBTIResult(currentSessionId, isMunerTone ? 'muneoz' : 'general');

      // 결과 페이지로 이동
      navigate('/ubti', { state: result });
    } catch (error) {
      console.error('UBTI 결과 불러오기 실패:', error);
      setIsLoadingResult(false); // 에러 시 로딩 해제
      // TODO: 에러 토스트 메시지 표시?
    }
  };

  const {
    currentPlanRecommendations,
    currentSubscriptionRecommendations,
    currentUBTIStep,
    ubtiInProgress,
    streamingState,
    expectingCards,
    currentUBTIQuestionText,
    ubtiReadyToSubmit,
    createStreamingHandlers,
    startUBTI,
    resetUBTI,
    resetCards,
    resetStreamingState,
  } = useStreamingChat();

  // Mutations
  const chatMutation = useChatMutation();
  const ubtiMutation = useUBTIMutation();
  const likesRecommendationMutation = useLikesRecommendationMutation();
  const usageRecommendationMutation = useUsageRecommendationMutation();

  // 현재 세션 계산
  const currentSession = useMemo(() => {
    if (!currentSessionId) return null;
    return sessions[currentSessionId] || null;
  }, [sessions, currentSessionId]);

  const messages = useMemo(() => currentSession?.messages || [], [currentSession?.messages]);
  const isSessionEnded = useMemo(
    () => currentSession?.isCompleted || false,
    [currentSession?.isCompleted],
  );

  // 초기화 로직
  const initializeChat = useCallback(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      const newSessionId = createSession();
      addMessage(
        newSessionId,
        '안녕하세요! 😊 저는 LG유플러스의 AI 어시스턴트예요. 궁금한 점이 있으시면 언제든지 물어보세요!',
        'bot',
      );
    }
  }, [createSession, addMessage]);

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    if (!currentSessionId) {
      initializeChat();
    }
  }, [currentSessionId, initializeChat]);

  // 자동 스크롤
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  // 일반 채팅 메시지 전송
  const handleSendMessage = useCallback(
    async (message: string) => {
      // UBTI 진행 중이면 UBTI 답변으로 처리
      if (ubtiInProgress && currentUBTIStep >= 0) {
        const handlers = createStreamingHandlers(message, true);
        if (!handlers) return;

        try {
          await ubtiMutation.mutateAsync({
            sessionId: currentSessionId!,
            message,
            onChunk: handlers.onChunk,
            tone: isMunerTone ? 'muneoz' : 'general',
          });
        } catch (error) {
          console.error('UBTI 답변 에러:', error);
          handlers.onError(error as Error);
        }
        return;
      }

      // 일반 채팅
      const handlers = createStreamingHandlers(message, false);
      if (!handlers) return;

      try {
        await chatMutation.mutateAsync({
          sessionId: currentSessionId!,
          message,
          onChunk: handlers.onChunk,
          tone: isMunerTone ? 'muneoz' : 'general',
        });
      } catch (error) {
        console.error('채팅 에러:', error);
        handlers.onError(error as Error);
      }
    },
    [
      createStreamingHandlers,
      chatMutation,
      ubtiMutation,
      currentSessionId,
      ubtiInProgress,
      currentUBTIStep,
      isMunerTone,
    ],
  );

  // UBTI 시작
  const handleUBTIStart = useCallback(async () => {
    // sessionId가 없으면 새로 생성
    const sessionId = currentSessionId ?? useChatStore.getState().createSession();

    startUBTI();

    const message = 'UBTI 분석을 시작해주세요';
    const handlers = createStreamingHandlers(message, true);
    if (!handlers) return;

    try {
      await ubtiMutation.mutateAsync({
        sessionId, // ← 여기서 보장된 sessionId 사용
        message,
        onChunk: handlers.onChunk,
        tone: isMunerTone ? 'muneoz' : 'general',
      });
    } catch (error) {
      console.error('UBTI 시작 에러:', error);
      handlers.onError(error as Error);
    }
  }, [createStreamingHandlers, ubtiMutation, currentSessionId, isMunerTone, startUBTI]);

  // 좋아요 추천 시작
  const handleLikesRecommendation = useCallback(async () => {
    const message = '좋아요한 서비스 기반으로 추천해 주세요';
    const handlers = createStreamingHandlers(message, false);
    if (!handlers) return;

    try {
      await likesRecommendationMutation.mutateAsync({
        sessionId: currentSessionId!,
        onChunk: handlers.onChunk,
        tone: isMunerTone ? 'muneoz' : 'general',
      });
    } catch (error) {
      console.error('추천 에러:', error);
      handlers.onError(error as Error);
    }
  }, [createStreamingHandlers, likesRecommendationMutation, currentSessionId, isMunerTone]);

  // 사용량 기반 추천
  const handleUsageRecommendation = useCallback(async () => {
    const message = '내 사용량 기반으로 요금제 추천해 주세요';
    const handlers = createStreamingHandlers(message, false);
    if (!handlers) return;

    try {
      await usageRecommendationMutation.mutateAsync({
        onChunk: handlers.onChunk,
        tone: isMunerTone ? 'muneoz' : 'general',
      });
    } catch (error) {
      console.error('사용량 추천 에러:', error);
      handlers.onError(error as Error);
    }
  }, [createStreamingHandlers, usageRecommendationMutation, isMunerTone]);

  // 채팅 초기화
  const resetChat = useCallback(() => {
    if (currentSessionId) {
      endSession(currentSessionId);
    }
    resetUBTI();
    resetCards();
    resetStreamingState(); // 🆕
    const newSessionId = createSession();
    addMessage(newSessionId, '새로운 대화를 시작합니다! 😊 무엇을 도와드릴까요?', 'bot');
  }, [
    currentSessionId,
    endSession,
    resetUBTI,
    resetCards,
    resetStreamingState,
    createSession,
    addMessage,
  ]);
  // 톤 변경
  const handleToneToggle = useCallback((isMuner: boolean) => {
    setIsMunerTone(isMuner);
  }, []);

  // 버튼 상태
  const buttonDisabled = useMemo(
    () =>
      isSessionEnded ||
      chatMutation.isPending ||
      ubtiMutation.isPending ||
      likesRecommendationMutation.isPending ||
      usageRecommendationMutation.isPending ||
      isLoadingResult,
    [
      isSessionEnded,
      chatMutation.isPending,
      ubtiMutation.isPending,
      likesRecommendationMutation.isPending,
      usageRecommendationMutation.isPending,
      isLoadingResult,
    ],
  );

  // 스트리밍 상태
  const isStreaming = useMemo(
    () =>
      chatMutation.isPending ||
      ubtiMutation.isPending ||
      likesRecommendationMutation.isPending ||
      usageRecommendationMutation.isPending,
    [
      chatMutation.isPending,
      ubtiMutation.isPending,
      likesRecommendationMutation.isPending,
      usageRecommendationMutation.isPending,
    ],
  );

  // 입력 필드 플레이스홀더
  const inputPlaceholder = useMemo(() => {
    if (ubtiInProgress && currentUBTIStep >= 0) {
      return `UBTI 질문 ${currentUBTIStep + 1}/4에 답변해주세요...`;
    }
    return '메시지를 입력하세요...';
  }, [ubtiInProgress, currentUBTIStep]);

  return (
    <div className="flex flex-col relative h-full">
      {/* 결과 로딩 오버레이 */}
      <LoadingOverlay
        isVisible={isLoadingResult}
        message="타코시그널 결과를 불러오고 있어요!"
        submessage="당신만의 특별한 결과를 준비중이에요 ✨"
        type="processing"
      />

      {/* UBTI 진행 상황 오버레이 */}
      <UBTIOverlay
        ubtiInProgress={ubtiInProgress}
        currentUBTIStep={currentUBTIStep}
        currentUBTIQuestionText={currentUBTIQuestionText}
        ubtiReadyToSubmit={ubtiReadyToSubmit}
        onResultClick={handleUBTIResultClick}
        messages={messages}
      />

      {/* 헤더 영역 */}
      <ChatHeader
        ubtiInProgress={ubtiInProgress}
        isMunerTone={isMunerTone}
        onToneToggle={handleToneToggle}
        buttonDisabled={buttonDisabled}
        currentSession={currentSession}
      />

      {/* 메시지 영역 */}
      <ChatMessages
        messages={messages}
        isStreaming={isStreaming}
        streamingState={streamingState}
        expectingCards={expectingCards}
        currentPlanRecommendations={currentPlanRecommendations}
        currentSubscriptionRecommendations={
          currentSubscriptionRecommendations as SubscriptionRecommendationsData
        }
        messagesEndRef={messagesEndRef}
      />

      {/* 입력 영역 */}
      <ChatInputArea
        ubtiInProgress={ubtiInProgress}
        currentUBTIStep={currentUBTIStep}
        buttonDisabled={buttonDisabled}
        isSessionEnded={isSessionEnded}
        inputPlaceholder={inputPlaceholder}
        onSendMessage={handleSendMessage}
        onUBTIStart={handleUBTIStart}
        onLikesRecommendation={handleLikesRecommendation}
        onUsageRecommendation={handleUsageRecommendation}
        onResetChat={resetChat}
      />
    </div>
  );
};
