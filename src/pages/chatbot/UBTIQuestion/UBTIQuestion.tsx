import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUBTIMutation } from '@/hooks/useChatMutation';
import { useChatStore } from '@/stores/useChatStore';

interface UBTIQuestionProps {
  onComplete: (result: string) => void;
  isMunerTone?: boolean;
}

export const UBTIQuestionComponent: React.FC<UBTIQuestionProps> = ({
  onComplete,
  isMunerTone = true,
}) => {
  const [step, setStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const { currentSessionId, addMessage, updateLastBotMessage } = useChatStore();
  const fullResponseRef = useRef('');
  const ubtiMutation = useUBTIMutation();

  const handleSendAnswer = useCallback(
    async (answer: string) => {
      if (!currentSessionId) return;

      // '시작'이 아닌 경우에만 사용자 메시지 추가
      if (answer !== '시작') {
        addMessage(currentSessionId, answer, 'user');
      }

      // 빈 봇 메시지 추가
      addMessage(currentSessionId, '', 'bot');
      fullResponseRef.current = '';

      try {
        await ubtiMutation.mutateAsync({
          sessionId: currentSessionId,
          message: answer,
          tone: isMunerTone ? 'muneoz' : 'general',
          onChunk: (chunk: string) => {
            fullResponseRef.current += chunk;
            updateLastBotMessage(currentSessionId, fullResponseRef.current);
          },
        });

        // 3단계(step 2) 완료 후 결과 전달
        if (step >= 2) {
          setIsCompleted(true);
          // 지연 1초 후 완료 처리
          setTimeout(() => {
            onComplete(fullResponseRef.current);
          }, 1000);
        } else {
          setStep((prev) => prev + 1);
        }
      } catch (error) {
        console.error('UBTI error:', error);
        updateLastBotMessage(currentSessionId, 'UBTI 질문 처리 중 오류가 발생했습니다.');
      }
    },
    [
      currentSessionId,
      addMessage,
      updateLastBotMessage,
      ubtiMutation,
      step,
      onComplete,
      isMunerTone,
    ],
  );

  // 컴포넌트 마운트 시 UBTI 시작
  useEffect(() => {
    if (currentSessionId && step === 0) {
      handleSendAnswer('시작');
    }
  }, [currentSessionId, handleSendAnswer, step]);

  if (isCompleted) {
    return (
      <div className="flex flex-col items-center space-y-4 w-full">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>UBTI 분석 완료!</CardTitle>
          </CardHeader>
          <CardContent>
            <p>분석이 완료되었습니다. 잠시 후 결과를 확인하실 수 있습니다.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>UBTI 분석 진행 중...</CardTitle>
        </CardHeader>
        <CardContent>
          <p>단계 {step + 1}/4</p>
          {ubtiMutation.isPending && (
            <div className="mt-2">
              <div className="animate-pulse">분석 중...</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
