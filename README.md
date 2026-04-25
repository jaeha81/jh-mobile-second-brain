# Mobile Second Brain Capture

모바일에서 웹앱 내부 활동을 기록하고 Obsidian 세컨드 브레인과 동기화하는 PWA.

---

## 실제 가능한 기능

- 웹앱 내부 이벤트 기록 (버튼 클릭, 페이지 이동)
- 빠른 메모 입력 및 저장
- 사용자가 직접 시작하는 음성 녹음 (로컬 저장)
- IndexedDB 기반 로컬 저장
- 일일 Markdown 파일 자동 생성 (Obsidian 호환)
- 일일 JSONL 이벤트 로그 생성
- GitHub private repo 동기화
- PWA 설치 (홈 화면 앱)
- 동의 기반 수집 제어

## 구현하지 않는 기능

다른 앱 감시, 통화 녹음, 키로깅, 백그라운드 상시 녹음, 비밀번호 수집, 외부 브라우저 활동 추적.
전체 목록: `docs/future-roadmap.md`

---

## 설치

```bash
git clone <repo>
cd msb-clean
npm install
cp .env.example .env.local
```

## 환경변수 설정

`.env.local` 파일:

```env
GITHUB_TOKEN=github_pat_...        # Fine-grained token (서버 전용)
GITHUB_OWNER=your-github-username
GITHUB_REPO=your-private-repo
GITHUB_BRANCH=main
GITHUB_BASE_PATH=obsidian-vault
NEXT_PUBLIC_APP_NAME=Mobile Second Brain Capture
```

> `GITHUB_TOKEN`에 절대 `NEXT_PUBLIC_` 붙이지 말 것.

## 실행

```bash
npm run dev
# http://localhost:3000
```

## GitHub Token 생성

`docs/github-token-guide.md` 참고.

요약:
1. GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. 해당 repo만 선택, Contents: Read & Write 권한
3. 생성된 토큰을 `.env.local`의 `GITHUB_TOKEN`에 입력

## GitHub Private Repo 준비

1. GitHub에서 새 **private** repo 생성
2. `.env.local`의 `GITHUB_REPO`에 repo 이름 입력
3. 설정 화면 → "GitHub 연결 확인" 버튼으로 접근 테스트

## 모바일 PWA 설치

1. Vercel 또는 ngrok으로 HTTPS 배포
2. 모바일 Chrome: 주소창 오른쪽 메뉴 → "홈 화면에 추가"
3. 모바일 Safari: 공유 버튼 → "홈 화면에 추가"

## Obsidian 동기화

`docs/obsidian-sync-guide.md` 참고.

요약:
1. GitHub repo를 로컬에 clone
2. Obsidian → "Open folder as vault" → `obsidian-vault/` 폴더 선택
3. Obsidian Git 플러그인 설치 → Pull 실행

## 개인정보 보호

- 웹앱 내부 활동만 기록 (다른 앱 감시 없음)
- 음성 녹음은 사용자가 버튼을 직접 누를 때만
- 데이터는 기기 로컬 우선, GitHub 동기화는 사용자 액션 기반
- 오디오 원본 GitHub 업로드 기본 OFF
- 전체 안내: `docs/privacy-policy-draft.md`

## 보안 주의사항

- `.env.local`은 절대 git에 커밋하지 말 것 (`.gitignore` 포함됨)
- GitHub Token은 서버 환경변수로만 관리
- GitHub repo는 private으로 유지 권장
- Token 유출 시 즉시 revoke: `docs/github-token-guide.md`

## MVP 범위

`llm-wiki/current-state.md` 참고.

## 향후 확장 계획

`docs/future-roadmap.md` 참고. STT, GPT 요약, 자동 태그, GitHub Actions 등.

## Codex 검증

```bash
# 타입 체크
npx tsc --noEmit

# Token 프론트 노출 확인
grep -r "GITHUB_TOKEN" app/ components/ lib/

# env 파일 git 제외 확인
cat .gitignore | grep env
```

체크리스트 전체: `docs/codex-validation-checklist.md`

---

## 파일 구조

```
app/                    Next.js 라우터
  page.tsx              홈 화면
  consent/              동의 화면
  capture/              기록 화면
  daily-review/         일일 리뷰
  settings/             설정
  api/github/           GitHub API Routes (서버 전용)
components/             UI 컴포넌트
lib/                    핵심 로직
  db.ts                 IndexedDB
  recorder.ts           MediaRecorder
  dailyBuilder.ts       일일 파일 생성
  githubClient.ts       GitHub API
  eventLogger.ts        이벤트 로깅
  privacyFilters.ts     민감정보 필터
llm-wiki/               세션 간 상태 관리 문서
docs/                   가이드 및 문서
public/                 PWA 아이콘, manifest
```
