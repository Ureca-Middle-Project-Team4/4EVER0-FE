import { StreamingThrottle } from './StreamingThrottle';

/**
 * 공통 스트리밍 처리 함수
 * @param response HTTP Response 객체
 * @param onChunk 청크 처리 콜백
 * @param throttle 스트리밍 지연 처리 인스턴스
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
  let messageBuffer = ''; // 완전한 메시지를 위한 버퍼

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
              // 스트림 종료 - 마지막 버퍼 처리
              if (messageBuffer.trim()) {
                await throttle.processChunk(messageBuffer, onChunk);
                messageBuffer = '';
              }
              continue;
            }

            if (data) {
              // 데이터를 버퍼에 누적
              messageBuffer += data;

              // 청크 단위로 전송 (문장 단위 또는 적당한 크기)
              if (shouldSendChunk(messageBuffer)) {
                await throttle.processChunk(messageBuffer, onChunk);
                messageBuffer = '';
              }
            }
          }
        }
      }
    }

    // 마지막 남은 데이터 처리
    if (messageBuffer.trim()) {
      await throttle.processChunk(messageBuffer, onChunk);
    }
  } catch (error) {
    console.error('Stream processing error:', error);
    throw error;
  } finally {
    reader.releaseLock();
  }
}

/**
 * 청크를 전송할지 결정하는 함수
 */
function shouldSendChunk(buffer: string): boolean {
  // 빈 버퍼는 전송하지 않음
  if (!buffer.trim()) {
    return false;
  }

  // 1. 문장이 완성되었는지 확인 (. ! ? 로 끝남)
  if (/[.!?]\s*$/.test(buffer.trim())) {
    return true;
  }

  // 2. 이모지로 끝나는 경우 (완성된 메시지)
  if (/[\u{1F300}-\u{1F9FF}]\s*$/u.test(buffer.trim())) {
    return true;
  }

  // 3. 체크마크가 포함된 경우 (섹션 구분)
  if (/✅/.test(buffer)) {
    return true;
  }

  // 4. 볼드 텍스트가 완성된 경우
  if (/\*\*[^*]+\*\*/.test(buffer)) {
    return true;
  }

  // 5. 가격 정보나 카테고리 정보가 포함된 경우
  if (/\d+원|\/.*\//.test(buffer)) {
    return true;
  }

  // 6. 더 작은 단위로 전송 (15-60자)
  if (buffer.length > 15 && buffer.length < 80) {
    // 쉼표, 마침표, 콜론 등에서 끊기
    if (/[,.!?:;]\s*$/.test(buffer) || /\s+$/.test(buffer)) {
      return true;
    }
  }

  // 7. 짧은 단위에서도 의미있는 구분점이 있으면 전송
  if (buffer.length > 8) {
    // 조사나 어미로 끝나는 경우
    if (/[을를이가에서는]{1,2}\s*$/.test(buffer) || /습니다[.!]?\s*$/.test(buffer)) {
      return true;
    }
  }

  // 8. 너무 길어지면 강제로 전송 (100자 이상)
  if (buffer.length > 100) {
    return true;
  }

  return false;
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

/**
 * 스트림 데이터 정리 유틸리티
 */
export function sanitizeStreamData(data: string): string {
  return data
    .replace(/^data:\s*/gm, '') // data: 접두사 제거
    .replace(/\[DONE\]/g, '') // 종료 신호 제거
    .replace(/\n{3,}/g, '\n\n') // 과도한 줄바꿈 정리
    .trim();
}
