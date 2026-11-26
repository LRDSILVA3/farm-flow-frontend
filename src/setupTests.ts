import '@testing-library/jest-dom';

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof window !== 'undefined') {
  (window as any).ResizeObserver = (window as any).ResizeObserver || ResizeObserverMock;
}
(global as any).ResizeObserver = (global as any).ResizeObserver || ResizeObserverMock;
