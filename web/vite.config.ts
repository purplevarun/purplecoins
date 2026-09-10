import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fetchLatestRelease, parseRelease } from './src/release.js'

export default defineConfig(async () => {
  const headers: Record<string, string> = {}
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  }
  const release = process.env.GITHUB_RELEASE_JSON
    ? parseRelease(JSON.parse(process.env.GITHUB_RELEASE_JSON))
    : await fetchLatestRelease({
        headers,
        signal: AbortSignal.timeout(15000),
      })

  return {
    plugins: [react()],
    base: '/purplecoins/',
    define: { __BUILD_RELEASE__: JSON.stringify(release) },
    build: {
      rolldownOptions: {
        input: {
          main: fileURLToPath(new URL('./index.html', import.meta.url)),
          notFound: fileURLToPath(new URL('./404.html', import.meta.url)),
        },
      },
    },
  }
})
