import { NextRequest, NextResponse } from 'next/server'
import { upsertFile, appendToFile } from '@/lib/githubClient'
import type { SyncDailyPayload } from '@/lib/types'

export async function POST(req: NextRequest) {
  const token = process.env.GITHUB_TOKEN
  const owner = process.env.GITHUB_OWNER
  const repo = process.env.GITHUB_REPO
  const branch = process.env.GITHUB_BRANCH ?? 'main'
  const basePath = process.env.GITHUB_BASE_PATH ?? 'obsidian-vault'

  if (!token || !owner || !repo) {
    return NextResponse.json({ success: false, error: 'GitHub 환경변수 미설정' }, { status: 500 })
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

  const config = { token, owner, repo, branch }
  const [year, month, day] = date.split('-')

  const filesUploaded: string[] = []

  try {
    // 1. Daily Markdown
    const mdPath = `${basePath}/00-inbox/daily-capture/${year}/${month}/${date}.md`
    await upsertFile(config, mdPath, markdownContent, `capture: daily note ${date}`)
    filesUploaded.push(mdPath)

    // 2. Events JSONL
    const jsonlPath = `raw-data/${year}/${month}/${day}/events.jsonl`
    await upsertFile(config, jsonlPath, eventsJsonl, `capture: events ${date}`)
    filesUploaded.push(jsonlPath)

    // 3. Audio Sessions
    const audioPath = `raw-data/${year}/${month}/${day}/audio-sessions.json`
    await upsertFile(config, audioPath, audioSessionsJson, `capture: audio sessions ${date}`)
    filesUploaded.push(audioPath)

    // 4. Metadata
    const metaPath = `raw-data/${year}/${month}/${day}/metadata.json`
    await upsertFile(config, metaPath, metadataJson, `capture: metadata ${date}`)
    filesUploaded.push(metaPath)

    // 5. Sync log append
    const syncLogPath = `${basePath}/90-system/sync-log.md`
    const syncEntry = `- ${new Date().toISOString()} | ${date} | files: ${filesUploaded.length}`
    await appendToFile(config, syncLogPath, syncEntry, `sync-log: ${date}`)

    return NextResponse.json({ success: true, filesUploaded, syncedAt: new Date().toISOString() })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)

    // error-log append (best effort)
    try {
      const errorLogPath = `${basePath}/90-system/error-log.md`
      const errorEntry = `- ${new Date().toISOString()} | ${date} | ERROR: ${message}`
      await appendToFile(config, errorLogPath, errorEntry, `error-log: ${date}`)
    } catch {
      // silent
    }

    return NextResponse.json({ success: false, error: message, filesUploaded }, { status: 500 })
  }
}
