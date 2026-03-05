let resetDone = false

const clearLocalStorage = (): void => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.clear()
}

const clearSessionStorage = (): void => {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.clear()
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

  if (resetDone) {
    return
  }

  resetDone = true
  clearLocalStorage()
  clearSessionStorage()
  clearBrowserCaches()
}
