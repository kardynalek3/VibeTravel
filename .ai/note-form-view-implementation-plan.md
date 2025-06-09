# Plan implementacji widoku formularza notatki

## 1. Przegląd
Widok formularza notatki służy do tworzenia i edycji notatek o planowanych wycieczkach. Umożliwia użytkownikowi wprowadzenie wszystkich niezbędnych informacji, w tym miejsca docelowego, typu segmentu, transportu, długości wycieczki i polecanych atrakcji. Formularz obsługuje walidację w czasie rzeczywistym, automatyczne zapisywanie wersji roboczych oraz ostrzega przed utratą niezapisanych zmian.

## 2. Routing widoku
- Nowa notatka: `/notes/new`
- Edycja notatki: `/notes/[id]/edit`

## 3. Struktura komponentów
```
NoteFormPage
├── NoteFormHeader
├── NoteForm
│   ├── DestinationSearch
│   │   ├── SearchInput
│   │   └── SearchResults
│   ├── SegmentSelect
│   ├── TransportSelect
│   ├── DurationSelect
│   ├── AttractionsTextarea
│   └── FormActions
│       ├── SaveDraftButton
│       └── SaveButton
└── UnsavedChangesDialog
```

## 4. Szczegóły komponentów

### NoteFormPage
- Opis komponentu: Główny kontener widoku formularza notatki
- Główne elementy:
  - Layout z nagłówkiem
  - Formularz notatki
  - Dialog niezapisanych zmian
- Obsługiwane interakcje:
  - Inicjalizacja formularza
  - Obsługa nawigacji
  - Obsługa niezapisanych zmian
- Typy:
  - `NoteFormPageProps`
  - `NoteFormContext`
- Propsy:
  - `noteId?: string` (tylko dla edycji)

### NoteFormHeader
- Opis komponentu: Nagłówek formularza z tytułem i podstawowymi akcjami
- Główne elementy:
  - Tytuł ("Nowa notatka" lub "Edycja notatki")
  - Przycisk powrotu
- Obsługiwane interakcje:
  - Nawigacja powrotna
- Typy:
  - `NoteFormHeaderProps`
- Propsy:
  - `title: string`
  - `onBack: () => void`

### NoteForm
- Opis komponentu: Główny formularz notatki z React Hook Form
- Główne elementy:
  - Form z komponentami pól
  - Przyciski akcji
- Obsługiwane interakcje:
  - Walidacja w czasie rzeczywistym
  - Automatyczne zapisywanie wersji roboczej
  - Zapisywanie formularza
- Obsługiwana walidacja:
  - Wszystkie pola wymagane (oprócz wersji roboczej)
  - Ograniczenia długości tekstu
- Typy:
  - `NoteFormData`
  - `NoteFormProps`
- Propsy:
  - `initialData?: NoteResponseDTO`
  - `onSubmit: (data: NoteCreateDTO) => Promise<void>`
  - `onDraftSave: (data: NoteCreateDTO) => Promise<void>`

### DestinationSearch
- Opis komponentu: Pole wyszukiwania i wyboru destynacji
- Główne elementy:
  - Kontrolowany input z autouzupełnianiem
  - Lista wyników wyszukiwania
  - Obsługa stanu ładowania
- Obsługiwane interakcje:
  - Wyszukiwanie w czasie rzeczywistym
  - Wybór destynacji z listy
  - Czyszczenie wyboru
- Obsługiwana walidacja:
  - Wymagane pole
  - Poprawny identyfikator destynacji
- Typy:
  - `DestinationSearchProps`
  - `DestinationOption`
- Propsy:
  - `value: number`
  - `onChange: (value: number) => void`
  - `error?: string`

### SegmentSelect
- Opis komponentu: Wybór segmentu podróży
- Główne elementy:
  - Select z opcjami segmentów
- Obsługiwane interakcje:
  - Wybór segmentu
- Obsługiwana walidacja:
  - Wymagane pole
  - Wartość z enum SegmentType
