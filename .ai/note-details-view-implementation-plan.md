# Plan implementacji widoku szczegółów notatki

## 1. Przegląd
Widok szczegółów notatki służy do wyświetlania wszystkich informacji o notatce podróży, umożliwiając użytkownikowi przeglądanie danych, edycję, usuwanie oraz generowanie planu podróży. Widok zawiera również informacje o dostępnym limicie generowań planów i blokuje tę funkcję, gdy limit został przekroczony.

## 2. Routing widoku
- Ścieżka: `/notes/[id]`
- Parametry URL:
  - `id`: UUID notatki

## 3. Struktura komponentów
```
NoteDetailsPage
├── NoteHeader
├── NoteContent
│   ├── DestinationInfo
│   ├── TripDetails
│   └── AttractionsDisplay
└── NoteActions
    ├── EditButton
    ├── DeleteButton
    ├── GeneratePlanButton
    └── GenerationLimitInfo
```

## 4. Szczegóły komponentów

### NoteDetailsPage
- Opis komponentu: Główny kontener widoku szczegółów notatki
- Główne elementy:
  - Layout z nagłówkiem
  - Skeleton podczas ładowania
  - Obsługa błędów
- Obsługiwane interakcje:
  - Ładowanie danych notatki
  - Przekierowania do edycji/generowania
- Typy:
  - `NoteDetailsPageProps`
  - `NoteDetailsState`
- Propsy: brak (komponent na poziomie strony)

### NoteHeader
- Opis komponentu: Nagłówek z podstawowymi informacjami o notatce
- Główne elementy:
  - Tytuł z miejscem docelowym
  - Data utworzenia/modyfikacji
  - Status wersji roboczej
- Obsługiwane interakcje: brak
- Typy:
  - `NoteHeaderProps`
- Propsy:
  - `destination: DestinationBasicInfo`
  - `createdAt: string`
  - `updatedAt: string`
  - `isDraft: boolean`

### NoteContent
- Opis komponentu: Główna treść notatki
- Główne elementy:
  - Informacje o destynacji
  - Szczegóły wycieczki
  - Lista atrakcji
- Obsługiwane interakcje: brak
- Typy:
  - `NoteContentProps`
- Propsy:
  - `note: NoteResponseDTO`

### DestinationInfo
- Opis komponentu: Informacje o miejscu docelowym
- Główne elementy:
  - Nazwa miasta i kraju
  - Dodatkowe informacje o lokalizacji
- Obsługiwane interakcje: brak
- Typy:
  - `DestinationInfoProps`
- Propsy:
  - `destination: DestinationBasicInfo`

### TripDetails
- Opis komponentu: Szczegóły planowanej podróży
- Główne elementy:
  - Typ segmentu
  - Środek transportu
  - Długość wycieczki
- Obsługiwane interakcje: brak
- Typy:
  - `TripDetailsProps`
- Propsy:
  - `segment: SegmentType`
  - `transport: TransportType`
  - `duration: number`

### AttractionsDisplay
- Opis komponentu: Wyświetlanie listy atrakcji
- Główne elementy:
  - Sformatowany tekst atrakcji
  - Możliwość rozwinięcia/zwinięcia długiego tekstu
- Obsługiwane interakcje:
  - Rozwijanie/zwijanie tekstu
- Typy:
  - `AttractionsDisplayProps`
- Propsy:
  - `attractions: string`

### NoteActions
- Opis komponentu: Panel akcji dla notatki
- Główne elementy:
  - Przyciski akcji
  - Informacja o limicie generowań
- Obsługiwane interakcje:
  - Edycja notatki
  - Usuwanie notatki
  - Generowanie planu
- Typy:
  - `NoteActionsProps`
- Propsy:
  - `noteId: string`
  - `isDraft: boolean`
  - `onEdit: () => void`
  - `onDelete: () => void`
  - `onGeneratePlan: () => void`
  - `generationLimitInfo: GenerationLimitInfo`

### GenerationLimitInfo
- Opis komponentu: Informacja o limicie generowań
- Główne elementy:
  - Licznik pozostałych generowań
  - Czas resetowania limitu
- Obsługiwane interakcje: brak
- Typy:
  - `GenerationLimitInfoProps`
