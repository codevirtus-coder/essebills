const TOKEN_KEY = 'auth_token'
const AUTH_CHANGE_EVENT = 'auth-change'

function notifyAuthChanged(): void {
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT))
}

export function saveAuthToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token)
  notifyAuthChanged()
}

export function getAuthToken(): string | null {
  return window.localStorage.getItem(TOKEN_KEY)
}

export function clearAuthToken(): void {
  window.localStorage.removeItem(TOKEN_KEY)
  notifyAuthChanged()
}

export function isAuthenticated(): boolean {
  return Boolean(getAuthToken())
}

export function subscribeToAuthChanges(onChange: () => void): () => void {
  const handleStorageEvent = (event: StorageEvent) => {
    if (event.key === TOKEN_KEY) {
      onChange()
    }
  }

  window.addEventListener('storage', handleStorageEvent)
  window.addEventListener(AUTH_CHANGE_EVENT, onChange)

  return () => {
    window.removeEventListener('storage', handleStorageEvent)
    window.removeEventListener(AUTH_CHANGE_EVENT, onChange)
  }
}