- Typy:
  - `SegmentSelectProps`
- Propsy:
  - `value: SegmentType`
  - `onChange: (value: SegmentType) => void`
  - `error?: string`

### TransportSelect
- Opis komponentu: Wybór środka transportu
- Główne elementy:
  - Select z opcjami transportu
- Obsługiwane interakcje:
  - Wybór transportu
- Obsługiwana walidacja:
  - Wymagane pole
  - Wartość z enum TransportType
- Typy:
  - `TransportSelectProps`
- Propsy:
  - `value: TransportType`
  - `onChange: (value: TransportType) => void`
  - `error?: string`

### DurationSelect
- Opis komponentu: Wybór długości wycieczki
- Główne elementy:
  - Input numeryczny lub select
- Obsługiwane interakcje:
  - Wybór liczby dni
- Obsługiwana walidacja:
  - Wymagane pole
  - Zakres 1-5 dni
- Typy:
  - `DurationSelectProps`
- Propsy:
  - `value: number`
  - `onChange: (value: number) => void`
  - `error?: string`

### AttractionsTextarea
- Opis komponentu: Pole tekstowe na opis atrakcji
- Główne elementy:
  - Textarea
  - Licznik znaków
- Obsługiwane interakcje:
  - Wprowadzanie tekstu
  - Aktualizacja licznika znaków
- Obsługiwana walidacja:
  - Wymagane pole
  - Maksymalnie 5000 znaków
- Typy:
  - `AttractionsTextareaProps`
- Propsy:
  - `value: string`
  - `onChange: (value: string) => void`
  - `error?: string`

### FormActions
- Opis komponentu: Przyciski akcji formularza
- Główne elementy:
  - Przycisk zapisz jako wersję roboczą
  - Przycisk zapisz
- Obsługiwane interakcje:
  - Zapisywanie formularza
  - Zapisywanie wersji roboczej
- Typy:
  - `FormActionsProps`
- Propsy:
  - `onSave: () => void`
  - `onSaveDraft: () => void`
  - `isSubmitting: boolean`
  - `isDraft: boolean`

### UnsavedChangesDialog
- Opis komponentu: Dialog ostrzegający przed utratą zmian
- Główne elementy:
  - Modal dialog
  - Przyciski potwierdzenia
- Obsługiwane interakcje:
  - Potwierdzenie opuszczenia strony
  - Anulowanie opuszczenia strony
- Typy:
  - `UnsavedChangesDialogProps`
- Propsy:
  - `isOpen: boolean`
  - `onConfirm: () => void`
  - `onCancel: () => void`

## 5. Typy

```typescript
interface NoteFormData {
  destination_id: number;
  segment: SegmentType;
  transport: TransportType;
  duration: number;
  attractions: string;
  is_draft: boolean;
}

interface NoteFormContext {
  isEditing: boolean;
  isDirty: boolean;
  setIsDirty: (value: boolean) => void;
  lastSavedDraft?: NoteFormData;
}

interface DestinationOption {
  value: number;
  label: string;
  country: string;
}

interface AutoSaveState {
  lastSaved: Date | null;
  isAutoSaving: boolean;
  error?: string;
}

interface ValidationError {
  field: string;
  message: string;
}
```

## 6. Zarządzanie stanem

### Custom Hooks

```typescript
const useNoteForm = (noteId?: string) => {
  // Inicjalizacja React Hook Form
  // Obsługa walidacji Zod
  // Obsługa stanu formularza
  // Integracja z API
}

const useDestinationSearch = () => {
  // Logika wyszukiwania destynacji
  // Debouncing zapytań
  // Cache wyników
}

const useAutoSave = (formData: NoteFormData, isDirty: boolean) => {
  // Automatyczne zapisywanie wersji roboczej
  // Obsługa stanu zapisywania
  // Zarządzanie timeoutami
}

const useUnsavedChangesWarning = (isDirty: boolean) => {
  // Ostrzeżenie przed utratą zmian
  // Integracja z routerem
}
```

