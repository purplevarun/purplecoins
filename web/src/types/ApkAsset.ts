type ApkAsset = Record<string, unknown> & {
  name: string
  size: number
  browser_download_url: string
}

export type { ApkAsset as default }
