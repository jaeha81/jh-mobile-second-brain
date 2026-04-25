# Obsidian 동기화 가이드

## 개요

이 앱은 GitHub private repo를 Obsidian Vault로 사용하는 구조다.
앱에서 동기화하면 GitHub에 파일이 저장되고, Obsidian Git 플러그인으로 pull해서 노트를 확인한다.

## GitHub repo 폴더 구조

```
your-repo/
  obsidian-vault/
    00-inbox/
      daily-capture/
        2026/
          04/
            2026-04-25.md   ← 오늘 일일 기록
    90-system/
      sync-log.md
      error-log.md
  raw-data/
    2026/
      04/
        25/
          events.jsonl
          audio-sessions.json
          metadata.json
  audio/                    ← 오디오 업로드 ON일 때만
    2026/04/25/
      session-001.webm
```

## PC에서 Obsidian 설정

### 방법 1: Obsidian Git 플러그인 (권장)

1. GitHub repo를 로컬에 clone
   ```bash
   git clone https://github.com/your-name/your-repo.git
   ```
2. Obsidian에서 "Open folder as vault" → clone한 폴더 안의 `obsidian-vault/` 선택
3. Obsidian Community Plugins → Obsidian Git 설치 및 활성화
4. Obsidian Git 설정:
   - Auto pull interval: 원하는 주기 (예: 10분)
   - Commit message: `sync: {{date}}`
5. Cmd/Ctrl+P → "Obsidian Git: Pull" 실행

### 방법 2: GitHub Desktop

1. GitHub Desktop에서 repo clone
2. 앱에서 동기화 후 GitHub Desktop에서 "Fetch origin" → "Pull"
3. Obsidian에서 변경된 파일 확인

## 모바일 Obsidian

모바일 Obsidian에서 iCloud 또는 Obsidian Sync 사용 시:
- PC에서 Obsidian Vault를 동기화된 폴더에 두면 모바일에서도 확인 가능
- Obsidian Git 플러그인은 모바일에서 작동이 불안정할 수 있음

## 충돌 방지

- 이 앱은 GitHub에서 파일을 읽기만 하고 덮어쓰기만 함 (Obsidian이 수정한 내용 삭제 가능)
- 같은 날짜 파일을 Obsidian에서 편집 중이라면 동기화 전에 먼저 commit하거나 백업 권장
- 충돌 발생 시 앱이 자동으로 `-conflict-{timestamp}` 파일 생성

## daily-capture 폴더 활용

```
# Daily Capture - 2026-04-25

## 2. 오늘의 핵심 메모
- 현장 회의 내용 정리 필요

## 5. 인사이트 후보
- 반복적으로 등장한 주제: 인테리어 견적 자동화
- Obsidian 링크 후보: [[인테리어 AI 프로젝트]]
```

`## 5. 인사이트 후보`와 `## 6. 다음 액션`은 사용자가 직접 Obsidian에서 채워넣는 영역이다.

## raw-data 폴더 활용

- `events.jsonl`: 타임스탬프 기반 활동 로그. GPT 분석, 검색에 활용 가능
- `audio-sessions.json`: 녹음 세션 메타데이터
- `metadata.json`: 당일 요약 통계

## 태그 활용

모든 일일 기록에 `#daily-capture #mobile-log #second-brain` 태그가 자동 포함된다.
Obsidian에서 태그 검색으로 전체 일일 기록 목록 조회 가능.

## 프로젝트별 노트 분리 (후속 운영)

일일 기록에서 반복 등장하는 주제는 Obsidian에서 별도 노트로 분리:
```
[[인테리어 AI 프로젝트]] ← 일일 기록에서 링크
02-projects/
  인테리어-AI-프로젝트.md
```
