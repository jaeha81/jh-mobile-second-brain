# Codex 검증 체크리스트

## 보안

- [ ] GitHub Token이 프론트엔드 코드에 노출되지 않는가
  - 확인: `grep -r "GITHUB_TOKEN" app/ components/ lib/` → API route 외 결과 없어야 함
- [ ] `.env.local`이 `.gitignore`에 포함되는가
  - 확인: `cat .gitignore | grep env.local`
- [ ] `NEXT_PUBLIC_GITHUB_TOKEN` 같은 형태가 없는가
  - 확인: `grep -r "NEXT_PUBLIC_GITHUB" .`

## 동의 시스템

- [ ] 동의 전 기록 기능이 차단되는가
  - 확인: `lib/eventLogger.ts` — `hasFullConsent()` 체크 후 return
  - 확인: `app/capture/page.tsx` — consented false 시 동의 화면 유도
- [ ] 동의 상태가 IndexedDB에 저장되는가
  - 확인: `lib/db.ts` — STORES.CONSENT store

## 녹음 안전성

- [ ] 녹음은 사용자가 직접 버튼을 눌렀을 때만 시작하는가
  - 확인: `components/RecorderControls.tsx` — `handleStart`는 onClick에서만 호출
- [ ] 백그라운드 상시 녹음 코드가 없는가
  - 확인: `useEffect` 안에 `startRecording()` 호출 없어야 함
- [ ] 다른 앱 활동 수집 코드가 없는가
  - 확인: `window.addEventListener` 목록에 외부 앱 관련 이벤트 없어야 함

## 민감정보 필터

- [ ] `input[type=password]` 수집이 차단되는가
  - 확인: `lib/privacyFilters.ts` — `isSensitiveTarget()` password 타입 체크
- [ ] 민감 패턴(토큰, API 키) 마스킹이 적용되는가
  - 확인: `lib/privacyFilters.ts` — `sanitizeNote()` REDACTED 치환
- [ ] 이벤트 로거가 민감 필드 클릭을 무시하는가
  - 확인: `lib/eventLogger.ts` — `logClick()` → `isSensitiveTarget()` 체크

## 데이터 저장

- [ ] IndexedDB 9개 store가 정상 생성되는가
  - 확인: DevTools → Application → IndexedDB → mobile-second-brain
- [ ] 날짜별 데이터 조회가 정상 작동하는가
  - 확인: `lib/db.ts` — `getEventsByDate()` timestamp.startsWith(date)

## 일일 기록

- [ ] Markdown 형식이 Obsidian 호환인가
  - 확인: `lib/dailyBuilder.ts` — `# Daily Capture -` 헤더, `## 1. 요약` 구조
- [ ] JSONL 각 줄이 유효한 JSON인가
  - 확인: `daily.jsonl` 파일을 `JSON.parse(line)` 으로 검증
- [ ] metadata.json 구조가 올바른가
  - 확인: `DailyMetadata` 타입과 일치 여부

## GitHub 동기화

- [ ] 파일 생성이 정상 작동하는가
  - 확인: sync 후 GitHub repo에서 파일 확인
- [ ] 기존 파일 업데이트 시 SHA 처리가 되는가
  - 확인: `lib/githubClient.ts` — `getFileSHA()` → PUT body에 sha 포함
- [ ] 충돌 발생 시 conflict-copy가 생성되는가
  - 확인: `lib/githubClient.ts` — HTTP 409 처리

## PWA

- [ ] 오디오 원본 업로드 기본값이 OFF인가
  - 확인: `lib/constants.ts` — `DEFAULT_SETTINGS.uploadAudioToGithub: false`
- [ ] PWA manifest가 유효한가
  - 확인: DevTools → Application → Manifest
- [ ] 모바일 화면에서 UI가 깨지지 않는가
  - 확인: iPhone Safari / Android Chrome에서 직접 확인
- [ ] README가 실제 실행 가능한 수준인가
  - 확인: README.md의 설치~실행 단계를 그대로 따라가서 작동 확인
