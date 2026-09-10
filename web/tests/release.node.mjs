import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fetchLatestRelease, parseRelease, RELEASE_API } from '../src/release.ts'

const asset = (name = 'com.purple.coins_2026.8.29.apk') => ({
  name,
  state: 'uploaded',
  size: 105355561,
  browser_download_url: `https://github.com/purplevarun/purplecoins/releases/download/v2026.8.29/${name}`,
})

const release = (overrides = {}) => ({
  tag_name: 'v2026.8.29',
  draft: false,
  prerelease: false,
  published_at: '2026-08-29T10:00:00Z',
  assets: [asset()],
  ...overrides,
})

test('resolves the versioned APK to a direct download, not a release page', () => {
  const result = parseRelease(release())
  assert.equal(result.version, '2026.8.29')
  assert.equal(result.downloadUrl, asset().browser_download_url)
  assert.equal(result.name, asset().name)
  assert.equal(result.size, asset().size)
  assert.equal(
    result.notesUrl,
    'https://github.com/purplevarun/purplecoins/releases/tag/v2026.8.29',
  )
})

test('selects the APK alongside non-APK release assets', () => {
  const result = parseRelease(release({ assets: [asset('checksums.txt'), asset()] }))
  assert.equal(result.name, asset().name)
})

test('prefers a universal APK when architecture-specific builds are present', () => {
  const result = parseRelease(
    release({
      assets: [asset('app-arm64.apk'), asset('app-universal.apk'), asset('app-x86.apk')],
    }),
  )
  assert.equal(result.name, 'app-universal.apk')
})

test('does not guess a device architecture when multiple APKs are ambiguous', () => {
  assert.throws(
    () =>
      parseRelease(
        release({
          assets: [asset('app-arm64.apk'), asset('app-x86.apk')],
        }),
      ),
    /unambiguous/,
  )
})

test('rejects missing, unfinished, and empty APKs', () => {
  for (const assets of [
    [],
    [asset('app.aab')],
    [{ ...asset(), state: 'new' }],
    [{ ...asset(), size: 0 }],
  ]) {
    assert.throws(() => parseRelease(release({ assets })), /APK/)
  }
})

test('rejects malformed release data, drafts, and prereleases', () => {
  for (const value of [
    null,
    {},
    release({ draft: true }),
    release({ prerelease: true }),
    release({ published_at: 'invalid' }),
  ]) {
    assert.throws(() => parseRelease(value), /stable release/)
  }
})

test('rejects asset links outside this repository or with mismatched filenames', () => {
  for (const url of [
    'https://example.com/app.apk',
    'https://github.com/another/project/releases/download/v1/app.apk',
    'https://github.com/purplevarun/purplecoins/releases/download/v1/other.apk',
    'javascript:alert(1)',
  ]) {
    assert.throws(
      () =>
        parseRelease(
          release({
            assets: [{ ...asset(), browser_download_url: url }],
          }),
        ),
      /APK/,
    )
  }
})

test('fetches the latest stable release without browser credentials', async (context) => {
  context.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, RELEASE_API)
    assert.equal(options.headers.Accept, 'application/vnd.github+json')
    assert.equal(options.headers.Authorization, undefined)
    return Response.json(release())
  })
  assert.equal((await fetchLatestRelease()).version, '2026.8.29')
})

test('reports API failures instead of returning a broken download URL', async (context) => {
  context.mock.method(globalThis, 'fetch', async () => new Response(null, { status: 403 }))
  await assert.rejects(fetchLatestRelease(), /403/)
})
