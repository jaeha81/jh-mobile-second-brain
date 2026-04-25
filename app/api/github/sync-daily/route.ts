import { NextRequest, NextResponse } from 'next/server'
import { upsertTextFile, appendTextFile } from '@/lib/googleDriveClient'
import type { SyncDailyPayload } from '@/lib/types'

export async function POST(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN
  const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID

  if (!clientId || !clientSecret || !refreshToken || !rootFolderId) {
    return NextResponse.json({ success: false, error: 'Google Drive 환경변수 미설정' }, { status: 500 })
  }

  let body: SyncDailyPayload
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'invalid JSON body' }, { status: 400 })
  }

  const { date, markdownContent, eventsJsonl, audioSessionsJson, metadataJson } = body

  if (!date) {
    return NextResponse.json({ success: false, error: 'date 필드 필수' }, { status: 400 })
  }

  const config = { clientId, clientSecret, refreshToken, rootFolderId }
  const [year, month, day] = date.split('-')
  const filesUploaded: string[] = []

  try {
    // 1. Daily Markdown → 00-inbox/daily-capture/YYYY/MM/YYYY-MM-DD.md
    const mdPath = `00-inbox/daily-capture/${year}/${month}/${date}.md`
    await upsertTextFile(config, mdPath, markdownContent)
    filesUploaded.push(mdPath)

    // 2. Events JSONL
    const jsonlPath = `raw-data/${year}/${month}/${day}/events.jsonl`
    await upsertTextFile(config, jsonlPath, eventsJsonl)
    filesUploaded.push(jsonlPath)

    // 3. Audio Sessions
    const audioPath = `raw-data/${year}/${month}/${day}/audio-sessions.json`
    await upsertTextFile(config, audioPath, audioSessionsJson)
    filesUploaded.push(audioPath)

    // 4. Metadata
    const metaPath = `raw-data/${year}/${month}/${day}/metadata.json`
    await upsertTextFile(config, metaPath, metadataJson)
    filesUploaded.push(metaPath)

    // 5. Sync log
    const syncEntry = `- ${new Date().toISOString()} | ${date} | files: ${filesUploaded.length}`
    await appendTextFile(config, '90-system/sync-log.md', syncEntry)

    return NextResponse.json({ success: true, filesUploaded, syncedAt: new Date().toISOString() })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)

    try {
      const errorEntry = `- ${new Date().toISOString()} | ${date} | ERROR: ${message}`
      await appendTextFile(config, '90-system/error-log.md', errorEntry)
    } catch {
      // silent
    }

    return NextResponse.json({ success: false, error: message, filesUploaded }, { status: 500 })
  }
}
