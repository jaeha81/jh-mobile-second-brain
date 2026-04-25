import { NextResponse } from 'next/server'
import { checkRepoAccess } from '@/lib/githubClient'

export async function GET() {
  const token = process.env.GITHUB_TOKEN
  const owner = process.env.GITHUB_OWNER
  const repo = process.env.GITHUB_REPO
  const branch = process.env.GITHUB_BRANCH ?? 'main'

  if (!token || !owner || !repo) {
    return NextResponse.json({
      configured: false,
      repoAccessible: false,
      error: '환경변수 미설정: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO 확인 필요',
    })
  }

  try {
    const accessible = await checkRepoAccess({ token, owner, repo, branch })
    return NextResponse.json({
      configured: true,
      repoAccessible: accessible,
      error: accessible ? undefined : 'repo 접근 불가 — token 권한 또는 repo명 확인 필요',
    })
  } catch (err) {
    return NextResponse.json({
      configured: true,
      repoAccessible: false,
      error: err instanceof Error ? err.message : '알 수 없는 오류',
    })
  }
}
