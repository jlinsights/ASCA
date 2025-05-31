// Jest 테스트 환경 설정 파일

import '@testing-library/jest-dom'

// TextEncoder/TextDecoder polyfill for Node.js
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util')
  global.TextEncoder = TextEncoder
  global.TextDecoder = TextDecoder
}

// IntersectionObserver Mock
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// ResizeObserver Mock
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// matchMedia Mock
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// scrollTo Mock
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: jest.fn(),
})

// getComputedStyle Mock
Object.defineProperty(window, 'getComputedStyle', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    getPropertyValue: jest.fn(),
  })),
})

// localStorage Mock
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// sessionStorage Mock
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
})

// 각 테스트 전에 모든 mocks 초기화
beforeEach(() => {
  jest.clearAllMocks()
}) 