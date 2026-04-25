import { NextRequest, NextResponse } from 'next/server'
import { upsertFile, appendToFile } from '@/lib/githubClient'
import type { SyncDailyPayload } from '@/lib/types'

// sync-daily와 동일한 로직 — 실패한 항목 재시도용
export async function POST(req: NextRequest) {
  const token = process.env.GITHUB_TOKEN
  const owner = process.env.GITHUB_OWNER
  const repo = process.env.GITHUB_REPO
  const branch = process.env.GITHUB_BRANCH ?? 'main'
  const basePath = process.env.GITHUB_BASE_PATH ?? 'obsidian-vault'

  if (!token || !owner || !repo) {
    return NextResponse.json({ success: false, error: 'GitHub 환경변수 미설정' }, { status: 500 })
  }

  let body: SyncDailyPayload & { retryId?: string }
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
    const mdPath = `${basePath}/00-inbox/daily-capture/${year}/${month}/${date}.md`
    await upsertFile(config, mdPath, markdownContent, `[retry] capture: daily note ${date}`)
    filesUploaded.push(mdPath)

    const jsonlPath = `raw-data/${year}/${month}/${day}/events.jsonl`
    await upsertFile(config, jsonlPath, eventsJsonl, `[retry] capture: events ${date}`)
    filesUploaded.push(jsonlPath)

    const audioPath = `raw-data/${year}/${month}/${day}/audio-sessions.json`
    await upsertFile(config, audioPath, audioSessionsJson, `[retry] capture: audio sessions ${date}`)
    filesUploaded.push(audioPath)

    const metaPath = `raw-data/${year}/${month}/${day}/metadata.json`
    await upsertFile(config, metaPath, metadataJson, `[retry] capture: metadata ${date}`)
    filesUploaded.push(metaPath)

    const syncLogPath = `${basePath}/90-system/sync-log.md`
    await appendToFile(config, syncLogPath,
      `- ${new Date().toISOString()} | ${date} | [retry] files: ${filesUploaded.length}`,
      `sync-log: retry ${date}`
    )

    return NextResponse.json({ success: true, filesUploaded, syncedAt: new Date().toISOString() })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, error: message, filesUploaded }, { status: 500 })
  }
}
