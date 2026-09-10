import {
  ArrowUpRight,
  ChevronDown,
  Download,
  GitFork,
  RefreshCw,
  ShieldCheck,
  Smartphone,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { fetchLatestRelease, REPOSITORY_URL } from './release'

function App() {
  const [release, setRelease] = useState(__BUILD_RELEASE__)
  const [releaseStatus, setReleaseStatus] = useState<'checking' | 'current' | 'cached'>('checking')
  const [attempt, setAttempt] = useState(0)
  const installGuide = useRef<HTMLDetailsElement>(null)
  const iconUrl = `${import.meta.env.BASE_URL}app-icon.png`

  useEffect(() => {
    const controller = new AbortController()
    let active = true
    const timeout = window.setTimeout(() => controller.abort(), 8000)

    fetchLatestRelease({ signal: controller.signal })
      .then((latest) => {
        if (active) {
          setRelease(latest)
          setReleaseStatus('current')
        }
      })
      .catch(() => {
        if (active) setReleaseStatus('cached')
      })
      .finally(() => window.clearTimeout(timeout))

    return () => {
      active = false
      controller.abort()
      window.clearTimeout(timeout)
    }
  }, [attempt])

  const publishedDate = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(release.publishedAt))

  return (
    <div className="page">
      <a className="skip-link" href="#download">
        Skip to download
      </a>
      <header className="site-header">
        <a className="wordmark" href={import.meta.env.BASE_URL} aria-label="Purplecoins home">
          <img src={iconUrl} width="32" height="32" alt="" />
          purplecoins
        </a>
        <a className="source-link" href={REPOSITORY_URL} target="_blank" rel="noreferrer">
          <GitFork size={16} aria-hidden="true" />
          Source code
          <ArrowUpRight size={15} aria-hidden="true" />
        </a>
      </header>

      <main id="download">
        <section className="download-section" aria-labelledby="app-title">
          <div
            className="release-status"
            data-state={releaseStatus}
            role="status"
            aria-live="polite"
          >
            <span className="status-dot" aria-hidden="true" />
            {releaseStatus === 'current'
              ? 'Latest stable release'
              : releaseStatus === 'checking'
                ? 'Checking the latest release'
                : 'Last checked release'}
            {releaseStatus === 'cached' && (
              <button
                className="retry-button"
                type="button"
                aria-label="Check for the latest release again"
                title="Check for the latest release again"
                onClick={() => {
                  setReleaseStatus('checking')
                  setAttempt((previous) => previous + 1)
                }}
              >
                <RefreshCw size={15} aria-hidden="true" />
              </button>
            )}
          </div>

          <img
            className="app-icon"
            src={iconUrl}
            width="128"
            height="128"
            alt="Purplecoins app icon"
            fetchPriority="high"
          />
          <h1 id="app-title">
            Purplecoins<span className="title-dot">.</span>
          </h1>
          <p className="app-subtitle">Your money. Your everyday. Your space.</p>

          <div className="download-actions">
            <a
              className="download-button"
              href={release.downloadUrl}
              download={release.name}
              onClick={() => {
                if (installGuide.current) installGuide.current.open = true
              }}
            >
              <Download size={21} aria-hidden="true" />
              Download APK
              <span className="button-platform">Android</span>
            </a>
            <a className="release-link" href={release.notesUrl} target="_blank" rel="noreferrer">
              Release notes <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          </div>

          <p className="download-origin">
            <ShieldCheck size={15} aria-hidden="true" />
            Direct from the official GitHub release
          </p>
          {releaseStatus === 'cached' && (
            <p className="release-warning">
              Can't check for updates right now. Showing the last fetched release.
            </p>
          )}
        </section>

        <dl className="release-details" aria-label="Release details">
          <div>
            <dt>Version</dt>
            <dd>{release.version}</dd>
          </div>
          <div>
            <dt>Download size</dt>
            <dd>{(release.size / 1_000_000).toFixed(1)} MB</dd>
          </div>
          <div>
            <dt>Released</dt>
            <dd>
              <time dateTime={release.publishedAt}>{publishedDate}</time>
            </dd>
          </div>
        </dl>

        <section className="installation" aria-label="Android installation help">
          <details className="help-section" ref={installGuide}>
            <summary>
              <span>
                <Smartphone size={20} aria-hidden="true" /> First time installing?
              </span>
              <ChevronDown className="disclosure-icon" size={19} aria-hidden="true" />
            </summary>
            <div className="help-content">
              <ol className="install-steps">
                <li>
                  <h2>Open the downloaded APK</h2>
                  <p>Find it in your browser downloads or the Files app on your Android phone.</p>
                </li>
                <li>
                  <h2>Allow this source, if Android asks</h2>
                  <p>
                    Open Settings from the prompt and enable <strong>Allow from this source</strong>{' '}
                    for the browser or Files app you used. Wording varies by phone.
                  </p>
                </li>
                <li>
                  <h2>Return to the APK and tap Install</h2>
                  <p>
                    Android will ask you to confirm. You can turn off{' '}
                    <strong>Allow from this source</strong> after installation.
                  </p>
                </li>
              </ol>
              <div className="security-note">
                <ShieldCheck size={20} aria-hidden="true" />
                <p>
                  Keep Play Protect enabled. If it blocks the APK, stop and review the warning. A
                  website cannot approve installation for you, and managed phones may not allow it.
                </p>
              </div>
            </div>
          </details>
          <details className="help-section">
            <summary>
              <span>
                <RefreshCw size={19} aria-hidden="true" /> Already have Purplecoins?
              </span>
              <ChevronDown className="disclosure-icon" size={19} aria-hidden="true" />
            </summary>
            <div className="help-content update-help">
              <p>
                Export a backup in Purplecoins before updating. Download the new APK and install it
                over the existing app.
              </p>
              <p>
                Android requires a compatible signing certificate and version. If it reports a
                signing mismatch, stop rather than uninstalling: uninstalling can delete your local
                data.
              </p>
            </div>
          </details>
        </section>
      </main>

      <footer className="site-footer">
        <span>
          From{' '}
          <a href="https://github.com/purplevarun" target="_blank" rel="noreferrer">
            purplevarun
          </a>
        </span>
        <a href={`${REPOSITORY_URL}/issues`} target="_blank" rel="noreferrer">
          Report an issue <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </footer>
    </div>
  )
}

export default App
