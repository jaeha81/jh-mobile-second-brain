import { NextResponse } from 'next/server'

export async function GET() {
  // 클라이언트 IndexedDB에서 직접 조회하는 구조이므로
  // 서버는 GitHub 설정 상태만 반환
  const token = process.env.GITHUB_TOKEN
  const owner = process.env.GITHUB_OWNER
  const repo = process.env.GITHUB_REPO
  const branch = process.env.GITHUB_BRANCH ?? 'main'

  if (!token || !owner || !repo) {
    return NextResponse.json({
      configured: false,
      owner: null,
      repo: null,
      branch: null,
    })
  }

  return NextResponse.json({
    configured: true,
    owner,
    repo,
    branch,
    checkedAt: new Date().toISOString(),
  })
}
