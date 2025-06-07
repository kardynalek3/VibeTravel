# API Endpoint Implementation Plan: GET /plans/{id}

## 1. Przegląd punktu końcowego

Endpoint GET /plans/{id} umożliwia pobranie szczegółów konkretnego planu podróży wygenerowanego przez AI. Endpoint obsługuje zarówno dostęp do planów publicznych (dostępnych dla wszystkich), jak i prywatnych (dostępnych tylko dla właściciela). Plan zawiera szczegółowe informacje o wygenerowanym harmonogramie podróży, w tym informacje o miejscu docelowym, twórcy planu, statusie publicznym/prywatnym oraz dane o polubieniach. Endpoint jest kluczowym elementem aplikacji umożliwiającym przeglądanie szczegółów planu podróży przed jego ewentualnym wyeksportowaniem do PDF.

## 2. Szczegóły żądania

- **Metoda HTTP**: GET
- **Struktura URL**: `/plans/{id}`
- **Nagłówki**:
  - `Authorization`: Bearer token (opcjonalny, wymagany dla planów prywatnych)
- **Parametry**:
  - **Wymagane**:
    - `id` (uuid): Identyfikator planu podróży w ścieżce URL

## 3. Wykorzystywane typy

- **DTO Response**: `PlanResponseDTO`

  ```typescript
  type PlanResponseDTO = Omit<Plan, "user_id" | "destination_id"> & {
    user: UserBasicInfo;
    destination: DestinationBasicInfo;
    is_liked_by_me: boolean;
  };
  ```

- **Typy pomocnicze**:

  ```typescript
  type UserBasicInfo = {
    first_name: string;
    last_name_initial: string;
  };

  type DestinationBasicInfo = {
    city: string;
    country: string;
  };

  type PlanContent = {
    title: string;
    summary: string;
    days: PlanDay[];
    recommendations?: string[];
  };
  ```

## 4. Szczegóły odpowiedzi

