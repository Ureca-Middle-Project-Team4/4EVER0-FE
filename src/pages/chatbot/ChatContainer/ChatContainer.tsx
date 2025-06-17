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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Brain, Heart, Zap, Star, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ChatContainer: React.FC = () => {
  const { isLoggedIn } = useAuthStore();
  const [currentUBTIStep, setCurrentUBTIStep] = useState<number>(-1);
  const [ubtiInProgress, setUbtiInProgress] = useState(false);
  const [isMunerTone, setIsMunerTone] = useState(false);
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

          // UBTI 진행 중에는 오버레이에서만 정보를 표시하고, 채팅창에는 간단한 메시지만
          const simpleMessage = `💭 질문 ${ubtiData.step + 1}: ${ubtiData.question}`;

          if (currentSessionId) {
            updateLastBotMessage(currentSessionId, simpleMessage);
          }

          // 4단계 완료 확인 여부
          if (ubtiData.step >= 3) {
            console.log('UBTI 4단계 완료');
            setTimeout(() => {
              setUbtiInProgress(false);
              setCurrentUBTIStep(-1);
              // 완료 메시지 추가
              if (currentSessionId) {
                addMessage(
                  currentSessionId,
                  '🎉 UBTI 분석이 완료되었습니다! 결과 페이지로 이동합니다...',
                  'bot',
                );
              }
              navigate('/ubti'); // 이 부분 결과 보기 버튼으로 수정해야함
            }, 5000);
          }

          return true;
        }
      } catch (error) {
        console.log('JSON 파싱 실패, 일반 텍스트로 처리:', error);
      }
      return false;
    },
    [currentSessionId, updateLastBotMessage, navigate, addMessage],
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
          const processedChunk = chunk
            .split('\n')
            .map((line) => {
              if (line.startsWith('data:')) {
                return line.substring(5);
              }
              return line;
            })
            .filter((line) => line.trim() !== '')
            .join('\n');

          if (processedChunk.trim()) {
            fullResponseRef.current += processedChunk;

            if (isUBTI) {
              const isParsed = parseAndDisplayUBTIResponse(fullResponseRef.current);
              if (!isParsed) {
                updateLastBotMessage(currentSessionId, fullResponseRef.current);
              }
            } else {
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
    [
      currentSessionId,
      isSessionEnded,
      isLoggedIn,
      openModal,
      navigate,
      parseAndDisplayUBTIResponse,
      updateLastBotMessage,
      addMessage,
      incrementUsage,
    ],
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
  }, [processStreamingMessage, ubtiMutation, currentSessionId, isMunerTone]);

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
  }, [processStreamingMessage, likesRecommendationMutation, currentSessionId, isMunerTone]);

  const resetChat = useCallback(() => {
    if (currentSessionId) {
      endSession(currentSessionId);
    }
    setUbtiInProgress(false);
    setCurrentUBTIStep(-1);
    const newSessionId = createSession();
    addMessage(newSessionId, '새로운 대화를 시작합니다! 😊 무엇을 도와드릴까요?', 'bot');
  }, [currentSessionId, endSession, createSession, addMessage]);

  const handleToneToggle = useCallback((isMuner: boolean) => {
    setIsMunerTone(isMuner);
  }, []);

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

  // UBTI 오버레이 컴포넌트
  const UBTIOverlay = () => {
    if (!ubtiInProgress) return null;

    const progress = ((currentUBTIStep + 1) / 4) * 100;
    const stepIcons = [Heart, Brain, Zap, Star];

    // 현재 질문 텍스트 (마지막 봇 메시지에서 추출)
    const currentQuestionText = useMemo(() => {
      const lastBotMessage = messages.filter((m) => m.type === 'bot').pop();

      if (lastBotMessage && lastBotMessage.content.includes('질문')) {
        // "💭 질문 1: 질문내용" 형태에서 질문 내용만 추출
        const match = lastBotMessage.content.match(/질문 \d+: (.+)/);
        return match ? match[1] : '질문을 준비하고 있어요...';
      }

      return '질문을 준비하고 있어요...';
    }, [messages]);

    return (
      <div className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="relative w-full max-w-4xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl blur-sm"></div>

          <Card className="relative w-full border-0 bg-gradient-to-r from-blue-100/90 via-indigo-100/90 to-purple-100/90 backdrop-blur-sm shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 p-2">
                  <div>
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-700 to-purple-600 bg-clip-text text-transparent">
                      타코시그널 성향 분석💘
                    </CardTitle>
                    <p className="text-blue-600 text-sm">아래 채팅창에서 질문에 답변해주세요!</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-blue-700">{currentUBTIStep + 1}/4</div>
                  <div className="text-sm text-blue-600">단계</div>
                </div>
              </div>

              <div className="space-y-3">
                <Progress value={progress} className="w-full h-3 bg-blue-200/50" />
                <div className="flex justify-between">
                  {stepIcons.map((Icon, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500',
                          index <= currentUBTIStep
                            ? 'bg-gradient-to-r from-blue-400 to-purple-500 text-white shadow-lg animate-pulse'
                            : 'bg-gray-200 text-gray-400',
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span
                        className={cn(
                          'text-xs mt-1 font-medium',
                          index <= currentUBTIStep ? 'text-blue-600' : 'text-gray-400',
                        )}
                      >
                        {index + 1}단계
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20 mb-4">
                <h3 className="font-lg text-indigo-800 mb-2">현재 질문:</h3>
                <p className="text-indigo-700 text-medium leading-relaxed">{currentQuestionText}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col relative h-full">
      {/* UBTI 진행 상황 오버레이 */}
      <UBTIOverlay />

      {/* 헤더 영역 */}
      <div
        className={cn(
          'flex justify-between items-center py-4 bg-white shrink-0 transition-all duration-300',
          ubtiInProgress && 'mt-40', // UBTI 진행 중에는 오버레이 공간 확보
        )}
      >
        <h1 className="text-lg font-semibold">무너와 대화하기</h1>
        <div className="flex items-center space-x-3">
          <ToneSwitch
            isMunerTone={isMunerTone}
            onToggle={handleToneToggle}
            disabled={buttonDisabled}
          />
          {ubtiInProgress && (
            <div className="flex items-center gap-2 text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
              <Sparkles className="w-3 h-3 animate-pulse" />
              <span className="font-medium">UBTI 진행중</span>
            </div>
          )}
          {/* 사용량 표시 - 로그인 사용자는 무제한 */}
          <div className="flex items-center space-x-1">
            <span className="text-xs font-medium text-gray-400">채팅</span>
            {!isLoggedIn && (
              <span
                className={`text-xs font-medium ${
                  (currentSession?.usageCount || 0) >= 4 ? 'text-red-500' : 'text-gray-600'
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
