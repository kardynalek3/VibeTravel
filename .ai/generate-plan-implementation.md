# API Endpoint Implementation Plan: POST /notes/{noteId}/plans

## 1. Przegląd punktu końcowego

Endpoint POST /notes/{noteId}/plans umożliwia generowanie szczegółowego planu podróży na podstawie istniejącej notatki użytkownika z wykorzystaniem sztucznej inteligencji. Jest to kluczowy element aplikacji VibeTravels, przekształcający uproszczone notatki o planowanych podróżach w konkretne, wykonalne plany zawierające harmonogram dnia, czasy zwiedzania atrakcji, przemieszczania się oraz praktyczne rekomendacje. Endpoint realizuje główną wartość biznesową aplikacji i podlega limitom użytkowania (2 plany dziennie per użytkownik).

## 2. Szczegóły żądania

- **Metoda HTTP**: POST
- **Struktura URL**: `/notes/{noteId}/plans`
- **Nagłówki**:
  - `Authorization`: Bearer token (wymagany)
  - `Content-Type`: application/json (wymagany)
- **Parametry**:
  - **Wymagane**:
    - `noteId` (uuid): Identyfikator notatki w ścieżce URL, na podstawie której ma zostać wygenerowany plan

## 3. Wykorzystywane typy

- **DTO Response**: `PlanResponseDTO`

  ```typescript
  type PlanResponseDTO = Omit<Plan, "user_id" | "destination_id"> & {
    user: UserBasicInfo;
    destination: DestinationBasicInfo;
    is_liked_by_me: boolean;
  };
  ```

- **Struktura PlanContent**:

  ```typescript
  type PlanContent = {
    title: string;
    summary: string;
    days: PlanDay[];
    recommendations?: string[];
  };
  ```

- **DTO dla błędów AI**:
  ```typescript
  type AIErrorDTO = {
    user_id: string;
    note_id: string;
    error_type: string;
    error_message: string;
    input_data?: string;
  };
  ```

## 4. Szczegóły odpowiedzi

- **Kody statusu powodzenia**:

  - 201 Created (w przypadku synchronicznego generowania planu)
  - 202 Accepted (w przypadku asynchronicznego generowania planu)

- **Format odpowiedzi (kod 201)**:

  ```json
  {
    "id": "uuid",
    "note_id": "uuid",
    "user": {
      "first_name": "Jan",
      "last_name_initial": "K"
    },
    "destination": {
      "city": "Kraków",
      "country": "Polska"
    },
    "content": {
      "title": "3-dniowa wycieczka do Krakowa",
      "summary": "Odkrywanie kulturowych i historycznych atrakcji Krakowa",
      "days": [
        {
          "date": "2023-07-01",
          "items": [
            {
              "time": "09:00",
              "type": "place",
              "data": {
                "name": "Wawel",
                "description": "Historyczny kompleks zamkowy",
                "visit_duration": 120,
                "coordinates": {
                  "lat": 50.0546,
                  "lng": 19.9352
                }
              }
            }
            // ... więcej elementów planu
          ]
        }
        // ... więcej dni
      ],
      "recommendations": [
        "Weź wygodne buty do chodzenia",
        "Sprawdź godziny otwarcia muzeów przed wizytą"
      ]
    },
    "is_public": true,
    "likes_count": 0,
    "created_at": "2023-06-15T10:00:00Z",
    "is_liked_by_me": false
  }
  ```

- **Kody błędów**:
  - 400 Bad Request - Nieprawidłowy format noteId
  - 401 Unauthorized - Użytkownik nie jest uwierzytelniony
  - 403 Forbidden - Notatka należy do innego użytkownika lub przekroczono dzienny limit generowania planów
  - 404 Not Found - Notatka nie istnieje lub została usunięta
  - 422 Unprocessable Entity - Notatka nie zawiera wystarczających danych do wygenerowania planu
  - 500 Internal Server Error - Błąd generowania planu lub nieoczekiwany błąd serwera

## 5. Przepływ danych

1. **Walidacja i autoryzacja**:

   - Sprawdzenie poprawności formatu noteId i uwierzytelnienia użytkownika
   - Pobranie notatki i weryfikacja uprawnień (czy należy do zalogowanego użytkownika)
   - Sprawdzenie, czy notatka zawiera wystarczające dane do generowania planu

2. **Sprawdzenie limitu dziennego**:

   - Weryfikacja, czy użytkownik nie przekroczył limitu 2 planów dziennie

3. **Generowanie planu**:

   - Pobranie danych notatki i preferencji użytkownika
   - Komunikacja z API AI (Openrouter.ai)
   - Przekształcenie odpowiedzi AI na strukturę PlanContent

