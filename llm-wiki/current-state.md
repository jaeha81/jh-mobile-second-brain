# Current State

업데이트: 2026-04-25 (v2)

## 완료된 기능

### 인프라
- [x] Next.js 14 + TypeScript + Tailwind CSS 프로젝트 구성
- [x] PWA manifest + 아이콘 (192, 512)
- [x] .env.example + .gitignore
- [x] npm install 성공, tsc --noEmit 오류 0개

### 라이브러리 (`lib/`)
- [x] `types.ts` — 전체 타입 정의
- [x] `constants.ts` — 상수, 민감정보 패턴
- [x] `db.ts` — IndexedDB 9개 store (idb 라이브러리)
- [x] `privacyFilters.ts` — 민감정보 필터링
- [x] `date.ts` — 날짜/시간 유틸
- [x] `eventLogger.ts` — 앱 내부 이벤트 로깅
- [x] `recorder.ts` — MediaRecorder API 래퍼
- [x] `dailyBuilder.ts` — MD/JSONL/metadata 생성
- [x] `githubClient.ts` — GitHub Contents API 클라이언트
- [x] `syncQueue.ts` — 동기화 큐 관리

### API Routes
- [x] `GET /api/github/check-config` — 환경변수 + repo 접근 확인
- [x] `POST /api/github/sync-daily` — 일일 파일 4개 GitHub 저장
- [x] `GET /api/github/get-latest-sync` — 설정 상태 반환
- [x] `POST /api/github/retry-failed-sync` — 실패 항목 재시도

### 화면
- [x] `app/layout.tsx` — 루트 레이아웃 + PWA 메타
- [x] `app/globals.css` — Tailwind + 커스텀 유틸
- [x] `app/page.tsx` — Home
- [x] `app/consent/page.tsx` — 동의 화면
- [x] `app/capture/page.tsx` — 기록 화면
- [x] `app/daily-review/page.tsx` — 일일 리뷰
- [x] `app/settings/page.tsx` — 설정

### 컴포넌트
- [x] AppShell, BottomNav, StatusCard, ErrorBanner
- [x] ConsentPanel, CaptureControls, RecorderControls
- [x] QuickMemo, SyncButton, DailyPreview, SettingsForm

### 문서
- [x] llm-wiki/ 6개
- [x] docs/ 6개
- [x] README.md

### MVP 추가 구현 (2026-04-25 v2)
- [x] `POST /api/github/upload-audio` — 오디오 원본(webm) GitHub 업로드
- [x] `lib/githubClient.ts` — `uploadBinaryFile()` 바이너리 업로드 함수
- [x] `components/RecorderControls.tsx` — 녹음 정지 후 `uploadAudioToGithub` 설정 ON 시 자동 업로드
- [x] `app/page.tsx` — `autoSync` 설정 ON 시 앱 로드 시 자동 동기화 (당일 미동기화 시만)

## 미완료 기능 (Phase 2 이후)
- STT 음성 텍스트 변환 (Whisper API)
- GPT 자동 요약

## 현재 막힌 지점
없음.

## 다음 작업
1. `.env.local` 설정 후 `npm run dev` 로컬 실행
2. 모바일 브라우저 접속 + PWA 설치
3. 동의 → 기록 → 메모 → 동기화 전체 플로우 테스트
4. 오디오 업로드 ON 후 녹음 → GitHub 확인
5. autoSync ON 후 앱 재시작 → 자동 동기화 확인
