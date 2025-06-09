import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from '@/test/handlers';

// Konfiguracja serwera MSW
export const server = setupServer(...handlers);

// Uruchom serwer przed wszystkimi testami
beforeAll(() => {
  // Konfiguracja MSW
  server.listen({ onUnhandledRequest: 'error' });
});

// Resetuj handlery po każdym teście
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

// Zamknij serwer po wszystkich testach
afterAll(() => server.close());

// Konfiguracja globalnych zmiennych dla testów
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Wycisz ostrzeżenia React dla testów
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      /Warning: ReactDOM.render is no longer supported in React 18/.test(args[0]) ||
      /Warning: useLayoutEffect does nothing on the server/.test(args[0])
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
}); 