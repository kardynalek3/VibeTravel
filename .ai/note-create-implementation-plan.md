# API Endpoint Implementation Plan: POST /notes

## 1. Przegląd punktu końcowego

Endpoint POST /notes umożliwia użytkownikom tworzenie nowych notatek dotyczących planowanych wycieczek. Notatki te zawierają podstawowe informacje o planowanej podróży, takie jak miejsce docelowe, czas trwania, preferowany środek transportu oraz lista atrakcji, które użytkownik chciałby odwiedzić. Notatki mogą być zapisane jako wersje robocze i później wykorzystane do generowania szczegółowych planów podróży przez AI.

## 2. Szczegóły żądania

- **Metoda HTTP**: POST
- **Struktura URL**: `/notes`
- **Nagłówki**:
  - `Authorization`: Bearer token (wymagany)
  - `Content-Type`: application/json (wymagany)
- **Parametry**:
  - **Wymagane**:
    - `destination_id` (integer): ID miejsca docelowego
    - `duration` (integer): Czas trwania wycieczki (1-5 dni)
    - `attractions` (string): Opis atrakcji (max 500 znaków)
  - **Opcjonalne**:
    - `segment` (enum): Typ segmentu ('family', 'couple', 'solo')
    - `transport` (enum): Typ transportu ('car', 'public_transport', 'plane', 'walking')
    - `is_draft` (boolean): Czy notatka jest wersją roboczą (domyślnie: true)
- **Request Body**:
  ```json
  {
    "destination_id": 1,
    "segment": "family",
    "transport": "car",
    "duration": 3,
    "attractions": "Chciałbym odwiedzić muzeum, park, zamek i spróbować lokalnej kuchni.",
    "is_draft": true
  }
  ```

## 3. Wykorzystywane typy

- **DTO Request**: `NoteCreateDTO`

  ```typescript
  type NoteCreateDTO = Pick<
    Note,
    "destination_id" | "segment" | "transport" | "duration" | "attractions" | "is_draft"
  >;
  ```

- **DTO Response**: `NoteResponseDTO`

  ```typescript
  type NoteResponseDTO = Omit<Note, "destination_id"> & {
    destination: DestinationBasicInfo;
  };
  ```

- **Schematy walidacji Zod**:
  ```typescript
  const noteCreateSchema = z.object({
    destination_id: z.number().int().positive(),
    segment: z.nativeEnum(SegmentType).optional(),
    transport: z.nativeEnum(TransportType).optional(),
    duration: z.number().int().min(1).max(5),
    attractions: z.string().max(500),
    is_draft: z.boolean().optional().default(true),
  });
  ```

## 4. Szczegóły odpowiedzi

- **Kod statusu powodzenia**: 201 Created
- **Format odpowiedzi**:

  ```json
  {
    "id": "uuid",
    "user_id": "uuid",
    "destination": {
      "city": "Kraków",
      "country": "Polska"
    },
    "segment": "family",
    "transport": "car",
    "duration": 3,
    "attractions": "Chciałbym odwiedzić muzeum, park, zamek i spróbować lokalnej kuchni.",
    "is_draft": true,
    "created_at": "2023-06-15T10:00:00Z",
    "updated_at": "2023-06-15T10:00:00Z"
  }
  ```

- **Kody błędów**:
  - 400 Bad Request - Nieprawidłowe dane wejściowe
  - 401 Unauthorized - Użytkownik nie jest uwierzytelniony
  - 404 Not Found - Nie znaleziono miejsca docelowego
  - 422 Unprocessable Entity - Błędy walidacji
  - 500 Internal Server Error - Nieoczekiwany błąd serwera

## 5. Przepływ danych

1. **Walidacja żądania**:

   - Sprawdzenie poprawności danych wejściowych przy użyciu schematu Zod
   - Weryfikacja, czy miejsce docelowe (destination_id) istnieje w bazie danych

2. **Przygotowanie danych**:

   - Pobranie ID użytkownika z tokenu uwierzytelniającego
   - Utworzenie obiektu notatki z danymi wejściowymi i ID użytkownika

3. **Operacje bazodanowe**:

   - Zapisanie nowej notatki w tabeli `notes`
   - Pobranie szczegółów miejsca docelowego z tabeli `destinations`
   - Połączenie danych notatki z podstawowymi informacjami o miejscu docelowym

4. **Przygotowanie odpowiedzi**:
   - Transformacja danych z bazy danych do formatu `NoteResponseDTO`
   - Zwrócenie odpowiedzi z kodem statusu 201 Created

## 6. Względy bezpieczeństwa

1. **Uwierzytelnianie**:

   - Weryfikacja tokenu JWT z Supabase Auth
   - Odrzucenie żądań bez prawidłowego tokenu (401 Unauthorized)

2. **Autoryzacja**:

   - Automatyczne przypisanie notatki do zalogowanego użytkownika
   - Zapewnienie, że użytkownik nie może tworzyć notatek w imieniu innych użytkowników

3. **Walidacja danych**:

   - Sprawdzenie poprawności wszystkich pól wejściowych
   - Sanityzacja danych tekstowych, aby zapobiec atakom XSS
   - Weryfikacja limitów długości pól zgodnie ze schematem bazy danych

