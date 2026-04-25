import { NextResponse } from 'next/server'
import { checkFolderAccess } from '@/lib/googleDriveClient'

export async function GET() {
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID

  if (!serviceAccountJson || !rootFolderId) {
    return NextResponse.json({
      configured: false,
      repoAccessible: false,
      error: '환경변수 미설정: GOOGLE_SERVICE_ACCOUNT_JSON, GOOGLE_DRIVE_FOLDER_ID 확인 필요',
    })
  }

  try {
    const accessible = await checkFolderAccess({ serviceAccountJson, rootFolderId })
    return NextResponse.json({
      configured: true,
      repoAccessible: accessible,
      error: accessible ? undefined : 'Drive 폴더 접근 불가 — 서비스 계정 공유 여부 확인 필요',
    })
  } catch (err) {
    return NextResponse.json({
      configured: true,
      repoAccessible: false,
      error: err instanceof Error ? err.message : '알 수 없는 오류',
    })
  }
}