## 7. Integracja API

### Endpointy
- `POST /notes` - tworzenie nowej notatki
- `PATCH /notes/{id}` - aktualizacja notatki
- `GET /notes/{id}` - pobieranie notatki do edycji
- `GET /destinations` - wyszukiwanie destynacji

### Typy żądań i odpowiedzi
- Request: `NoteCreateDTO`
- Response: `NoteResponseDTO`

## 8. Interakcje użytkownika

1. Wyszukiwanie i wybór destynacji
   - Wpisywanie tekstu w pole wyszukiwania
   - Wybór destynacji z listy podpowiedzi
   - Możliwość wyczyszczenia wyboru

2. Wypełnianie formularza
   - Wybór segmentu
   - Wybór transportu
   - Ustawienie długości wycieczki
   - Wprowadzenie opisu atrakcji

3. Zapisywanie formularza
   - Automatyczne zapisywanie wersji roboczej
   - Ręczne zapisywanie wersji roboczej
   - Zapisywanie kompletnej notatki

4. Nawigacja
   - Ostrzeżenie przed utratą niezapisanych zmian
   - Powrót do listy notatek
   - Przekierowanie po zapisie

## 9. Warunki i walidacja

### Schema Zod
```typescript
const noteFormSchema = z.object({
  destination_id: z.number().min(1),
  segment: z.enum(['family', 'couple', 'solo']),
  transport: z.enum(['car', 'public_transport', 'plane', 'walking']),
  duration: z.number().min(1).max(5),
  attractions: z.string().max(5000),
  is_draft: z.boolean()
});
```

### Warunki walidacji
- Destynacja: wymagana, poprawny identyfikator
- Segment: wymagany, jeden z: family, couple, solo
- Transport: wymagany, jeden z: car, public_transport, plane, walking
- Długość wycieczki: wymagana, liczba całkowita 1-5
- Atrakcje: wymagane, max 5000 znaków
- Wersja robocza: nie wymaga wypełnienia wszystkich pól

## 10. Obsługa błędów

### Scenariusze błędów
1. Błędy walidacji
   - Brakujące pola wymagane
   - Nieprawidłowe wartości
   - Przekroczone limity znaków

2. Błędy API
   - Błąd tworzenia/aktualizacji notatki
   - Błąd wyszukiwania destynacji
   - Błąd autoryzacji

3. Błędy nawigacji
   - Nieznaleziona notatka do edycji
   - Brak uprawnień do edycji
   - Błąd podczas przekierowania

### Obsługa błędów
- Wyświetlanie komunikatów przy polach
- Toast notifications dla błędów API
- Blokada przycisku zapisu podczas przetwarzania
- Możliwość ponowienia próby zapisu

## 11. Kroki implementacji

1. Konfiguracja routingu i podstawowej struktury
   - Utworzenie komponentu strony
   - Konfiguracja ścieżek w Astro
   - Podstawowy layout

2. Implementacja formularza
   - Konfiguracja React Hook Form
   - Implementacja schemy Zod
   - Integracja z API

3. Implementacja komponentów formularza
   - Komponenty pól formularza
   - Walidacja w czasie rzeczywistym
   - Obsługa błędów

4. Implementacja wyszukiwania destynacji
   - Komponent autouzupełniania
   - Integracja z API destynacji
   - Debouncing i cache

5. Implementacja automatycznego zapisywania
   - Hook useAutoSave
   - Logika wersji roboczych
   - Obsługa błędów

6. Implementacja ostrzeżeń
   - Dialog niezapisanych zmian
   - Integracja z routerem
   - Obsługa nawigacji

7. Implementacja obsługi błędów
   - Komponenty komunikatów błędów
   - Toast notifications
   - Logika ponownych prób

8. Optymalizacja i testy
   - Testy komponentów
   - Testy integracyjne
   - Optymalizacja wydajności
   - Testy dostępności 