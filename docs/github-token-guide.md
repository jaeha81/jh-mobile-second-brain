# GitHub Token 생성 가이드

## 권장: Fine-grained Personal Access Token

### 생성 방법

1. GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. "Generate new token" 클릭
3. Token name: `mobile-second-brain` (식별용)
4. Expiration: 90일 또는 1년 (필요에 따라)
5. Repository access: **Only select repositories** → 해당 private repo 선택
6. Permissions:
   - Contents: **Read and write** ← 필수
   - Metadata: **Read-only** ← 자동 선택됨
7. "Generate token" 클릭 → 토큰 복사

### .env.local에 입력

```env
GITHUB_TOKEN=github_pat_11ABCDEFG...
```

### 절대 금지

- `NEXT_PUBLIC_GITHUB_TOKEN` 형태로 환경변수 등록 금지
- 프론트엔드 코드에 직접 하드코딩 금지
- 공개 repo에 `.env.local` 커밋 금지
- 채팅, 슬랙, 이메일로 토큰 공유 금지

### 토큰 유출 시 즉시 처리

1. GitHub → Settings → Developer settings → Personal access tokens
2. 해당 토큰 찾아서 **Revoke** (즉시 무효화)
3. 새 토큰 생성 후 `.env.local` 업데이트
4. Vercel 등 배포 환경의 환경변수도 교체

### 필요한 최소 권한

| 권한 | 수준 | 이유 |
|------|------|------|
| Contents | Read & Write | 파일 생성/수정 |
| Metadata | Read-only | repo 정보 조회 |
