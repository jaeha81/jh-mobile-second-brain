# 설치 및 실행 가이드

## 요구사항
- Node.js 18 이상
- GitHub 계정 + private repo
- GitHub Fine-grained Personal Access Token

## 1단계 — 프로젝트 준비

```bash
git clone <your-fork-or-copy>
cd msb-clean
npm install
```

## 2단계 — 환경변수 설정

```bash
cp .env.example .env.local
```

`.env.local` 파일을 열고 다음 값을 채운다:

```env
GITHUB_TOKEN=github_pat_xxxx   # Fine-grained token
GITHUB_OWNER=your-github-username
GITHUB_REPO=your-private-repo-name
GITHUB_BRANCH=main
GITHUB_BASE_PATH=obsidian-vault
NEXT_PUBLIC_APP_NAME=Mobile Second Brain Capture
```

**주의**: `GITHUB_TOKEN`에 절대 `NEXT_PUBLIC_` 접두사 붙이지 말 것.

## 3단계 — GitHub repo 준비

1. GitHub에서 **private** repo 생성
2. repo 이름을 `.env.local`의 `GITHUB_REPO`에 입력
3. `docs/github-token-guide.md` 참고해서 token 생성

## 4단계 — 로컬 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속.

## 5단계 — 모바일 접속

같은 Wi-Fi 환경에서:
```bash
# 내 PC IP 확인
ipconfig  # Windows
ifconfig  # Mac/Linux
```

모바일 브라우저에서 `http://192.168.x.x:3000` 접속.

> 주의: MediaRecorder(녹음)는 HTTPS 또는 localhost에서만 작동.  
> 외부 모바일 접근 시 HTTPS 배포 필요 (Vercel 권장).

## 6단계 — Vercel 배포 (권장)

```bash
npx vercel
```

Vercel 대시보드 → Settings → Environment Variables에서 `.env.local` 값 동일하게 입력.

## 7단계 — PWA 설치

모바일 Chrome: 주소창 오른쪽 메뉴 → "홈 화면에 추가"  
모바일 Safari: 공유 버튼 → "홈 화면에 추가"
