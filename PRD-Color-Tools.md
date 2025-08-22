# PRD: 색상 도구 세트 (Color Tools)

## 1) 배경/목표
- GitHub Pages에 호스팅 가능한 100% 정적 웹앱으로, DB 없이 구동
- 구글 애드센스 광고를 배치해 방문 트래픽 기반 수익화
- 디자이너/개발자/마케터가 자주 찾는 색상 관련 작업을 빠르게 처리할 수 있는 유틸리티 제공
- 페이지 로딩 즉시 사용 가능, 반응형, 접근성 준수(WCAG 대비 검사 포함)

## 2) 범위(Scope)
- 컬러 피커: HEX/RGB/HSL/HSV 입력 및 변환, 시스템 컬러 피커 호출, 스포이드(지원 브라우저 한정)
- 팔레트 생성: 단색 기반 톤 변형, 보색/유사/삼각/사각 조화, n-스텝 스케일(예: 50~900)
- 대비 체크(WCAG): 텍스트/배경 색 대비비율 계산, WCAG 2.2 기준 AA/AAA 판정, 글자 크기/폰트 두께 반영
- 그라디언트 생성: 선형/원형 그라디언트, 다중 스탑, 각도/방향, CSS 코드 복사, 미리보기 다운로드
- 공통: 최근 사용 색/팔레트 로컬 저장(localStorage), 공유용 URL 파라미터, 복사/다운로드 기능

## 3) 비범위(Out of Scope)
- 사용자 로그인/DB 저장
- 팀 협업/실시간 공유 기능
- 서버 렌더링/서버 API

## 4) 타겟 사용자 & 사용 사례
- 디자이너: 브랜드 컬러에서 팔레트 확장, 대비 준수 확인
- 프론트엔드 개발자: CSS 토큰 생성, 코드 복사, 다크모드 대비 체크
- 마케터/콘텐츠 작성자: 썸네일/랜딩 배경 그라디언트 빠른 생성

## 5) 성공 지표(KPI)
- 첫 로딩 < 1.0s(3G Fast 기준 캐시 후 0.7s 목표)
- 페이지 체류시간 > 90초, 도구 상호작용 3회 이상/세션
- 복사/다운로드/공유 클릭률 합계 > 10%
- 애드센스 보기 가능 영역(Viewability) > 70%

## 6) 정보 구조(IA) / 네비게이션
- 최상단 내비게이션: Color Picker | Palette | Contrast | Gradient
- 각 도구는 독립 URL
  - /picker
  - /palette
  - /contrast
  - /gradient
- 랜딩(/): 4개 도구 카드 목록 + 핵심 기능 요약 + 광고 배너 하나

