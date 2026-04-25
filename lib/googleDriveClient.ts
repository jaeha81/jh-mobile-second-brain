import { google } from 'googleapis'
import { Readable } from 'stream'

interface DriveConfig {
  serviceAccountJson: string
  rootFolderId: string
}

function getDriveClient(serviceAccountJson: string) {
  const credentials = JSON.parse(serviceAccountJson)
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive'],
  })
  return google.drive({ version: 'v3', auth })
}

async function getOrCreateFolder(
  drive: ReturnType<typeof google.drive>,
  parentId: string,
  name: string
): Promise<string> {
  const res = await drive.files.list({
    q: `name='${name}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id)',
    spaces: 'drive',
  })
  if (res.data.files && res.data.files.length > 0) {
    return res.data.files[0].id!
  }
  const folder = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    },
    fields: 'id',
  })
  return folder.data.id!
}

async function ensureFolderPath(
  drive: ReturnType<typeof google.drive>,
  rootFolderId: string,
  parts: string[]
): Promise<string> {
  let currentId = rootFolderId
  for (const part of parts) {
    currentId = await getOrCreateFolder(drive, currentId, part)
  }
  return currentId
}

async function findFile(
  drive: ReturnType<typeof google.drive>,
  folderId: string,
  fileName: string
): Promise<string | null> {
  const res = await drive.files.list({
    q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
    fields: 'files(id)',
    spaces: 'drive',
  })
  return res.data.files?.[0]?.id ?? null
}

export async function upsertTextFile(config: DriveConfig, filePath: string, content: string): Promise<void> {
  const drive = getDriveClient(config.serviceAccountJson)
  const parts = filePath.split('/')
  const fileName = parts.pop()!
  const folderId = parts.length > 0
    ? await ensureFolderPath(drive, config.rootFolderId, parts)
    : config.rootFolderId

  const existingId = await findFile(drive, folderId, fileName)
  const body = Readable.from([content])

  if (existingId) {
    await drive.files.update({
      fileId: existingId,
      media: { mimeType: 'text/plain; charset=utf-8', body },
    })
  } else {
    await drive.files.create({
      requestBody: { name: fileName, parents: [folderId] },
      media: { mimeType: 'text/plain; charset=utf-8', body },
      fields: 'id',
    })
  }
}

export async function appendTextFile(config: DriveConfig, filePath: string, appendContent: string): Promise<void> {
  const drive = getDriveClient(config.serviceAccountJson)
  const parts = filePath.split('/')
  const fileName = parts.pop()!
  const folderId = parts.length > 0
    ? await ensureFolderPath(drive, config.rootFolderId, parts)
    : config.rootFolderId

  let existingText = ''
  const existingId = await findFile(drive, folderId, fileName)

  if (existingId) {
    const res = await drive.files.get(
      { fileId: existingId, alt: 'media' },
      { responseType: 'text' }
    )
    existingText = typeof res.data === 'string' ? res.data : ''
  }

  const newContent = existingText
    ? existingText.trimEnd() + '\n\n' + appendContent
    : appendContent

  const body = Readable.from([newContent])

  if (existingId) {
    await drive.files.update({
      fileId: existingId,
      media: { mimeType: 'text/plain; charset=utf-8', body },
    })
  } else {
    await drive.files.create({
      requestBody: { name: fileName, parents: [folderId] },
      media: { mimeType: 'text/plain; charset=utf-8', body },
      fields: 'id',
    })
  }
}

export async function uploadBinaryFile(
  config: DriveConfig,
  filePath: string,
  base64Content: string,
  mimeType: string
): Promise<void> {
  const drive = getDriveClient(config.serviceAccountJson)
  const parts = filePath.split('/')
  const fileName = parts.pop()!
  const folderId = parts.length > 0
    ? await ensureFolderPath(drive, config.rootFolderId, parts)
    : config.rootFolderId

  const buffer = Buffer.from(base64Content, 'base64')
  const body = Readable.from(buffer)
  const existingId = await findFile(drive, folderId, fileName)

  if (existingId) {
    await drive.files.update({
      fileId: existingId,
      media: { mimeType, body },
    })
  } else {
    await drive.files.create({
      requestBody: { name: fileName, parents: [folderId] },
      media: { mimeType, body },
      fields: 'id',
    })
  }
}

export async function checkFolderAccess(config: DriveConfig): Promise<boolean> {
  try {
    const drive = getDriveClient(config.serviceAccountJson)
    const res = await drive.files.get({ fileId: config.rootFolderId, fields: 'id' })
    return !!res.data.id
  } catch {
    return false
  }
}
