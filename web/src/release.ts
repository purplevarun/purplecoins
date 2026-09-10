export const REPOSITORY = 'purplevarun/purplecoins'
export const REPOSITORY_URL = `https://github.com/${REPOSITORY}`
export const RELEASE_API = `https://api.github.com/repos/${REPOSITORY}/releases/latest`

export type Release = {
  version: string
  publishedAt: string
  name: string
  size: number
  downloadUrl: string
  notesUrl: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isApkAsset(value: unknown): value is Record<string, unknown> & {
  name: string
  size: number
  browser_download_url: string
} {
  if (
    !isRecord(value) ||
    value.state !== 'uploaded' ||
    typeof value.name !== 'string' ||
    !value.name.toLowerCase().endsWith('.apk') ||
    typeof value.size !== 'number' ||
    !Number.isSafeInteger(value.size) ||
    value.size <= 0 ||
    typeof value.browser_download_url !== 'string'
  ) {
    return false
  }

  try {
    const url = new URL(value.browser_download_url)
    return (
      url.origin === 'https://github.com' &&
      url.username === '' &&
      url.password === '' &&
      url.search === '' &&
      url.hash === '' &&
      url.pathname.startsWith(`/${REPOSITORY}/releases/download/`) &&
      url.pathname.endsWith(`/${encodeURIComponent(value.name)}`)
    )
  } catch {
    return false
  }
}

export function parseRelease(value: unknown): Release {
  if (
    !isRecord(value) ||
    value.draft !== false ||
    value.prerelease !== false ||
    typeof value.tag_name !== 'string' ||
    value.tag_name.trim() === '' ||
    typeof value.published_at !== 'string' ||
    !Number.isFinite(Date.parse(value.published_at)) ||
    !Array.isArray(value.assets)
  ) {
    throw new Error('The latest stable release could not be read.')
  }

  const assets = value.assets.filter(isApkAsset)
  const asset =
    assets.find((candidate) => /(?:^|[-_.])universal(?:[-_.]|$)/i.test(candidate.name)) ??
    (assets.length === 1 ? assets[0] : undefined)

  if (!asset) {
    throw new Error('The latest release does not have an unambiguous Android APK.')
  }

  return {
    version: value.tag_name.replace(/^v/, ''),
    publishedAt: value.published_at,
    name: asset.name,
    size: asset.size,
    downloadUrl: asset.browser_download_url,
    notesUrl: `${REPOSITORY_URL}/releases/tag/${encodeURIComponent(value.tag_name)}`,
  }
}

export async function fetchLatestRelease(options: RequestInit = {}): Promise<Release> {
  const response = await fetch(RELEASE_API, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`GitHub release request failed (${response.status}).`)
  }

  return parseRelease(await response.json())
}
