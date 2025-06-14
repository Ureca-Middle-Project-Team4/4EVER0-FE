import { API_BASE_URL } from '@/lib/api/apiconfig';

/**
 * 스트리밍 지원 여부 확인
 * @returns 브라우저가 스트리밍을 지원하는지 여부
 */
export function isStreamingSupported(): boolean {
  return typeof ReadableStream !== 'undefined' && typeof TextDecoder !== 'undefined';
}

/**
 * 스트리밍 연결 상태 테스트
 * @returns API 서버와의 연결 상태
 */
export async function testStreamingConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      credentials: 'omit',
    });
    return response.ok;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
}

/**
 * 공통 HTTP 헤더 생성
 * @param includeCredentials 인증 정보 포함 여부
 * @returns 스트리밍용 HTTP 헤더
 */
export function createStreamingHeaders(
  includeCredentials: boolean = false,
): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
    'Cache-Control': 'no-cache',
  };

  if (includeCredentials) {
    // 필요시 인증 헤더 추가
    headers['Authorization'] = 'Bearer token'; // 예시
  }

  return headers;
}

/**
 * 개선된 스트리밍 설정 프리셋
 * 파싱 안정성을 위해 지연 시간을 늘림
 */
export const STREAMING_PRESETS = {
  // 일반 채팅 - 자연스러운 속도
  CHAT: { minDelay: 80, maxDelay: 200 },

  // 추천 결과 - 조금 더 천천히 (복잡한 데이터)
  RECOMMENDATION: { minDelay: 120, maxDelay: 280 },

  // UBTI 테스트 - 긴 텍스트라 여유있게
  UBTI: { minDelay: 150, maxDelay: 350 },

  // 개발/디버깅용
  FAST: { minDelay: 0, maxDelay: 0 },

  STABLE: { minDelay: 200, maxDelay: 400 },
} as const;

/**
 * 스트림 데이터 검증 함수
 */
export function validateStreamChunk(chunk: string): boolean {
  // 빈 데이터 체크
  if (!chunk || chunk.trim().length === 0) {
    return false;
  }

  // 제어 문자 체크
  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x08\x0E-\x1F\x7F]/.test(chunk)) {
    return false;
  }

  // 너무 긴 단일 청크 체크
  if (chunk.length > 1000) {
    console.warn('매우 긴 청크 감지:', chunk.length, '글자');
    return false;
  }

  return true;
}

/**
 * 스트림 성능 모니터링
 */
export class StreamMonitor {
  private chunkCount: number = 0;
  private totalBytes: number = 0;
  private startTime: number = 0;
  private errors: string[] = [];

  start(): void {
    this.reset();
    this.startTime = Date.now();
  }

  addChunk(chunk: string): void {
    this.chunkCount++;
    this.totalBytes += new Blob([chunk]).size;
  }

  addError(error: string): void {
    this.errors.push(error);
  }

  getStats() {
    const duration = Date.now() - this.startTime;
    return {
      chunkCount: this.chunkCount,
      totalBytes: this.totalBytes,
      duration,
      avgChunkSize: this.chunkCount > 0 ? this.totalBytes / this.chunkCount : 0,
      bytesPerSecond: duration > 0 ? (this.totalBytes / duration) * 1000 : 0,
      errors: [...this.errors],
    };
  }

  reset(): void {
    this.chunkCount = 0;
    this.totalBytes = 0;
    this.startTime = 0;
    this.errors = [];
  }
}
