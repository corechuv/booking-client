type BodyStyleSnapshot = {
  overflow: string
  position: string
  top: string
  left: string
  right: string
  width: string
}

let lockCount = 0
let scrollY = 0
let snapshot: BodyStyleSnapshot | null = null

const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined'

export const lockBodyScroll = () => {
  if (!isBrowser()) {
    return
  }

  lockCount += 1
  if (lockCount > 1) {
    return
  }

  const { body } = document
  snapshot = {
    overflow: body.style.overflow,
    position: body.style.position,
    top: body.style.top,
    left: body.style.left,
    right: body.style.right,
    width: body.style.width,
  }

  scrollY = window.scrollY
  body.style.overflow = 'hidden'
  body.style.position = 'fixed'
  body.style.top = `-${scrollY}px`
  body.style.left = '0'
  body.style.right = '0'
  body.style.width = '100%'
}

export const unlockBodyScroll = () => {
  if (!isBrowser() || lockCount === 0) {
    return
  }

  lockCount -= 1
  if (lockCount > 0) {
    return
  }

  const { body } = document
  if (snapshot) {
    body.style.overflow = snapshot.overflow
    body.style.position = snapshot.position
    body.style.top = snapshot.top
    body.style.left = snapshot.left
    body.style.right = snapshot.right
    body.style.width = snapshot.width
  } else {
    body.style.overflow = ''
    body.style.position = ''
    body.style.top = ''
    body.style.left = ''
    body.style.right = ''
    body.style.width = ''
  }

  window.scrollTo(0, scrollY)
  snapshot = null
}
