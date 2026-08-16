import '@testing-library/jest-dom'

// Polyfill in-memory localStorage for jsdom / Node 26 compatibility
class LocalStorageMock {
  constructor() {
    this.store = {}
  }
  clear() {
    this.store = {}
  }
  getItem(key) {
    return this.store[key] || null
  }
  setItem(key, value) {
    this.store[key] = String(value)
  }
  removeItem(key) {
    delete this.store[key]
  }
  get length() {
    return Object.keys(this.store).length
  }
  key(index) {
    const keys = Object.keys(this.store)
    return keys[index] || null
  }
}

const mockStorage = new LocalStorageMock()
Object.defineProperty(globalThis, 'localStorage', {
  value: mockStorage,
  writable: true,
  configurable: true,
})
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: mockStorage,
    writable: true,
    configurable: true,
  })
}

