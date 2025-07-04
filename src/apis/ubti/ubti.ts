import { apiWithToken } from '@/lib/api/apiconfig';
import type { UBTIResultResponse } from '@/types/ubti';
import { API_BASE_URL } from '@/lib/api/apiconfig';
import { StreamingThrottle } from '@/lib/streaming/StreamingThrottle';
import {
  processStreamWithThrottle,
  processUBTIStreamWithThrottle,
} from '@/lib/streaming/streamProcessor';
import { createStreamingHeaders, STREAMING_PRESETS } from '@/lib/streaming/utils';
import type { SendUBTIRequest, UBTIChunk } from '@/lib/streaming/types';

/**
 * UBTI 질문하기
 * @param req UBTI 요청 데이터
 * @param onChunk 청크 처리 콜백
 * @param onQuestionExtracted 질문 추출 콜백
 */
export async function sendUBTIAnswerStreamingWithQuestion(
  req: SendUBTIRequest,
  onChunk: (chunk: UBTIChunk) => void,
  onQuestionExtracted?: (question: string) => void,
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/ubti/question`, {
      method: 'POST',
      headers: createStreamingHeaders(),
      body: JSON.stringify(req),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('UBTI fetch failed:', response.status, errorText);
      throw new Error(`HTTP error ${response.status}: ${errorText}`);
    }

    const throttle = new StreamingThrottle(STREAMING_PRESETS.UBTI);

    // 질문 추출 콜백이 있으면 전용 프로세서 사용
    if (onQuestionExtracted) {
      await processUBTIStreamWithThrottle(response, onChunk, onQuestionExtracted, throttle);
    } else {
      await processStreamWithThrottle(response, onChunk, throttle);
    }
  } catch (error) {
    console.error('[DEBUG] UBTI 질문 실패:', error);
  }
}

/**
 * UBTI 질문하기
 * @param req UBTI 요청 데이터
 * @param onChunk 청크 처리 콜백
 */
export async function sendUBTIAnswerStreaming(
  req: SendUBTIRequest,
  onChunk: (chunk: UBTIChunk) => void,
): Promise<void> {
  return sendUBTIAnswerStreamingWithQuestion(req, onChunk);
}

/**
 * UBTI 결과 조회
 * POST /ubti/result
 */
export const fetchUBTIResult = async (
  sessionId: string,
  tone: 'general' | 'muneoz' = 'general',
): Promise<UBTIResultResponse> => {
  try {
    const response = await apiWithToken.post('/ubti/result', {
      session_id: sessionId,
      tone,
      message: '',
    });
    return response.data;
  } catch (error) {
    console.error('[DEBUG] UBTI 결과 조회 실패:', error);
    throw error;
  }
};
