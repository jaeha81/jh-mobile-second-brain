# Current State

업데이트: 2026-04-25

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

## 미완료 기능 (MVP 이후)
- STT 음성 텍스트 변환
- 오디오 원본 GitHub 업로드 (설정 ON 시 동작 가능하지만 API Route 미구현)
- 자동 동기화 (설정 저장만, 실제 interval 미구현)

## 현재 막힌 지점
없음.

## 다음 작업
1. .env.local 설정 후 `npm run dev` 로컬 실행
2. 모바일 브라우저 접속 + PWA 설치
3. 동의 → 기록 → 메모 → 동기화 전체 플로우 테스트
4. Codex 검증 체크리스트 실행