- Propsy:
  - `remainingGenerations: number`
  - `resetTime?: string`

## 5. Typy

```typescript
interface NoteDetailsState {
  isLoading: boolean;
  error?: string;
  note?: NoteResponseDTO;
}

interface GenerationLimitInfo {
  remainingGenerations: number;
  resetTime?: string;
}

interface DeleteConfirmationState {
  isOpen: boolean;
  isDeleting: boolean;
  error?: string;
}

interface NoteDetailsPageProps {
  noteId: string;
}

interface NoteActionsProps {
  noteId: string;
  isDraft: boolean;
  generationLimitInfo: GenerationLimitInfo;
  onEdit: () => void;
  onDelete: () => void;
  onGeneratePlan: () => void;
}
```

## 6. Zarządzanie stanem

### Custom Hooks

```typescript
const useNoteDetails = (noteId: string) => {
  // Pobieranie i zarządzanie danymi notatki
  // Obsługa błędów
  // Obsługa stanu ładowania
}

const useGenerationLimit = (userId: string) => {
  // Sprawdzanie limitu generowań
  // Pobieranie czasu resetowania
}

const useDeleteNote = () => {
  // Zarządzanie stanem usuwania
  // Obsługa potwierdzenia
  // Przekierowanie po usunięciu
}
```

## 7. Integracja API

### Endpointy
- `GET /notes/{id}` - pobieranie szczegółów notatki
- `DELETE /notes/{id}` - usuwanie notatki
- `GET /users/me/generation-limit` - sprawdzanie limitu generowań

### Typy żądań i odpowiedzi
- Request: brak body
- Response: `NoteResponseDTO`

## 8. Interakcje użytkownika

1. Przeglądanie notatki
   - Wyświetlanie wszystkich informacji
   - Rozwijanie/zwijanie długich opisów atrakcji

2. Akcje na notatce
   - Przejście do edycji
   - Usuwanie notatki (z potwierdzeniem)
   - Generowanie planu

3. Sprawdzanie limitu generowań
   - Wyświetlanie pozostałej liczby generowań
   - Informacja o czasie resetowania limitu

## 9. Warunki i walidacja

### Warunki dostępu
- Użytkownik musi być zalogowany
- Użytkownik musi być właścicielem notatki

### Warunki generowania planu
- Notatka nie może być wersją roboczą
- Użytkownik musi mieć dostępne generowania w limicie dziennym
- Wszystkie wymagane pola notatki muszą być wypełnione

## 10. Obsługa błędów

### Scenariusze błędów
1. Błędy ładowania
   - Nieznaleziona notatka
   - Brak uprawnień
   - Błąd serwera

2. Błędy usuwania
   - Nieudane usunięcie
   - Brak uprawnień
   - Błąd serwera

3. Błędy generowania planu
   - Przekroczony limit dzienny
   - Notatka jest wersją roboczą
   - Brak wymaganych danych

### Obsługa błędów
- Wyświetlanie komunikatów błędów
- Przyciski ponowienia próby
- Przekierowania w przypadku błędów krytycznych

## 11. Kroki implementacji

1. Konfiguracja routingu i podstawowej struktury
   - Utworzenie komponentu strony
   - Konfiguracja ścieżki w Astro
   - Podstawowy layout

2. Implementacja komponentów UI
   - Nagłówek notatki
   - Sekcja treści
   - Panel akcji
   - Skeleton ładowania

3. Implementacja integracji z API
   - Hook useNoteDetails
   - Hook useGenerationLimit
   - Hook useDeleteNote

4. Implementacja wyświetlania danych
   - Formatowanie danych notatki
   - Wyświetlanie informacji o limicie
   - Obsługa długich tekstów

5. Implementacja akcji
   - Logika usuwania z potwierdzeniem
   - Przekierowania do edycji
   - Inicjacja generowania planu

6. Implementacja obsługi błędów
   - Komponenty komunikatów błędów
   - Obsługa ponownych prób
   - Logika fallbacku

7. Implementacja walidacji i zabezpieczeń
   - Sprawdzanie uprawnień
   - Walidacja stanu notatki
   - Blokada generowania planu

8. Optymalizacja i testy
   - Testy komponentów
   - Testy integracyjne
   - Optymalizacja wydajności
   - Testy dostępności 