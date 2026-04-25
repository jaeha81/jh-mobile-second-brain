import { NextRequest, NextResponse } from 'next/server'
import { uploadBinaryFile } from '@/lib/googleDriveClient'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const FILENAME_RE = /^[a-zA-Z0-9._-]+$/

interface UploadAudioPayload {
  sessionId: string
  date: string
  fileName: string
  audioBase64: string
}

export async function POST(req: NextRequest) {
  const secret = process.env.INTERNAL_API_SECRET
  if (secret) {
    const auth = req.headers.get('x-internal-token')
    if (auth !== secret) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN
  const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID

  if (!clientId || !clientSecret || !refreshToken || !rootFolderId) {
    return NextResponse.json({ success: false, error: 'Google Drive 환경변수 미설정' }, { status: 500 })
  }

  let body: UploadAudioPayload
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'invalid JSON body' }, { status: 400 })
  }

  const { sessionId, date, fileName, audioBase64 } = body

  if (!date || !fileName || !audioBase64) {
    return NextResponse.json(
      { success: false, error: 'date, fileName, audioBase64 필수' },
      { status: 400 }
    )
  }

  if (!DATE_RE.test(date)) {
    return NextResponse.json({ success: false, error: 'date 형식 오류 (YYYY-MM-DD)' }, { status: 400 })
  }
  if (!FILENAME_RE.test(fileName)) {
    return NextResponse.json({ success: false, error: 'fileName에 허용되지 않는 문자 포함' }, { status: 400 })
  }

  const [year, month, day] = date.split('-')
  const audioPath = `raw-data/${year}/${month}/${day}/audio/${fileName}`
  const mimeType = fileName.endsWith('.webm') ? 'audio/webm' : 'audio/mpeg'

  try {
    const config = { clientId, clientSecret, refreshToken, rootFolderId }
    await uploadBinaryFile(config, audioPath, audioBase64, mimeType)
    return NextResponse.json({ success: true, path: audioPath, sessionId })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
