## MZ세대를 위한 스마트한 LG U+ 혜택 큐레이션 서비스, MoonoZ🐙

<div align="center">

<img src="https://avatars.githubusercontent.com/u/212847508?s=200&v=4" width="150" />

**경기 불황 속에서 합리적 소비를 추구하는 MZ세대를 위한**  
**AI 기반 LG U+ 요금제 및 구독 서비스 추천 플랫폼**

 _유레카 프론트엔드 개발자 2기 종합 프로젝트 최우수상🥇_

[WBS](https://docs.google.com/spreadsheets/d/1ln5VudFdBKMbaNANwzZyW0CGLYC_R9Xf/edit?usp=sharing&ouid=101077923369398316818&rtpof=true&sd=true) • [플로우 차트](https://www.figma.com/proto/C1HjN8qg3Vptm2j7k2cT8N/%ED%94%8C%EB%A1%9C%EC%9A%B0%EC%B0%A8%ED%8A%B8?node-id=1-4&t=OH4mgwF8RPp4bDv8-1&scaling=scale-down-width&content-scaling=fixed&page-id=0%3A1) • [API 명세서](https://hollow-cello-87b.notion.site/1fb3347f51ee81269bceeaad7f3c76f1?v=1fb3347f51ee81719ba1000c67dfe978) • [ERD](https://dbdiagram.io/d/DB_4ever0-684e577c3cc77757c8eaba7c) • [Storybook](https://6835efb2a0dda6635d6b2c1d-wezhjmyzke.chromatic.com)

</div>

## 프로젝트 개요

| 항목           | 내용                             |
| -------------- | -------------------------------- |
| **프로젝트명** | MoonoZ                           |
| **팀명**       | 4EVER0                           |
| **주제**       | LG U+ 요금제 추천 AI 챗봇 서비스 |
| **타겟층**     | 합리적 소비를 추구하는 MZ세대    |
| **개발 기간**  | 2025.06.04 ~ 2025.06.26 (약 3주) |
| **팀 구성**    | 5명 (Full-Stack 개발)   |

### 개발 동기

- **시장 배경**
  - 최근 경기 불황과 구독료 인상으로 **MZ세대의 합리적 소비 지향**이 뚜렷해짐
  - 최근 LG유플러스의 '유독픽' 과 같은 구독 통합 상품이 **20·30대 가입자 비중 71%** 달성
  - **개인 라이프스타일 최적화된 통합 서비스**에 대한 수요 급증
- **개발 목표**
  - **AI 챗봇 기반 성향 분석**을 통한 맞춤형 요금제 및 서비스 추천
  - **MZ세대의 스마트한 통신 라이프스타일** 지원

## 시연 영상
[![시연 영상](http://img.youtube.com/vi/LGXlG-HELl8/0.jpg)](https://www.youtube.com/watch?v=LGXlG-HELl8)

## 주요 기능

### 1. AI 기반 멀티턴 챗봇 & 요금제 추천

<img src="https://github.com/user-attachments/assets/48d44c5c-f36d-41cf-b45a-34419505cc1c" width="500"/>

* LangChain + OpenAI 템플릿 아키텍처
* 자연어 기반 LG U+ 요금제/구독 추천
* Redis 기반 멀티턴 세션 저장 및 흐름 전환
* StreamingThrottle 기반 청크 지연 조절
* 커스텀 훅 `useStreamingChat`으로 카드 응답 처리

### 2. 위치 기반 팝업스토어 정보 & 쿠폰 혜택 제공

<img src="https://github.com/user-attachments/assets/50d4be6c-8db4-4304-bd2f-88057810ea72" width="300"/>

* Naver 지도 API 및 Reverse Geocoding 활용
* 내 위치 주변 팝업스토어 및 선호 브랜드 기반 쿠폰 추천
* 선호 브랜드 저장 기능

### 3. 미션 중심 인터랙션 & 유플투쁠 시스템

<img src="https://github.com/user-attachments/assets/3d7f656d-c882-49d3-a24c-5b55b26a42e9" width="500"/>

* 출석, 공유, 탐색 등 참여형 미션 구성
* 포인트 획득 → 혜택 연계 구조 설계
* 연속 출석 보상 및 유플투쁠 게이미피케이션 적용

### 4. 마이페이지에서 혜택 및 이용 현황 확인

<img src="https://github.com/user-attachments/assets/3f90cbeb-c945-45e1-a736-700e76a95693" width="500"/>

* 나의 혜택/포인트/미션 내역 한눈에 확인
* UI 기반 시각화 제공
* 사용자 참여 히스토리 기반 맞춤 정보 제공

### 5. 접근 제어 및 로그인 유도 기능

<img src="https://github.com/user-attachments/assets/2d33709e-6668-418f-87fd-d7fb50e0b668" width="500"/>

* 핵심 기능 보호 + 손쉬운 접근 가능
* 자연스러운 로그인 흐름 유도
* 비회원 최대 5회 채팅, 일부 기능만 체험 가능



## 팀원 소개 및 역할

| 프로필                                                                             | 이름                                                         | 주요 역할 및 기여 내용                                                                                                                                                                                         |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <img src="https://avatars.githubusercontent.com/u/77565980?v=4" width="100" />  | **이영주**<br/>[@abyss-s](https://github.com/abyss-s)         | **전체 프로젝트 총괄 리더**<br/>- 워크플로우, 시스템 아키텍처 설계<br/>- LangChain 기반 AI 챗봇 및 스트리밍 처리<br/>- 사용자 반응 기반 동적 스트리밍 응답 시스템 설계<br/>- 채팅*요금제·구독 API 개발<br/>- Naver 지도 API 연동<br/>- 모달 전역 상태 관리 설계<br/>- 유독픽, 무너톡, 요금제 UI 개발 |
| <img src="https://avatars.githubusercontent.com/u/80964083?v=4" width="100" />  | **박교녕**<br/>[@kny0ng125](https://github.com/kny0ng125)     | **DevOps & 배포 리드**<br/>- OAuth 로그인 및 콜백 구현<br/>- JWT 인증·전역 상태 관리<br/>- Google/Naver API 매장 탐색 기능<br/>- SNS 공유 기능 및 UI<br/>- 마이페이지·핫플 UI 개발<br/>- 브랜드 별 좋아요 관리<br/>- AWS 기반 CI/CD 및 인프라 구성           |
| <img src="https://avatars.githubusercontent.com/u/197379577?v=4" width="100" /> | **박지회**<br/>[@jihoi0615](https://github.com/jihoi0615)     | **기획/디자인 리드**<br/>- 플로우 차트 및 서비스 기획<br/>- 쿠폰·팝업스토어·유플투쁠 ERD 설계<br/>- 좋아요·BEST 3 혜택 API 개발<br/>- 공통 컴포넌트 및 스토리북 제작<br/>- 요금제·핫플·홈·타코시그널 UI<br/>- Moonoz 가이드북 제작<br/>- 시연 영상 구성 및 음성 녹음               |
| <img src="https://avatars.githubusercontent.com/u/171488704?v=4" width="100" /> | **이은채**<br/>[@eunchrri](https://github.com/eunchrri)       | **QA 리드**<br/>- 미션·출석·유플투쁠 ERD 및 API 개발<br/>- UI 기획 및 캘린더 컴포넌트 제작<br/>- 출석, 미션, 유플투쁠 페이지 UI 구현<br/>- 스토리북 제작 및 컴포넌트 관리<br/>- 달력 상태 렌더링 구현<br/>- 코드 리팩토링 및 컴포넌트 분리                                   |
| <img src="https://avatars.githubusercontent.com/u/134802163?v=4" width="100" /> | **홍민주**<br/>[@illustermin](https://github.com/illustermin) | **스크럼 리드**<br/>- 브랜드, 쿠폰 ERD 설계 및 API 개발<br/>- 마이페이지·쿠폰함·타코시그널 UI 기획 및 구현<br/>- 홈·인트로·튜토리얼 페이지 UI<br/>- 공통 컴포넌트 및 전체 Layout 설계<br/>- 로딩 및 404 페이지 UI                                                |



## 기술 스택

| 분야                  | 기술 스택                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend**          | ![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white) ![Zustand](https://img.shields.io/badge/Zustand-FF6B35?style=flat&logo=zustand&logoColor=white) ![React Query](https://img.shields.io/badge/React_Query-FF4154?style=flat&logo=reactquery&logoColor=white) ![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat&logo=axios&logoColor=white) |
| **Backend**           | ![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=flat&logo=spring-boot&logoColor=white) ![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=JSON%20web%20tokens&logoColor=white) ![OAuth2](https://img.shields.io/badge/OAuth2-4285F4?style=flat&logo=oauth&logoColor=white) ![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat&logo=mysql&logoColor=white) ![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white) ![JPA](https://img.shields.io/badge/JPA-59666C?style=flat&logo=hibernate&logoColor=white) ![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=flat&logo=swagger&logoColor=black)                  |
| **AI Server**         | ![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white) ![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?style=flat&logo=langchain&logoColor=white) ![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=flat&logo=openai&logoColor=white) ![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-D71F00?style=flat&logo=sqlalchemy&logoColor=white)                                                                                                                                                                                                                                                                                                |
| **Infrastructure**    | ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white) ![AWS EC2](https://img.shields.io/badge/AWS_EC2-FF9900?style=flat&logo=amazon-ec2&logoColor=white) ![AWS RDS](https://img.shields.io/badge/AWS_RDS-527FFF?style=flat&logo=amazon-rds&logoColor=white) ![AWS S3](https://img.shields.io/badge/AWS_S3-569A31?style=flat&logo=amazon-s3&logoColor=white) ![ALB](https://img.shields.io/badge/AWS_ALB-FF4F00?style=flat&logo=load-balancer&logoColor=white) ![Route 53](https://img.shields.io/badge/Route_53-DA7B00?style=flat&logo=amazon-route-53&logoColor=white) ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)                                                                                                                                                                                                          |
| **Development Tools** | ![Git](https://img.shields.io/badge/Git-F05032?style=flat&logo=git&logoColor=white) ![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white) ![Jira](https://img.shields.io/badge/Jira-0052CC?style=flat&logo=jira&logoColor=white) ![Notion](https://img.shields.io/badge/Notion-000000?style=flat&logo=notion&logoColor=white) ![Confluence](https://img.shields.io/badge/Confluence-172B4D?style=flat&logo=confluence&logoColor=white) ![Discord](https://img.shields.io/badge/Discord-5865F2?style=flat&logo=discord&logoColor=white) ![Figma](https://img.shields.io/badge/Figma-F24E1E?style=flat&logo=figma&logoColor=white)                                    |
| **UI/UX & Testing**   | ![Shadcn/ui](https://img.shields.io/badge/Shadcn%2Fui-000000?style=flat&logo=shadcnui&logoColor=white) ![Storybook](https://img.shields.io/badge/Storybook-FF4785?style=flat&logo=storybook&logoColor=white) ![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=flat&logo=eslint&logoColor=white) ![Prettier](https://img.shields.io/badge/Prettier-F7B93E?style=flat&logo=prettier&logoColor=black) ![Husky](https://img.shields.io/badge/Husky-42B883?style=flat&logo=husky&logoColor=white)                                                                                                                                                                                                     |

## 시스템 아키텍처
![system-architecture](https://github.com/user-attachments/assets/68b723ca-6eb7-4818-847e-b3300674b380)



## AI 챗봇 동적 스트리밍 제어 아키텍처
![Mermaid Chart - Create complex, visual diagrams with text  A smarter way of creating diagrams -2025-06-26-170728](https://github.com/user-attachments/assets/16acb45e-a9c6-4fd5-ad87-b606b499a49e)



---
**Team 4EVER0** | LG U+ URECA 프론트엔드 개발자 과정 2기 종합프로젝트 4조