4. **Zapis i zwrot danych**:
   - Utworzenie nowego rekordu w tabeli `plans`
   - Przygotowanie i zwrócenie odpowiedzi zawierającej wygenerowany plan

## 6. Względy bezpieczeństwa

1. **Uwierzytelnianie i autoryzacja**:

   - Weryfikacja tokenu JWT z Supabase Auth
   - Sprawdzenie, czy notatka należy do zalogowanego użytkownika
   - Wykorzystanie Row Level Security (RLS) w Supabase

2. **Walidacja danych i ochrona przed nadużyciami**:
   - Sprawdzenie poprawności formatu UUID i zawartości notatki
   - Limitowanie liczby generowanych planów do 2 dziennie per użytkownik
   - Filtrowanie danych przekazywanych do API AI (ochrona przed prompt injection)

## 7. Obsługa błędów

1. **Błędny format noteId**:

   ```json
   {
     "status": 400,
     "message": "Nieprawidłowy format identyfikatora notatki"
   }
   ```

2. **Brak uprawnień do notatki lub przekroczony limit generowania**:

   ```json
   {
     "status": 403,
     "message": "Brak uprawnień do generowania planu dla tej notatki"
   }
   ```

   lub

   ```json
   {
     "status": 403,
     "message": "Przekroczono dzienny limit generowania planów (2 plany)",
     "reset_time": "2023-06-16T00:00:00Z"
   }
   ```

3. **Niewystarczające dane w notatce**:

   ```json
   {
     "status": 422,
     "message": "Notatka nie zawiera wystarczających danych do wygenerowania planu",
     "details": {
       "missing_fields": ["attractions", "duration"]
     }
   }
   ```

4. **Błąd generowania planu**:
   ```json
   {
     "status": 500,
     "message": "Wystąpił błąd podczas generowania planu",
     "error_id": "uuid"
   }
   ```

## 8. Rozważania dotyczące wydajności

1. **Optymalizacja komunikacji z AI**:

   - Efektywne formatowanie promptów dla minimalizacji tokenów
   - Implementacja timeoutów (max. 3 minuty na generowanie planu)
   - Opcjonalnie: asynchroniczne generowanie dla planów wymagających dłuższego czasu

2. **Optymalizacja bazy danych**:
   - Efektywne zapytania z wykorzystaniem indeksów
   - Transakcje dla atomowego zapisu planu i aktualizacji statystyk

## 9. Etapy wdrożenia

1. **Utworzenie AIService do komunikacji z API AI**:

   ```typescript
   // src/lib/services/ai.service.ts
   export class AIService {
     constructor(
       private supabase: SupabaseClient,
       private aiClient: any
     ) {}

     async generatePlanFromNote(note: Note, userId: string): Promise<PlanContent> {
       // Implementacja generowania planu z wykorzystaniem AI
     }

     private async logAIError(errorData: AIErrorDTO): Promise<void> {
       // Zapisanie błędu AI w bazie danych
     }
   }
   ```

2. **Rozszerzenie PlansService o metody generowania planu**:

   ```typescript
   // src/lib/services/plans.service.ts
   export class PlansService {
     // Istniejące metody...

     async generatePlanFromNote(noteId: string, userId: string): Promise<PlanResponseDTO> {
       // 1. Sprawdzenie limitu dziennego
       // 2. Pobranie i walidacja notatki
       // 3. Generowanie planu przez AI
       // 4. Zapis planu w bazie danych
       // 5. Zwrócenie pełnych danych planu
     }

     private async checkDailyLimit(userId: string): Promise<boolean> {
       // Implementacja sprawdzania limitu dziennego
     }
   }
   ```

3. **Implementacja handlera endpointu**:

   ```typescript
   // src/pages/api/notes/[noteId]/plans.ts
   export const prerender = false;

   export const POST: APIRoute = async ({ params, locals }) => {
     try {
       // 1. Walidacja parametru noteId
       // 2. Pobranie kontekstu użytkownika
       // 3. Inicjalizacja serwisów
       // 4. Generowanie planu
       // 5. Zwrócenie odpowiedzi
     } catch (error) {
       // 6. Obsługa błędów
     }
   };
   ```

4. **Utworzenie klienta API AI**:

   ```typescript
   // src/lib/clients/ai.client.ts
   export class AiClient {
     constructor(private apiKey: string) {}

     async generate(prompt: string, options = {}): Promise<any> {
       // Implementacja komunikacji z Openrouter.ai
     }
   }
   ```

5. **Implementacja testów i dokumentacji**:
   - Testy jednostkowe dla AIService i PlansService
   - Testy integracyjne dla endpointu
   - Dokumentacja API dla front-endu
   - Wdrożenie i monitorowanie
