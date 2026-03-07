let resetDone = false
const RESET_MARKER_KEY = 'mira-cache-reset-version'
const RESET_VERSION = '2026-03-07-v1'
const LEGACY_LOCAL_STORAGE_KEYS: string[] = []

const clearBrowserCaches = (): void => {
  if (typeof window === 'undefined' || typeof window.caches === 'undefined') {
    return
  }

  void window.caches.keys().then((cacheNames) => {
    cacheNames.forEach((cacheName) => {
      void window.caches.delete(cacheName)
    })
  })
}

const clearLegacyStorageIfNeeded = (): void => {
  if (typeof window === 'undefined') {
    return
  }

  for (const key of LEGACY_LOCAL_STORAGE_KEYS) {
    window.localStorage.removeItem(key)
  }
}

export const resetAppCacheIfNeeded = (): void => {
  if (typeof window === 'undefined') {
    return
  }

  if (resetDone) {
    return
  }

  resetDone = true
  const appliedVersion = window.localStorage.getItem(RESET_MARKER_KEY)
  if (appliedVersion === RESET_VERSION) {
    return
  }

  clearLegacyStorageIfNeeded()
  clearBrowserCaches()
  window.localStorage.setItem(RESET_MARKER_KEY, RESET_VERSION)
}