4. **Zabezpieczenie przed atakami**:
   - Implementacja rate limitingu, aby zapobiec nadmiernemu tworzeniu notatek
   - Ochrona przed atakami CSRF zgodnie z wytycznymi Supabase
   - Wykorzystanie Row Level Security (RLS) na poziomie bazy danych

## 7. Obsługa błędów

1. **Błędy walidacji danych wejściowych**:

   ```json
   {
     "status": 400,
     "message": "Nieprawidłowe dane wejściowe",
     "errors": [
       { "field": "duration", "message": "Czas trwania musi być liczbą całkowitą od 1 do 5 dni" },
       { "field": "attractions", "message": "Opis atrakcji nie może przekraczać 500 znaków" }
     ]
   }
   ```

2. **Błędy uwierzytelniania**:

   ```json
   {
     "status": 401,
     "message": "Wymagane uwierzytelnienie"
   }
   ```

3. **Błędy nieznalezionego zasobu**:

   ```json
   {
     "status": 404,
     "message": "Nie znaleziono miejsca docelowego o ID: 123"
   }
   ```

4. **Błędy przetwarzania**:

   ```json
   {
     "status": 422,
     "message": "Nie można przetworzyć żądania",
     "details": "Nieprawidłowy typ segmentu. Dozwolone wartości: family, couple, solo"
   }
   ```

5. **Błędy serwera**:
   ```json
   {
     "status": 500,
     "message": "Wystąpił nieoczekiwany błąd serwera"
   }
   ```

## 8. Rozważania dotyczące wydajności

1. **Optymalizacja bazy danych**:

   - Wykorzystanie indeksu na kolumnie `destination_id` w tabeli `notes`
   - Sprawdzenie istnienia miejsca docelowego z wykorzystaniem indeksu na tabeli `destinations`

2. **Zarządzanie zasobami**:

   - Optymalizacja zapytań do bazy danych, aby pobierać tylko niezbędne dane
   - Implementacja pamięci podręcznej dla często używanych miejsc docelowych

3. **Zapytania do bazy danych**:

   - Ograniczenie liczby zapytań do bazy danych do minimum (max. 2 zapytania)
   - Wykorzystanie transakcji do zapewnienia atomowości operacji

4. **Limity**:
   - Ograniczenie maksymalnej długości pola `attractions` do 500 znaków
   - Ograniczenie maksymalnej liczby notatek na użytkownika (opcjonalnie)

## 9. Etapy wdrożenia

1. **Utworzenie serwisu NoteService**:

   ```typescript
   // src/lib/services/notes.service.ts
   import { SupabaseClient } from "@supabase/supabase-js";
   import { NoteCreateDTO, NoteResponseDTO } from "../../types";

   export class NotesService {
     constructor(private supabase: SupabaseClient) {}

     async createNote(userId: string, noteData: NoteCreateDTO): Promise<NoteResponseDTO> {
       // Implementacja tworzenia notatki
     }
   }
   ```

2. **Utworzenie schematu walidacji Zod**:

   ```typescript
   // src/lib/schemas/note.schema.ts
   import { z } from "zod";
   import { SegmentType, TransportType } from "../../types";

   export const noteCreateSchema = z.object({
     destination_id: z.number().int().positive(),
     segment: z.nativeEnum(SegmentType).optional(),
     transport: z.nativeEnum(TransportType).optional(),
     duration: z.number().int().min(1).max(5),
     attractions: z.string().max(500),
     is_draft: z.boolean().optional().default(true),
   });
   ```

3. **Implementacja handlera endpointu**:

   ```typescript
   // src/pages/api/notes.ts
   import type { APIRoute } from "astro";
   import { noteCreateSchema } from "../../lib/schemas/note.schema";
   import { NotesService } from "../../lib/services/notes.service";

   export const prerender = false;

   export const POST: APIRoute = async ({ request, locals }) => {
     // Implementacja handlera
   };
   ```

4. **Testy jednostkowe**:

   ```typescript
   // tests/unit/services/notes.service.test.ts
   import { describe, it, expect, vi } from "vitest";
   import { NotesService } from "../../../src/lib/services/notes.service";

   describe("NotesService", () => {
     it("should create a note successfully", async () => {
       // Implementacja testu
     });

     it("should throw an error if destination does not exist", async () => {
       // Implementacja testu
     });
   });
   ```

5. **Testy integracyjne**:

   ```typescript
   // tests/integration/api/notes.test.ts
   import { describe, it, expect } from "vitest";
   import { createClient } from "@supabase/supabase-js";

   describe("POST /api/notes", () => {
     it("should create a note successfully", async () => {
       // Implementacja testu
     });

     it("should return 400 for invalid data", async () => {
       // Implementacja testu
     });
   });
   ```

6. **Dokumentacja**:

   - Dodanie dokumentacji endpointu do dokumentacji API
   - Aktualizacja dokumentacji schematów walidacji
   - Dodanie przykładów użycia do dokumentacji dla deweloperów

7. **Wdrożenie**:
   - Przegląd kodu przez innego dewelopera
   - Testowanie na środowisku deweloperskim
   - Wdrożenie na środowisko produkcyjne z możliwością szybkiego wycofania w przypadku problemów
