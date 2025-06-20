import { useState, useEffect } from 'react';

declare global {
  interface Window {
    Kakao: {
      isInitialized: () => boolean;
      init: (key: string) => void;
      Link: {
        sendDefault: (params: unknown) => void;
      };
    };
  }
}

export interface KakaoShareParams {
  title: string;
  description: string;
  imageUrl: string;
  mobileWebUrl: string;
  webUrl: string;
}

export const loadKakaoSDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.Kakao) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://developers.kakao.com/sdk/js/kakao.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('카카오 SDK 로드 실패'));
    document.head.appendChild(script);
  });
};

export const useKakaoInit = (jsKey: string) => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!jsKey || jsKey === 'undefined' || jsKey.trim() === '') {
      return;
    }

    loadKakaoSDK()
      .then(() => {
        if (!window.Kakao.isInitialized()) {
          try {
            window.Kakao.init(jsKey);
          } catch (initError) {
            console.error('카카오 SDK 초기화 실패:', initError);
            return;
          }
        }
        setInitialized(true);
      })
      .catch((loadError) => {
        console.error('카카오 SDK 로딩 실패:', loadError);
      });
  }, [jsKey]);

  return initialized;
};

// 공유 함수
export const kakaoShare = (params: KakaoShareParams): void => {
  if (!window.Kakao || !window.Kakao.isInitialized()) {
    console.error('Kakao SDK가 초기화되지 않았습니다.');
    return;
  }

  try {
    window.Kakao.Link.sendDefault({
      objectType: 'feed',
      content: {
        title: params.title,
        description: params.description,
        imageUrl: params.imageUrl,
        link: {
          mobileWebUrl: params.mobileWebUrl,
          webUrl: params.webUrl,
        },
      },
      buttons: [
        {
          title: '웹으로 보기',
          link: {
            mobileWebUrl: params.mobileWebUrl,
            webUrl: params.webUrl,
          },
        },
      ],
      installTalk: true,
    });
  } catch (error) {
    console.error('카카오 공유 실패:', error);
    alert('카카오 공유에 실패했습니다.');
  }
};
