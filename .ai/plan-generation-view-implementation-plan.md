# Plan implementacji widoku generowania planu

## 1. Przegląd
Widok generowania planu służy do monitorowania procesu generowania planu podróży przez AI na podstawie notatki użytkownika. Zapewnia informacje o postępie generowania, wyświetla komunikaty statusu i umożliwia anulowanie procesu lub pozostawienie go w tle. Po zakończeniu generowania użytkownik jest automatycznie przekierowywany do wygenerowanego planu.

## 2. Routing widoku
- Ścieżka: `/notes/[id]/generate-plan`
- Parametry URL:
  - `id`: UUID notatki, dla której generowany jest plan

## 3. Struktura komponentów
```
PlanGenerationPage
├── GenerationProgress
│   ├── ProgressBar
│   └── ProgressPercentage
├── GenerationStatus
│   ├── StatusMessage
│   ├── ErrorDisplay
│   └── CancelButton
└── BackgroundModeToggle
```

## 4. Szczegóły komponentów

### PlanGenerationPage
- Opis komponentu: Główny kontener widoku generowania planu
- Główne elementy:
  - Layout z nagłówkiem
  - Komponenty postępu i statusu
  - Obsługa SSE (Server-Sent Events) dla aktualizacji statusu
- Obsługiwane interakcje:
  - Inicjalizacja generowania planu
  - Nasłuchiwanie na aktualizacje statusu
  - Przekierowanie po zakończeniu
- Typy:
  - `PlanGenerationPageProps`
  - `GenerationState`
- Propsy: brak (komponent na poziomie strony)

### GenerationProgress
- Opis komponentu: Wizualizacja postępu generowania
- Główne elementy:
  - Pasek postępu
  - Procentowy wskaźnik ukończenia
- Obsługiwane interakcje:
  - Aktualizacja postępu w czasie rzeczywistym
- Typy:
  - `GenerationProgressProps`
- Propsy:
  - `progress: number`
  - `estimatedTimeLeft: number`

### GenerationStatus
- Opis komponentu: Wyświetlanie aktualnego statusu i błędów
- Główne elementy:
  - Komunikat statusu
  - Wyświetlanie błędów
  - Przycisk anulowania
- Obsługiwane interakcje:
  - Anulowanie generowania
  - Wyświetlanie komunikatów błędów
- Typy:
  - `GenerationStatusProps`
  - `GenerationError`
- Propsy:
  - `status: GenerationStatus`
  - `error?: GenerationError`
  - `onCancel: () => void`

### BackgroundModeToggle
- Opis komponentu: Przełącznik trybu generowania w tle
- Główne elementy:
  - Przełącznik (Switch)
  - Tekst informacyjny
- Obsługiwane interakcje:
  - Włączanie/wyłączanie trybu tła
- Typy:
  - `BackgroundModeToggleProps`
- Propsy:
  - `enabled: boolean`
  - `onToggle: (enabled: boolean) => void`

## 5. Typy

```typescript
interface GenerationState {
  status: 'initializing' | 'generating' | 'completed' | 'error' | 'cancelled';
  progress: number;
  estimatedTimeLeft: number;
  error?: GenerationError;
}

interface GenerationError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

interface PlanGenerationPageProps {
  noteId: string;
}

interface GenerationProgressProps {
  progress: number;
  estimatedTimeLeft: number;
}

interface GenerationStatusProps {
  status: GenerationState['status'];
  error?: GenerationError;
  onCancel: () => void;
}

interface BackgroundModeToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}
```

## 6. Zarządzanie stanem

### Custom Hooks

```typescript
const useGenerationProgress = (noteId: string) => {
  // Zarządzanie stanem generowania
  // Obsługa SSE
  // Obsługa błędów
  // Zarządzanie timeoutami
}

const useBackgroundMode = () => {
  // Zarządzanie trybem tła
  // Persystencja stanu
  // Obsługa powiadomień
}
```

## 7. Integracja API

### Endpointy
- `POST /notes/{noteId}/plans` - inicjalizacja generowania planu
- SSE endpoint dla aktualizacji statusu

### Typy żądań i odpowiedzi
- Request: brak body
- Response: `PlanResponseDTO`
- SSE Events:
  ```typescript
  interface GenerationEvent {
    type: 'progress' | 'completed' | 'error';
    data: {
      progress?: number;
      estimatedTimeLeft?: number;
      error?: GenerationError;
      plan?: PlanResponseDTO;
    };
  }
  ```

## 8. Interakcje użytkownika

1. Inicjalizacja generowania
   - Automatyczne rozpoczęcie po załadowaniu strony
   - Wyświetlenie szacowanego czasu generowania

2. Monitorowanie postępu
   - Obserwacja paska postępu
   - Odczyt komunikatów statusu
   - Szacowany czas pozostały

3. Zarządzanie procesem
   - Anulowanie generowania
   - Przełączanie trybu tła
   - Reakcja na błędy

4. Zakończenie procesu
   - Automatyczne przekierowanie do planu
   - Obsługa błędów generowania

## 9. Warunki i walidacja

### Warunki początkowe
- Notatka musi istnieć
- Użytkownik musi być właścicielem notatki
- Notatka nie może być wersją roboczą
- Użytkownik nie może przekroczyć limitu generowań (2 dziennie)

### Warunki podczas generowania
- Maksymalny czas generowania: 3 minuty
- Możliwość anulowania w dowolnym momencie
- Zachowanie postępu w przypadku przełączenia w tło

## 10. Obsługa błędów

### Scenariusze błędów
1. Błędy inicjalizacji
   - Nieznaleziona notatka
   - Brak uprawnień
   - Przekroczony limit dzienny

2. Błędy generowania
   - Timeout (przekroczenie 3 minut)
   - Błąd AI
   - Przerwane połączenie SSE

3. Błędy przekierowania
   - Nieudane przekierowanie do planu
   - Błąd zapisywania planu

### Obsługa błędów
- Wyświetlanie komunikatów błędów
- Możliwość ponowienia próby
- Przekierowanie do listy notatek w przypadku krytycznych błędów

## 11. Kroki implementacji

1. Konfiguracja routingu i podstawowej struktury
   - Utworzenie komponentu strony
   - Konfiguracja ścieżki w Astro
   - Podstawowy layout

2. Implementacja komponentów UI
   - Pasek postępu
   - Komunikaty statusu
   - Przycisk anulowania
   - Przełącznik trybu tła

3. Implementacja integracji z API
   - Konfiguracja klienta SSE
   - Obsługa endpointu generowania
   - Mapowanie odpowiedzi na stan

4. Implementacja logiki generowania
   - Hook useGenerationProgress
   - Obsługa aktualizacji statusu
   - Zarządzanie timeoutami

5. Implementacja trybu tła
   - Hook useBackgroundMode
   - Obsługa powiadomień
   - Persystencja stanu

6. Implementacja przekierowań
   - Logika przekierowania po zakończeniu
   - Obsługa anulowania
   - Obsługa błędów

7. Implementacja obsługi błędów
   - Komponenty komunikatów błędów
   - Obsługa ponownych prób
   - Logika fallbacku

8. Optymalizacja i testy
   - Testy komponentów
   - Testy integracyjne
   - Optymalizacja wydajności
   - Testy dostępności 