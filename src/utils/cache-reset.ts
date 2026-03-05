const CACHE_VERSION_KEY = 'mira-cache-version'
const CACHE_VERSION = '2026-03-06-01'

const removeMiraLocalStorageKeys = (): void => {
  if (typeof window === 'undefined') {
    return
  }

  const keysToRemove: string[] = []
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index)
    if (key?.startsWith('mira-')) {
      keysToRemove.push(key)
    }
  }

  keysToRemove.forEach((key) => window.localStorage.removeItem(key))
}

const removeMiraSessionStorageKeys = (): void => {
  if (typeof window === 'undefined') {
    return
  }

  const keysToRemove: string[] = []
  for (let index = 0; index < window.sessionStorage.length; index += 1) {
    const key = window.sessionStorage.key(index)
    if (key?.startsWith('mira-')) {
      keysToRemove.push(key)
    }
  }

  keysToRemove.forEach((key) => window.sessionStorage.removeItem(key))
}

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

export const resetAppCacheIfNeeded = (): void => {
  if (typeof window === 'undefined') {
    return
  }

  const currentVersion = window.localStorage.getItem(CACHE_VERSION_KEY)
  if (currentVersion === CACHE_VERSION) {
    return
  }

  removeMiraLocalStorageKeys()
  removeMiraSessionStorageKeys()
  clearBrowserCaches()
  window.localStorage.setItem(CACHE_VERSION_KEY, CACHE_VERSION)
}

