# Project Overview — Mobile Second Brain Capture

## 목적
모바일에서 웹앱을 직접 활성화했을 때, 웹앱 내부 활동 기록과 사용자가 명시적으로 허용한 음성 기록을 수집하고, 하루 단위로 로컬 정리한 뒤 GitHub private repo에 저장하며, Obsidian 세컨드 브레인에서 동기화·정리·활용할 수 있는 PWA 웹앱.

## MVP 범위

| 기능 | 상태 |
|------|------|
| 모바일 PWA | ✅ |
| 사용자 동의 시스템 | ✅ |
| 기록 시작/정지 | ✅ |
| 앱 내부 이벤트 로깅 | ✅ |
| 빠른 메모 입력 | ✅ |
| 명시적 음성 녹음 | ✅ |
| IndexedDB 로컬 저장 | ✅ |
| 일일 Markdown 파일 생성 | ✅ |
| 일일 JSONL 파일 생성 | ✅ |
| metadata JSON 생성 | ✅ |
| GitHub API 동기화 | ✅ |
| Obsidian Vault 폴더 구조 | ✅ |
| 동기화 상태 표시 | ✅ |
| 에러 로그 | ✅ |

## 제외 범위
STT, GPT 요약, 자동 태그, Obsidian 링크 자동 생성, GitHub Actions, FastAPI 분리, Supabase, 관리자 대시보드. → `docs/future-roadmap.md` 참조.

## 전체 워크플로우
```
웹앱 활동
  → 사용자 동의 확인
  → IndexedDB 저장 (events / memos / audioSessions)
  → dailyBuilder → Markdown + JSONL + metadata
  → /api/github/sync-daily (서버)
  → GitHub private repo (Obsidian Vault 구조)
  → Obsidian Git 플러그인으로 pull → 세컨드 브레인 활용
```

## 기술 스택
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Storage**: IndexedDB (idb 라이브러리)
- **PWA**: next-pwa, Web Manifest
- **Recording**: MediaRecorder API (webm/opus)
- **Sync**: GitHub Contents API (서버 API Route 경유)
- **Vault**: Obsidian-compatible Markdown + JSONL

## 보안 원칙
1. GITHUB_TOKEN — 서버 .env.local 전용, 절대 NEXT_PUBLIC_ 금지
2. 동의 전 기록 기능 전체 차단
3. 녹음 — 사용자 gesture 직접 호출만 허용
4. input[type=password] 수집 차단
5. 민감 패턴(토큰, API 키) 자동 마스킹
6. 오디오 원본 GitHub 업로드 기본 off