- **Kod statusu powodzenia**: 200 OK
- **Format odpowiedzi**:

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
    "likes_count": 42,
    "created_at": "2023-06-15T10:00:00Z",
    "is_liked_by_me": false
  }
  ```

- **Kody błędów**:
  - 403 Forbidden - Prywatny plan należy do innego użytkownika
  - 404 Not Found - Plan nie istnieje lub został usunięty
  - 500 Internal Server Error - Nieoczekiwany błąd serwera

## 5. Przepływ danych

1. **Pobranie i walidacja parametrów**:

   - Pobranie parametru `id` z URL
   - Walidacja, czy `id` jest poprawnym UUID

2. **Pobranie danych uwierzytelniania**:

   - Sprawdzenie, czy żądanie zawiera token JWT
   - Pobranie ID użytkownika z tokenu (jeśli istnieje)

3. **Pobranie danych planu**:

   - Zapytanie do bazy danych o plan o określonym ID
   - Weryfikacja, czy plan nie został usunięty (deleted_at IS NULL)
   - Sprawdzenie uprawnień dostępu (plan publiczny lub należący do zalogowanego użytkownika)

4. **Rozszerzenie danych**:

   - Pobranie podstawowych informacji o użytkowniku (imię i pierwsza litera nazwiska)
   - Pobranie podstawowych informacji o miejscu docelowym (miasto, kraj)
   - Sprawdzenie, czy zalogowany użytkownik polubił plan (is_liked_by_me)

5. **Transformacja i przygotowanie odpowiedzi**:
   - Mapowanie danych z bazy na format PlanResponseDTO
   - Parsowanie pola content z JSONB do odpowiedniego formatu
   - Zwrócenie odpowiedzi z kodem statusu 200 OK

## 6. Względy bezpieczeństwa

1. **Uwierzytelnianie**:

   - Weryfikacja tokenu JWT z Supabase Auth (opcjonalna dla planów publicznych)
   - Odrzucenie żądań o dostęp do prywatnych planów bez prawidłowego tokenu (403 Forbidden)

2. **Autoryzacja**:

   - Sprawdzenie, czy plan jest publiczny lub należy do zalogowanego użytkownika
   - Wykorzystanie Row Level Security (RLS) na poziomie bazy danych jako dodatkowej warstwy zabezpieczeń

3. **Walidacja danych**:

   - Sanityzacja parametrów wejściowych
   - Ochrona przed atakami typu IDOR (Insecure Direct Object References)

4. **Zabezpieczenie przed atakami**:
   - Implementacja rate limitingu dla zapobiegania atakom typu brute force
   - Bezpieczne parsowanie JSON z pola content, aby zapobiec atakom typu JSON injection

## 7. Obsługa błędów

1. **Nieprawidłowy format ID**:

   ```json
   {
     "status": 400,
     "message": "Nieprawidłowy format identyfikatora planu"
   }
   ```

2. **Brak uprawnień do planu prywatnego**:

   ```json
   {
     "status": 403,
     "message": "Brak uprawnień do wyświetlenia tego planu"
   }
   ```

3. **Plan nie istnieje lub został usunięty**:

   ```json
   {
     "status": 404,
     "message": "Plan o podanym identyfikatorze nie istnieje"
   }
   ```

4. **Błąd serwera**:
   ```json
   {
     "status": 500,
     "message": "Wystąpił nieoczekiwany błąd serwera"
   }
   ```

## 8. Rozważania dotyczące wydajności

1. **Optymalizacja bazy danych**:

   - Wykorzystanie indeksu na kolumnie `id` w tabeli `plans`
   - Dodanie warunku `deleted_at IS NULL` do zapytań, aby wykorzystać istniejący indeks częściowy

2. **Optymalizacja pobierania danych**:

   - Łączenie wielu zapytań w jedno z wykorzystaniem JOIN-ów
   - Pobieranie tylko niezbędnych kolumn z tabel

3. **Cache'owanie**:

   - Implementacja cache'owania dla popularnych planów publicznych (timeout: 1 godzina)
   - Przechowywanie w cache wyników dla szybszego dostępu w przyszłości

4. **Optymalizacja JSON**:
   - Parsowanie tylko niezbędnych pól z obiektu JSON content
   - Unikanie nadmiernie głębokich struktur zagnieżdżonych

## 9. Etapy wdrożenia

1. **Utworzenie serwisu PlansService**:

   ```typescript
   // src/lib/services/plans.service.ts
   import { SupabaseClient } from "@supabase/supabase-js";
   import { PlanResponseDTO } from "../../types";

   export class PlansService {
     constructor(private supabase: SupabaseClient) {}

     async getPlanById(planId: string, userId?: string): Promise<PlanResponseDTO> {
       // Implementacja pobierania planu
     }
   }
   ```

2. **Implementacja metody serwisowej**:

   ```typescript
   async getPlanById(planId: string, userId?: string): Promise<PlanResponseDTO> {
     // 1. Pobranie planu z bazy danych
     const { data: plan, error } = await this.supabase
       .from('plans')
       .select(`
         id,
         note_id,
         content,
         is_public,
         likes_count,
         created_at,
         user_id,
         destinations:destination_id (city, country)
       `)
       .eq('id', planId)
       .is('deleted_at', null)
       .single();

     if (error) throw new Error(`Failed to fetch plan: ${error.message}`);
     if (!plan) throw new Error('Plan not found');

     // 2. Sprawdzenie uprawnień
     if (!plan.is_public && plan.user_id !== userId) {
       throw new Error('Forbidden: You do not have permission to view this plan');
     }

     // 3. Pobranie informacji o użytkowniku
     const { data: userData, error: userError } = await this.supabase
       .from('profiles')
       .select('first_name, last_name')
       .eq('id', plan.user_id)
       .single();

     if (userError) throw new Error(`Failed to fetch user data: ${userError.message}`);

     // 4. Sprawdzenie czy użytkownik polubił plan
     let isLikedByMe = false;
     if (userId) {
       const { data: likeData, error: likeError } = await this.supabase
         .from('likes')
         .select('id')
         .eq('plan_id', planId)
         .eq('user_id', userId)
         .maybeSingle();

       if (!likeError) {
         isLikedByMe = !!likeData;
       }
     }

     // 5. Transformacja danych do odpowiedniego formatu
     return {
       id: plan.id,
       note_id: plan.note_id,
       user: {
         first_name: userData.first_name,
         last_name_initial: userData.last_name.charAt(0)
       },
       destination: {
         city: plan.destinations.city,
         country: plan.destinations.country
       },
       content: plan.content,
       is_public: plan.is_public,
       likes_count: plan.likes_count,
       created_at: plan.created_at,
       is_liked_by_me: isLikedByMe
     };
   }
   ```

3. **Implementacja handlera endpointu**:

   ```typescript
   // src/pages/api/plans/[id].ts
   import type { APIRoute } from "astro";
   import { PlansService } from "../../../lib/services/plans.service";
   import { validate as isUUID } from "uuid";

   export const prerender = false;

   export const GET: APIRoute = async ({ params, locals, request }) => {
     try {
       const { id } = params;

       // 1. Walidacja parametru ID
       if (!id || !isUUID(id)) {
         return new Response(
           JSON.stringify({
             status: 400,
             message: "Nieprawidłowy format identyfikatora planu",
           }),
           {
             status: 400,
             headers: { "Content-Type": "application/json" },
           }
         );
       }

       // 2. Pobranie supabase i ID użytkownika z kontekstu
       const supabase = locals.supabase;
       const userId = locals.session?.user?.id;

       // 3. Utworzenie instancji serwisu i pobranie planu
       const plansService = new PlansService(supabase);
       const plan = await plansService.getPlanById(id, userId);

       // 4. Zwrócenie odpowiedzi
       return new Response(JSON.stringify(plan), {
         status: 200,
         headers: { "Content-Type": "application/json" },
       });
     } catch (error) {
       // 5. Obsługa błędów
       const message = error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd";

       if (message.includes("Forbidden")) {
         return new Response(
           JSON.stringify({ status: 403, message: "Brak uprawnień do wyświetlenia tego planu" }),
           { status: 403, headers: { "Content-Type": "application/json" } }
         );
       }

       if (message.includes("not found")) {
         return new Response(
           JSON.stringify({ status: 404, message: "Plan o podanym identyfikatorze nie istnieje" }),
           { status: 404, headers: { "Content-Type": "application/json" } }
         );
       }

       console.error("Error fetching plan:", error);
       return new Response(
         JSON.stringify({ status: 500, message: "Wystąpił nieoczekiwany błąd serwera" }),
         { status: 500, headers: { "Content-Type": "application/json" } }
       );
     }
   };
   ```

4. **Utworzenie testów jednostkowych**:

   ```typescript
   // tests/unit/services/plans.service.test.ts
   import { describe, it, expect, vi, beforeEach } from "vitest";
   import { PlansService } from "../../../src/lib/services/plans.service";

   describe("PlansService", () => {
     let mockSupabase;
     let plansService;

     beforeEach(() => {
       mockSupabase = {
         from: vi.fn().mockReturnThis(),
         select: vi.fn().mockReturnThis(),
         eq: vi.fn().mockReturnThis(),
         is: vi.fn().mockReturnThis(),
         single: vi.fn().mockReturnThis(),
         maybeSingle: vi.fn().mockReturnThis(),
       };

       plansService = new PlansService(mockSupabase);
     });

     it("should fetch a public plan successfully", async () => {
       // Implementacja testu
     });

     it("should fetch a private plan for its owner", async () => {
       // Implementacja testu
     });

     it("should throw an error for a private plan accessed by another user", async () => {
       // Implementacja testu
     });

     it("should throw an error for a non-existent plan", async () => {
       // Implementacja testu
     });
   });
   ```

5. **Utworzenie testów integracyjnych**:

   ```typescript
   // tests/integration/api/plans.test.ts
   import { describe, it, expect } from "vitest";
   import { setupServer } from "msw/node";
   import { rest } from "msw";
   import { fetch } from "undici";

   describe("GET /api/plans/:id", () => {
     // Konfiguracja serwera testowego z mockami Supabase

     it("should return 200 and plan data for a public plan", async () => {
       // Implementacja testu
     });

     it("should return 403 for private plan accessed by unauthorized user", async () => {
       // Implementacja testu
     });

     it("should return 404 for non-existent plan", async () => {
       // Implementacja testu
     });
   });
   ```

6. **Dokumentacja**:

   - Dodanie dokumentacji endpointu do dokumentacji API
   - Dodanie przykładów użycia dla front-endu
   - Dokumentacja wewnętrzna w kodzie (JSDoc)

7. **Wdrożenie**:
   - Przegląd kodu przez innego dewelopera
   - Uruchomienie testów automatycznych
   - Wdrożenie na środowisko testowe
   - Weryfikacja działania endpointu
   - Wdrożenie na środowisko produkcyjne
