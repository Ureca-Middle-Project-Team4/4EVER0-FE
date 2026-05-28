import { StreamingThrottle } from './StreamingThrottle';

/**
 * UBTI 질문 텍스트 추출 함수
 */
function extractUBTIQuestionText(data: string): string | null {
  try {
    const parsed = JSON.parse(data);

    // UBTI 스트리밍 메시지 타입 확인
    if (parsed.type === 'question_content' && parsed.question) {
      console.log('[DEBUG] UBTI 질문 추출:', parsed.question);
      return parsed.question;
    }

    // 일반 텍스트에서 질문 패턴 찾기
    if (typeof parsed === 'string' || (parsed.type === 'message_chunk' && parsed.content)) {
      const text = parsed.content || parsed;

      // 질문 패턴 매칭
      const questionPatterns = [
        /질문\s*\d*\s*[:.]\s*(.+?)(?=\n|$)/i,
        /Q\d*[:.]\s*(.+?)(?=\n|$)/i,
        /\d+\.\s*(.+\?)/i,
        /(.+\?)/i,
      ];

      for (const pattern of questionPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          const question = match[1].trim();
          return question;
        }
      }
    }
  } catch (error) {
    // JSON 파싱 실패 시 일반 텍스트로 처리
    if (typeof data === 'string') {
      const questionPatterns = [
        /질문\s*\d*\s*[:.]\s*(.+?)(?=\n|$)/i,
        /Q\d*[:.]\s*(.+?)(?=\n|$)/i,
        /\d+\.\s*(.+\?)/i,
        /(.+\?)/i,
      ];

      for (const pattern of questionPatterns) {
        const match = data.match(pattern);
        if (match && match[1]) {
          const question = match[1].trim();
          console.log('[DEBUG] 일반 텍스트에서 질문 추출:', question);
          return question;
        }
      }
    }
  }

  return null;
}

/**
 * JSON 구조인지 확인하는 함수
 */
function isJSONStructure(data: string): boolean {
  try {
    const parsed = JSON.parse(data);
    return (
      typeof parsed === 'object' &&
      parsed !== null &&
      'type' in parsed &&
      (parsed.type === 'plan_recommendations' ||
        parsed.type === 'subscription_recommendations' ||
        parsed.type === 'message_start' ||
        parsed.type === 'message_chunk' ||
        parsed.type === 'message_end' ||
        parsed.type === 'question_content' ||
        parsed.type === 'question_start' ||
        parsed.type === 'question_end' ||
        parsed.type === 'ubti_complete' ||
        parsed.type === 'questions_complete')
    );
  } catch {
    return false;
  }
}

/**
 * UBTI 전용 스트리밍 처리 함수
 */
export async function processUBTIStreamWithThrottle(
  response: Response,
  onChunk: (chunk: { data: string }) => void,
  onQuestionExtracted: (question: string) => void,
  throttle: StreamingThrottle,
): Promise<void> {
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error('Stream not supported');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  throttle.reset();

  try {
    let done = false;
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;

      if (value) {
        buffer += decoder.decode(value, { stream: true });
      }

      // SSE 형식 파싱
      const parts = buffer.split('\n\n');
      buffer = parts.pop() ?? '';

      for (const part of parts) {
        const lines = part.split('\n').filter(Boolean);

        for (const line of lines) {
          if (line.startsWith('data:')) {
            const data = line.replace(/^data:\s?/, '').trim();

            if (data === '[DONE]') {
              continue;
            }

            if (data) {
              // UBTI 질문 텍스트 추출 시도
              const questionText = extractUBTIQuestionText(data);
              if (questionText) {
                onQuestionExtracted(questionText);
              }

              // JSON 구조인지 확인
              if (isJSONStructure(data)) {
                // JSON인 경우 즉시 전송
                onChunk({ data });
              } else {
                // 일반 텍스트만 throttle 적용
                await throttle.processChunk(data, onChunk);
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('UBTI Stream processing error:', error);
    throw error;
  } finally {
    reader.releaseLock();
  }
}

/**
 * JSON 구조를 지원하는 스트리밍 처리 함수
 */
export async function processStreamWithThrottle(
  response: Response,
  onChunk: (chunk: { data: string }) => void,
  throttle: StreamingThrottle,
): Promise<void> {
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error('Stream not supported');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  throttle.reset();

  try {
    let done = false;
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;

      if (value) {
        buffer += decoder.decode(value, { stream: true });
      }

      // SSE 형식 파싱
      const parts = buffer.split('\n\n');
      buffer = parts.pop() ?? '';

      for (const part of parts) {
        const lines = part.split('\n').filter(Boolean);

        for (const line of lines) {
          if (line.startsWith('data:')) {
            const data = line.replace(/^data:\s?/, '').trim();

            if (data === '[DONE]') {
              continue;
            }

            if (data) {
              // JSON 구조인지 확인
              if (isJSONStructure(data)) {
                // JSON인 경우 즉시 전송 (카드 정보)
                onChunk({ data });
              } else {
                // 일반 텍스트는 그대로 전송 (띄어쓰기 보존)
                onChunk({ data });
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Stream processing error:', error);
    throw error;
  } finally {
    reader.releaseLock();
  }
}

/**
 * 디버깅용 빠른 스트림 처리
 */
export async function processStreamFast(
  response: Response,
  onChunk: (chunk: { data: string }) => void,
): Promise<void> {
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error('Stream not supported');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    let done = false;
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;

      if (value) {
        buffer += decoder.decode(value, { stream: true });
      }

      const parts = buffer.split('\n\n');
      buffer = parts.pop() ?? '';

      for (const part of parts) {
        const lines = part.split('\n').filter((line) => line.startsWith('data:'));
        for (const line of lines) {
          const data = line.replace(/^data:\s?/, '').trim();
          if (data && data !== '[DONE]') {
            onChunk({ data });
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
