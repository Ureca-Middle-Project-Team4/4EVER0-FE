import React, { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatBubble } from '../ChatBubble/ChatBubble';
import { ChatInput } from '../ChatInput/ChatInput';
import { Button } from '@/components/Button';
import { useChatStore } from '@/stores/useChatStore';
import {
  useChatMutation,
  useUBTIMutation,
  useLikesRecommendationMutation,
} from '@/hooks/useChatMutation';
import { Message } from '@/types/chat';
import { UBTIQuestion } from '@/types/chat';
import { ToneSwitch } from '../ToneSwitch/ToneSwitch';
import { useModalStore } from '@/stores/useModalStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { PremiumFeatureButton } from './PremiumFeatureButton';

export const ChatContainer: React.FC = () => {
  const { isLoggedIn } = useAuthStore();
  const [currentUBTIStep, setCurrentUBTIStep] = useState<number>(-1);
  const [ubtiInProgress, setUbtiInProgress] = useState(false);
  const [isMunerTone, setIsMunerTone] = useState(true);
  const { openModal } = useModalStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fullResponseRef = useRef('');
  const isInitializedRef = useRef(false);
  const navigate = useNavigate();

  // Zustand store에서 상태와 액션 분리
  const sessions = useChatStore((state) => state.sessions);
  const currentSessionId = useChatStore((state) => state.currentSessionId);

  // 액션들 개별적으로 가져오기
  const createSession = useChatStore.getState().createSession;
  const addMessage = useChatStore.getState().addMessage;
  const updateLastBotMessage = useChatStore.getState().updateLastBotMessage;
  const incrementUsage = useChatStore.getState().incrementUsage;
  const endSession = useChatStore.getState().endSession;

  const chatMutation = useChatMutation();
  const ubtiMutation = useUBTIMutation();
  const likesRecommendationMutation = useLikesRecommendationMutation();

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
  }, []);

  // 컴포넌트 마운트 시 한 번만 실행
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

  // JSON 파싱 및 UBTI 질문 표시 함수
  const parseAndDisplayUBTIResponse = useCallback(
    (response: string) => {
      try {
        const ubtiData: UBTIQuestion = JSON.parse(response);

        if (ubtiData.question && typeof ubtiData.step === 'number') {
          setCurrentUBTIStep(ubtiData.step);

          // 질문을 마크다운 형식으로 포맷
          const formattedQuestion = `### UBTI 질문 ${ubtiData.step + 1}/4\n\n**${ubtiData.question}**\n\n답변을 입력해주세요.`;

          if (currentSessionId) {
            updateLastBotMessage(currentSessionId, formattedQuestion);
          }

          // 4단계 완료 확인 여부
          if (ubtiData.step >= 3) {
            console.log('UBTI 4단계 완료');
            setTimeout(() => {
              setUbtiInProgress(false);
              setCurrentUBTIStep(-1);
              navigate('/ubti'); // 결과 페이지로 이동
            }, 2000);
          }

          return true;
        }
      } catch (error) {
        console.log('JSON 파싱 실패, 일반 텍스트로 처리:', error);
      }
      return false;
    },
    [currentSessionId, updateLastBotMessage, navigate],
  );

  // 공통 스트리밍 로직
  const processStreamingMessage = useCallback(
    (_message: string, userMessage: string, isUBTI: boolean = false) => {
      if (!currentSessionId || isSessionEnded) return;

      // 로그인 사용자는 사용량 제한 없음
      if (!isLoggedIn) {
        const canContinue = incrementUsage(currentSessionId);
        if (!canContinue) {
          openModal({
            id: 'chat-limit-modal',
            title: '채팅 횟수가 제한되었습니다!',
            description:
              '비회원은 5회까지 채팅을 이용할 수 있습니다.\n로그인하고 더 많은 기능을 이용하세요.',
            variant: 'default',
            size: 'sm',
            showClose: false,
            showCancel: false,
            showConfirm: true,
            confirmText: '로그인하기',
            confirmVariant: 'default',
            closeOnOverlayClick: false,
            closeOnEscape: false,
            onConfirm: () => {
              navigate('/login');
            },
          });
          return;
        }
      }

      // 사용자 메시지 추가
      addMessage(currentSessionId, userMessage, 'user');
      addMessage(currentSessionId, '', 'bot');
      fullResponseRef.current = '';

      return {
        onChunk: (chunk: string) => {
          // data: 접두사 제거 및 빈 라인 필터링
          const processedChunk = chunk
            .split('\n')
            .map((line) => {
              // data: 접두사 제거
              if (line.startsWith('data:')) {
                return line.substring(5); // 'data:' 제거
              }
              return line;
            })
            .filter((line) => line.trim() !== '') // 빈 라인 제거
            .join('\n');

          if (processedChunk.trim()) {
            fullResponseRef.current += processedChunk;

            if (isUBTI) {
              // UBTI인 경우 JSON 파싱 시도
              const isParsed = parseAndDisplayUBTIResponse(fullResponseRef.current);
              if (!isParsed) {
                // JSON 파싱 실패시 일반 텍스트로 표시
                updateLastBotMessage(currentSessionId, fullResponseRef.current);
              }
            } else {
              // 일반 메시지는 그대로 표시
              updateLastBotMessage(currentSessionId, fullResponseRef.current);
            }
          }
        },
        onError: () => {
          updateLastBotMessage(currentSessionId, '요청 처리 중 오류가 발생했습니다.');
          if (isUBTI) {
            setUbtiInProgress(false);
            setCurrentUBTIStep(-1);
          }
        },
      };
    },
    [currentSessionId, isSessionEnded, isLoggedIn, openModal, navigate],
  );

  // 일반 채팅 메시지 전송
  const handleSendMessage = useCallback(
    async (message: string) => {
      // UBTI 진행 중이면 UBTI 답변으로 처리
      if (ubtiInProgress && currentUBTIStep >= 0) {
        const handlers = processStreamingMessage(message, message, true);
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
          handlers.onError();
        }
        return;
      }

      // 일반 채팅
      const handlers = processStreamingMessage(message, message, false);
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
        handlers.onError();
      }
    },
    [
      processStreamingMessage,
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
    setUbtiInProgress(true);
    setCurrentUBTIStep(0);

    const message = 'UBTI 분석을 시작해주세요';
    const handlers = processStreamingMessage(message, message, true);
    if (!handlers) return;

    try {
      await ubtiMutation.mutateAsync({
        sessionId: currentSessionId!,
        message,
        onChunk: handlers.onChunk,
        tone: isMunerTone ? 'muneoz' : 'general',
      });
    } catch (error) {
      console.error('UBTI 시작 에러:', error);
      handlers.onError();
    }
  }, [processStreamingMessage, ubtiMutation, currentSessionId]);

  // 좋아요 추천 시작
  const handleLikesRecommendation = useCallback(async () => {
    const message = '좋아요한 서비스 기반으로 추천해 주세요';
    const handlers = processStreamingMessage(message, message, false);
    if (!handlers) return;

    try {
      await likesRecommendationMutation.mutateAsync({
        sessionId: currentSessionId!,
        onChunk: handlers.onChunk,
        tone: isMunerTone ? 'muneoz' : 'general',
      });
    } catch (error) {
      console.error('추천 에러:', error);
      handlers.onError();
    }
  }, [processStreamingMessage, likesRecommendationMutation, currentSessionId]);

  const resetChat = useCallback(() => {
    if (currentSessionId) {
      endSession(currentSessionId);
    }
    setUbtiInProgress(false);
    setCurrentUBTIStep(-1);
    const newSessionId = createSession();
    addMessage(newSessionId, '새로운 대화를 시작합니다! 😊 무엇을 도와드릴까요?', 'bot');
  }, [currentSessionId]);

  const handleToneToggle = useCallback(
    (isMuner: boolean) => {
      setIsMunerTone(isMuner);
    },
    [isMunerTone],
  );

  // 버튼 상태
  const buttonDisabled = useMemo(
    () =>
      isSessionEnded ||
      chatMutation.isPending ||
      ubtiMutation.isPending ||
      likesRecommendationMutation.isPending,
    [
      isSessionEnded,
      chatMutation.isPending,
      ubtiMutation.isPending,
      likesRecommendationMutation.isPending,
    ],
  );

  // 사용량 표시
  const usageDisplay = useMemo(
    () => (currentSession ? `${currentSession.usageCount}/5` : '0/5'),
    [currentSession?.usageCount],
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
      {/* 헤더 영역 */}
      <div className="flex justify-between items-center py-4 bg-white shrink-0">
        <h1 className="text-lg font-semibold">무너와 대화하기</h1>
        <div className="flex items-center space-x-3">
          <ToneSwitch
            isMunerTone={isMunerTone}
            onToggle={handleToneToggle}
            disabled={buttonDisabled}
          />
          {ubtiInProgress && (
            <span className="text-xs bg-blue-100 text-brand-darkblue px-2 py-1 rounded">
              UBTI 진행중
            </span>
          )}
          {/* 사용량 표시 - 로그인 사용자는 무제한 */}
          <div className="flex items-center space-x-1">
            <span className="text-xs font-medium text-gray-400">채팅</span>
            {!isLoggedIn && (
              <span
                className={`text-xs font-medium ${
                  (currentSession?.usageCount || 0) >= 4 ? 'text-brand-red' : 'text-gray-600'
                }`}
              >
                {usageDisplay}회
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 메시지 영역 - 하단에 입력창 공간 확보 */}
      <div className="flex-1 overflow-y-auto pb-4">
        <div className="flex flex-col space-y-2">
          {messages.map((message: Message, index: number) => (
            <ChatBubble
              key={message.id}
              message={message}
              isStreaming={
                (chatMutation.isPending ||
                  ubtiMutation.isPending ||
                  likesRecommendationMutation.isPending) &&
                index === messages.length - 1 &&
                message.type === 'bot'
              }
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 입력 영역 - 푸터 위에 고정 */}
      <div className="bottom-0 left-0 right-0 flex flex-col space-y-3 bg-white py-3 border-t border-gray-300">
        {!ubtiInProgress && (
          <div className="flex justify-between w-full space-x-2">
            <PremiumFeatureButton
              className="flex-1"
              onClick={handleUBTIStart}
              disabled={buttonDisabled}
              featureName="UBTI 분석"
            >
              UBTI 분석하기
            </PremiumFeatureButton>
            <PremiumFeatureButton
              className="flex-1"
              onClick={handleLikesRecommendation}
              disabled={buttonDisabled}
              featureName="서비스 추천"
            >
              서비스 추천받기
            </PremiumFeatureButton>
          </div>
        )}

        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={buttonDisabled}
          placeholder={inputPlaceholder}
        />

        {isSessionEnded && (
          <Button onClick={resetChat} className="w-full">
            새 대화 시작하기
          </Button>
        )}
      </div>
    </div>
  );
};
