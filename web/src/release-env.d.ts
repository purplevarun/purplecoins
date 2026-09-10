import type { Release } from './release'

declare global {
  const __BUILD_RELEASE__: Release
}
