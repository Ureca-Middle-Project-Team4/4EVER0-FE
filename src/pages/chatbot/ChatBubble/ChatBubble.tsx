import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import type { Components } from 'react-markdown';
import { Message } from '@/types/chat';
import { ICONS } from '@/constant/iconPath';
import { AvatarComponent } from '@/components/Avatar';
import { cn } from '@/lib/utils';

interface ChatBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isStreaming = false }) => {
  const isBot = message.type === 'bot';

  // 더 강력한 스트림 데이터 파싱
  const processedContent = React.useMemo(() => {
    let content = message.content;

    // 1. data: 접두사 제거 (여러 줄에 걸쳐 있을 수 있음)
    content = content.replace(/^data:\s*/gm, '');

    // 2. SSE 종료 신호 제거
    content = content.replace(/\[DONE\]/g, '');

    // 3. 체크마크(✅) 앞에 줄바꿈 강제 추가
    content = content.replace(/([^\n])(✅)/g, '$1\n\n$2');

    // 4. 체크마크 뒤의 볼드 텍스트 패턴 수정
    content = content.replace(/(✅\s*\*\*[^*]+\*\*)([^*\n])/g, '$1\n\n$2');

    // 5. 가격 정보 뒤에 볼드가 닫히지 않은 경우 처리
    content = content.replace(/(\/\s*[가-힣]+)(\*\*\s*)(\*\*)/g, '$1**$3\n\n');

    // 6. 볼드 텍스트가 완성된 후 바로 다른 텍스트가 오는 경우
    content = content.replace(/(\*\*[^*]+\*\*)([가-힣A-Za-z])/g, '$1\n\n$2');

    // 7. 이모지 뒤에 바로 텍스트가 오는 경우 줄바꿈 추가
    content = content.replace(/([\u{1F300}-\u{1F9FF}])([가-힣A-Za-z])/gu, '$1\n\n$2');

    // 8. 문장 끝(. ! ?) 뒤에 체크마크나 볼드가 바로 오는 경우
    content = content.replace(/([.!?])(\*\*|✅)/g, '$1\n\n$2');

    // 9. 특별한 경우: "구독**" 같은 패턴에서 강제 줄바꿈
    content = content.replace(/([가-힣]+)(\*\*\s*$)/gm, '$1**\n\n');

    // 10. "브랜드**" 뒤에 바로 다른 내용이 오는 경우
    content = content.replace(/([가-힣]+\*\*)([가-힣A-Za-z])/g, '$1\n\n$2');

    // 11. 빈 줄들을 실제 줄바꿈으로 변환
    content = content.replace(/\n\s*\n/g, '\n\n');

    // 12. 연속된 줄바꿈 정리 (3개 이상을 2개로)
    content = content.replace(/\n{3,}/g, '\n\n');

    // 13. 불완전한 마크다운 태그 정리
    content = content.replace(/\*{3,}/g, '**');
    content = content.replace(/#{3,}/g, '##');

    // 14. 앞뒤 공백 제거
    content = content.trim();

    return content;
  }, [message.content]);

  // 스트리밍 중일 때는 더 안전한 렌더링
  const shouldUseMarkdown = React.useMemo(() => {
    if (!isBot) return false;
    if (isStreaming) {
      // 스트리밍 중에는 마크다운 요소가 어느 정도 완성된 경우에만 사용
      const hasCompleteMarkdown = /(\*\*.*?\*\*|\s.*?\n|^\s*[-*✅]\s|[\u{1F300}-\u{1F9FF}])/mu.test(
        processedContent,
      );
      // 최소 길이 체크를 줄여서 더 빨리 마크다운 적용
      return hasCompleteMarkdown && processedContent.length > 5;
    }
    return true;
  }, [isBot, isStreaming, processedContent]);

  // react-markdown 설정
  const markdownComponents: Components = {
    h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-foreground">{children}</h1>,
    h2: ({ children }) => <h2 className="text-base font-bold mb-2 text-foreground">{children}</h2>,
    h3: ({ children }) => <h3 className="text-sm font-bold mb-1 text-foreground">{children}</h3>,
    ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
    li: ({ children }) => <li className="text-sm">{children}</li>,
    strong: ({ children }) => <strong className="font-bold text-primary">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    p: ({ children }) => (
      <p className="mb-2 last:mb-0 whitespace-pre-wrap leading-relaxed">{children}</p>
    ),
    br: () => <br />,
    code: ({ children }) => (
      <code className="bg-secondary px-1 py-0.5 rounded text-xs font-mono text-secondary-foreground">
        {children}
      </code>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        className="text-primary underline hover:text-primary/80"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
  };

  return (
    <div className={cn('flex w-full mb-4', isBot ? 'justify-start' : 'justify-end')}>
      {isBot && (
        <div className="w-8 h-8 mr-2 mt-1 flex-shrink-0">
          <AvatarComponent src={ICONS.PROFILE_ICON} />
        </div>
      )}
      <div
        className={cn(
          'max-w-[80%] px-4 py-2 rounded-lg',
          isBot
            ? 'bg-brand-red-light text-secondary-foreground rounded-tl-none shadow-sm'
            : 'bg-brand-darkblue-light text-brand-darkblue rounded-tr-none',
        )}
      >
        <div className="text-sm">
          {isBot && shouldUseMarkdown ? (
            <ReactMarkdown
              components={markdownComponents}
              remarkPlugins={[remarkBreaks]}
              skipHtml={true} // HTML 태그 스킵으로 안전성 확보
            >
              {processedContent}
            </ReactMarkdown>
          ) : (
            <div className="whitespace-pre-wrap leading-relaxed">{processedContent}</div>
          )}

          {isStreaming && isBot && (
            <span className="inline-block w-2 h-4 bg-current opacity-50 animate-pulse ml-1">|</span>
          )}
        </div>
        <p className="text-xs opacity-50 text-right mt-1">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
};