## 7) 기능 요구사항(Functional Requirements)
### 7.1 컬러 피커 (/picker)
- 입력: HEX(#RRGGBB/#RGB), RGB(0-255), HSL, HSV 양방향 변환
- 시스템 컬러 피커 버튼 및 "스포이드"(EyeDropper API 지원 브라우저)
- 불량 입력 실시간 검증/자동 보정(# 누락 시 보정 등)
- 최근 사용 색 최대 20개, localStorage 보관/삭제
- 복사 버튼: HEX/RGB/HSL, ARGB/Opacity 옵션
- 공유: 현재 색을 URL 쿼리로 인코딩 ?c=hex

### 7.2 팔레트 생성 (/palette)
- 기본 색 1개 입력 → 조화 팔레트: Complementary, Analogous, Triadic, Tetradic
- 톤 변형: lighten/darken/saturate/desaturate/alpha, 단계 수 n(예: 10단계)
- 출력: HEX 배열, CSS 변수 토큰(--color-50, --color-100 …)
- 프리셋: Material-like scale(50~900), Tailwind-like scale(50~900)
- 저장: 최근 팔레트 썸네일 최대 10개 localStorage
- 내보내기: JSON, CSS, SVG 스와치 스트립 다운로드

### 7.3 대비 체크(WCAG) (/contrast)
- 입력: 전경색/배경색 + 글자 크기(px/em) + font-weight(normal/bold)
- 계산: 대비비율(contrast ratio) 및 WCAG 2.2 기준
  - 일반 텍스트: AA ≥ 4.5:1, AAA ≥ 7:1
  - 큰 텍스트(≥18pt 또는 14pt bold): AA ≥ 3:1, AAA ≥ 4.5:1
- 결과: Pass/Fail, 등급, 대비비율 소수점 둘째 자리
- 배경 미리보기(단색/그라디언트 선택 가능)
- 다중 케이스 비교 리스트(최대 5쌍) 저장

### 7.4 그라디언트 생성 (/gradient)
- 유형: linear, radial
- 스탑: 2~10개, 각 HEX/위치%, 전역 각도(0~360deg)
- 미리보기: 캔버스/CSS 배경 실시간 반영
- 출력: CSS 문법(background: linear-gradient(...)) 복사
- 내보내기: PNG/SVG 다운로드(간단한 배경 이미지 용)
- 공유: 모든 스탑과 각도 URL로 직렬화

### 7.5 공통
- 다국어 준비: 초기 ko-KR, i18n 구조만 마련(en 대기)
- 키보드 접근성: Tab 순서/포커스 링/ARIA 라벨
- 복사 시 토스트 알림
- 다크/라이트 테마 자동/수동 토글

## 8) 비기능 요구사항(Non-Functional)
- 정적 호스팅: GitHub Pages, 빌드 없이 순수 HTML/CSS/JS로도 구동 가능(향후 빌드 도입 여지)
- 성능: 번들 < 150KB(gzip) 목표, 이미지/아이콘은 SVG 인라인 우선
- 접근성: WCAG 2.2 AA 가이드 준수, 명확한 포커스 스타일
- 브라우저 지원: 최신 크롬/엣지/사파리/파폭, EyeDropper 미지원 시 우회
- 개인정보: localStorage만 사용, 쿠키 최소화(애드센스 제외)

## 9) 기술 설계 개요
- 프레임워크: 초기에는 바닐라(또는 경량 프레임워크 Preact/Svelte 후보). 라우팅은 History API 기반 해시 라우터(/#/picker 등) 또는 정적 파일 분리
- 색 계산: 작은 유틸 자체 구현 또는 tinycolor2/culori 중 1개 선택(의존 최소화 방침)
- 상태: URLSearchParams ↔ 상태 동기화, localStorage persistence
- 다운로드: Canvas API로 PNG, 동적 SVG 문자열 생성
- 공유: URL 길이 제한 고려(경량 직렬화, base64url 또는 RLE)

## 10) 알고리즘/수식
- RGB↔HSL/HSV 변환: 표준 변환식 사용
- 대비비율(Contrast Ratio):
  - 상대 휘도 L = 0.2126·R_lin + 0.7152·G_lin + 0.0722·B_lin
  - R_lin = (R_sRGB ≤ 0.03928) ? R_sRGB/12.92 : ((R_sRGB+0.055)/1.055)^2.4 (G/B 동일)
  - ratio = (L1 + 0.05) / (L2 + 0.05) (L1 ≥ L2)

## 11) UI 와이어프레임(텍스트)
- 헤더: 로고(텍스트) | 내비 | 테마 토글 | 검색
- 본문: 도구별 카드/폼/프리뷰, 우측/중단 광고 슬롯
- 푸터: 저작권, 링크(문의, 개인정보, 오픈소스 고지)

## 12) 광고 전략(Ads)
- 배치: 상단 고정 728x90(모바일 320x100), 본문 중간 in-article, 푸터 728x90
- CLS 방지: 광고 자리 고정 박스 높이 예약
- 개인정보/쿠키 배너: 애드센스 정책 준수 고지

## 13) SEO/공유
- 각 도구별 정적 메타태그(title/description), schema.org WebApplication
- Open Graph/Twitter 카드, 대표 이미지 생성(동적 또는 정적)
- 키워드: color picker, contrast checker, color palette generator, gradient generator, HEX to RGB

## 14) 분석(Analytics)
- 페이지뷰/체류시간/이탈률, 버튼 클릭(복사/다운로드/공유), 광고 가시성
- 구현: 간단한 Web Vitals 수집 + gtag.js(필요 시 프라이버시 노트)

## 15) 에지 케이스/오류 처리
- 잘못된 색 입력: 즉시 경고/보정 제안
- URL 파라미터 손상: 기본값으로 복구
- EyeDropper 미지원: 대체 UI(입력/팔레트 선택) 노출
- 다운로드 실패: 브라우저 저장 권한 관련 안내

## 16) 마일스톤/로드맵
- M1(주차 1): IA/레이아웃/라우팅, Picker MVP, Contrast MVP
- M2(주차 2): Palette 생성, URL 공유/로컬 저장, 기본 광고 삽입
- M3(주차 3): Gradient 생성, PNG/SVG 내보내기, SEO/OG 정리
- M4(주차 4): i18n 구조, 경량화/성능 최적화, 접근성 개선, QA

## 17) 품질 보증(테스트 기준)
- 유닛: 색 변환/대비 계산 정확도 스냅샷
- E2E: 주요 시나리오(입력→복사/다운로드/공유) 크로스 브라우저 점검
- 접근성: 키보드 내비/포커스 순서/명도 대비 자동 테스트

## 18) 라이선스/법적 고지
- 오픈소스 사용 시 라이선스 표기(아이콘/라이브러리)
- 광고/추적 관련 개인정보 고지 링크 명시

## 19) 오픈 이슈(초기)
- EyeDropper API 폴백 UX 구체화
- URL 직렬화 포맷 결정(가독 vs 길이)
- PNG/SVG 내보내기 품질/성능 밸런스
