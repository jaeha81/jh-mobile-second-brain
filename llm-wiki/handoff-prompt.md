# Handoff Prompt — 다음 세션 인계용

## Claude Code에게

이 프로젝트는 Mobile Second Brain Capture PWA다.
이 파일을 먼저 읽고, `llm-wiki/current-state.md`를 확인한 뒤 작업을 이어받아라.

## 현재 파일 구조 (완성 기준)

```
msb-clean/
  app/
    layout.tsx, globals.css, page.tsx
    consent/page.tsx
    capture/page.tsx
    daily-review/page.tsx
    settings/page.tsx
    api/github/
      check-config/route.ts
      sync-daily/route.ts
      get-latest-sync/route.ts
      retry-failed-sync/route.ts
  components/
    AppShell.tsx, BottomNav.tsx, StatusCard.tsx, ErrorBanner.tsx
    ConsentPanel.tsx, CaptureControls.tsx, RecorderControls.tsx
    QuickMemo.tsx, SyncButton.tsx, DailyPreview.tsx, SettingsForm.tsx
  lib/
    types.ts, constants.ts, db.ts, privacyFilters.ts, date.ts
    eventLogger.ts, recorder.ts, dailyBuilder.ts, githubClient.ts, syncQueue.ts
  public/
    manifest.json, icons/icon-192.png, icons/icon-512.png
  llm-wiki/ (6개 문서)
  docs/ (6개 문서)
  .env.example, .gitignore, package.json, tsconfig.json
  next.config.js, tailwind.config.ts, postcss.config.js, README.md
```

## 남은 작업
1. 사용자가 `.env.local` 설정 후 `npm run dev` 실행
2. 로컬 테스트 완료 후 Vercel 또는 Cloudflare Pages 배포
3. 오디오 원본 업로드 API Route 구현 (선택, MVP 이후)
4. 자동 동기화 interval 구현 (선택, MVP 이후)

## 실행 명령어
```bash
cd msb-clean
cp .env.example .env.local
# .env.local에 GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO 입력
npm run dev
# http://localhost:3000 접속
```

## 보안 주의사항
- GITHUB_TOKEN은 절대 클라이언트 코드에 넣지 말 것
- `.env.local`은 git에 올리지 말 것 (.gitignore에 포함됨)
- `privacyFilters.ts`의 패턴 목록은 필요 시 확장 가능
