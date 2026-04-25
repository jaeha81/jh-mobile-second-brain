import type { GithubFilePayload } from './types'

interface GithubConfig {
  token: string
  owner: string
  repo: string
  branch: string
}

function toBase64(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'utf-8').toString('base64')
  }
  return btoa(unescape(encodeURIComponent(str)))
}

async function getFileSHA(
  config: GithubConfig,
  path: string
): Promise<string | null> {
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}?ref=${config.branch}`
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${config.token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`SHA fetch failed: ${res.status}`)
  const data = await res.json()
  return data.sha ?? null
}

export async function upsertFile(
  config: GithubConfig,
  path: string,
  content: string,
  commitMessage: string
): Promise<void> {
  const sha = await getFileSHA(config, path)
  const payload: GithubFilePayload = {
    path,
    content: toBase64(content),
    message: commitMessage,
    ...(sha ? { sha } : {}),
  }

  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${config.token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: payload.message,
      content: payload.content,
      branch: config.branch,
      ...(sha ? { sha } : {}),
    }),
  })

  if (res.status === 409) {
    // 충돌 — conflict-copy 생성
    const conflictPath = path.replace(/(\.\w+)$/, `-conflict-${Date.now()}$1`)
    await upsertFile(config, conflictPath, content, `[conflict-copy] ${commitMessage}`)
    return
  }

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`GitHub upsert failed ${res.status}: ${body}`)
  }
}

export async function uploadBinaryFile(
  config: GithubConfig,
  path: string,
  base64Content: string,
  commitMessage: string
): Promise<void> {
  const sha = await getFileSHA(config, path)
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${config.token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: commitMessage,
      content: base64Content,
      branch: config.branch,
      ...(sha ? { sha } : {}),
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`GitHub binary upload failed ${res.status}: ${body}`)
  }
}

export async function checkRepoAccess(config: GithubConfig): Promise<boolean> {
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}`
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${config.token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  })
  return res.ok
}

export async function appendToFile(
  config: GithubConfig,
  path: string,
  appendContent: string,
  commitMessage: string
): Promise<void> {
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}?ref=${config.branch}`
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${config.token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  })

  let existingContent = ''
  let sha: string | undefined

  if (res.ok) {
    const data = await res.json()
    existingContent = Buffer.from(data.content, 'base64').toString('utf-8')
    sha = data.sha
  }

  const newContent = existingContent
    ? existingContent.trimEnd() + '\n\n' + appendContent
    : appendContent

  await upsertFile(config, path, newContent, commitMessage)
}
