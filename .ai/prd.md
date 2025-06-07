# Dokument wymagań produktu (PRD) - VibeTravels

## 1. Przegląd produktu

VibeTravels to responsywna aplikacja webowa służąca do generowania szczegółowych planów wycieczek w oparciu o notatki użytkownika i jego preferencje podróżnicze. Aplikacja wykorzystuje sztuczną inteligencję do konwersji uproszczonych notatek o miejscach i celach podróży na konkretne, wykonalne plany podróży trwających od 1 do 5 dni.

Aplikacja jest skierowana do trzech głównych segmentów użytkowników: rodzin, par oraz samotnych podróżników. System uwzględnia rzeczywiste uwarunkowania, takie jak średni czas zwiedzania atrakcji, średni czas przemieszczania się, dni zamknięcia atrakcji czy święta, aby wygenerować realistyczny harmonogram.

Kluczowe funkcjonalności VibeTravels obejmują:

- System kont użytkowników z profilami zawierającymi preferencje podróżnicze
- Tworzenie notatek o przyszłych wycieczkach
- Generowanie planów podróży przez AI na podstawie notatek
- Przeglądanie i filtrowanie planów wycieczek innych użytkowników
- Eksport planów do formatu PDF

## 2. Problem użytkownika

Głównym problemem, który rozwiązuje VibeTravels, jest trudność w planowaniu angażujących i interesujących wycieczek. Planowanie wycieczki wymaga dużo czasu, wiedzy i badań, aby zidentyfikować interesujące atrakcje, zoptymalizować trasę zwiedzania i uwzględnić praktyczne aspekty, takie jak godziny otwarcia atrakcji czy czas potrzebny na przemieszczanie się.

VibeTravels odpowiada na ten problem, umożliwiając zamianę uproszczonych notatek o miejscach i celach podróży na konkretne, wykonalne plany. System wykorzystuje potencjał AI do generowania spersonalizowanych planów podróży, które uwzględniają:

- Preferencje podróżnicze użytkownika
- Dostępny czas na wycieczkę
- Realne czasy zwiedzania atrakcji i przemieszczania się między nimi
- Dni zamknięcia atrakcji i świąt
- Proponowane atrakcje wskazane przez użytkownika

Aplikacja zmniejsza barierę wejścia w planowanie wycieczek, umożliwiając użytkownikom szybkie uzyskanie szczegółowego planu podróży bez potrzeby czasochłonnych badań i złożonej logistyki.

## 3. Wymagania funkcjonalne

### 3.1 System kont użytkownika

1. Rejestracja użytkownika:

   - Zbieranie danych: imię, nazwisko, email, płeć
   - Wymagania dla haseł: minimum 8 znaków, co najmniej jedna wielka litera, cyfra i znak specjalny
   - Zabezpieczenie formularza logowania za pomocą CAPTCHA
   - Aktywacja konta poprzez link wysyłany na adres email

2. Logowanie i zarządzanie kontem:

   - Logowanie za pomocą email i hasła
   - Resetowanie hasła przez link wysyłany na email (ważność linku: 1 godzina)
   - Możliwość aktualizacji danych profilu

3. Profil użytkownika:
   - Zapisywanie preferencji turystycznych: ulubiony segment, typ segmentu, ulubione kierunki, typ wycieczki (objazdowa/wypoczynek), typ transportu
   - Wyświetlanie statystyk: liczba polubień, liczba wygenerowanych planów

### 3.2 System notatek i planów podróży

1. Tworzenie notatek:

   - Formularz umożliwiający wprowadzenie: miejsca docelowego, typu segmentu, typu transportu, długości wycieczki (1-5 dni), pożądanych atrakcji
   - Ograniczenia: maksimum 5000 znaków dla pola atrakcji, po 500 znaków dla pozostałych pól
   - Możliwość zapisania wersji roboczej planu

2. Generowanie planów przez AI:

   - Konwersja notatek na szczegółowy plan podróży
   - Uwzględnianie preferencji użytkownika z profilu
   - Uwzględnianie średniego czasu chodu i zwiedzania atrakcji
   - Uwzględnianie dni zamknięcia atrakcji i świąt
   - Proponowanie alternatywnych atrakcji w przypadku niedostępności miejsc
   - Limit: maksymalnie 2 generowane plany dziennie per użytkownik
   - Maksymalny czas generowania planu: 3 minuty

3. Zarządzanie planami:
   - Ustawianie statusu planu jako publiczny (domyślnie) lub prywatny
   - Eksport planu do formatu PDF
   - Przeglądanie historii własnych planów
   - Możliwość edycji wygenerowanego planu podróży

### 3.3 Interakcja z planami publicznymi

1. Przeglądanie planów:

   - Lista dostępnych publicznie planów podróży
   - Wyświetlanie autora planu (imię i pierwsza litera nazwiska)
   - Filtrowanie planów według: typu segmentu, miejsca, długości podróży, liczby polubień
   - Sortowanie planów według: liczby polubień, długości podróży

2. Interakcja z planami:
   - Możliwość polubienia planów innych użytkowników
   - Brak możliwości komentowania planów

### 3.4 Panel administratora

1. Monitorowanie:

   - Liczba użytkowników
   - Liczba planów per użytkownik
   - Całkowita liczba planów w systemie

2. Zarządzanie błędami:
   - Powiadomienia email o błędach AI
   - Logowanie błędów systemu

### 3.5 Integracje i API

1. Integracja z API AI:

   - Komunikacja z modelami przez usługę Openrouter.ai
   - Cache'owanie popularnych zapytań do AI

2. Integracje zewnętrzne:
   - API pogodowe
   - API map miejsca docelowego

## 4. Granice produktu

### 4.1 Co wchodzi w zakres MVP

- Zapisywanie, odczytywanie, przeglądanie i usuwanie notatek o przyszłych wycieczkach
- System kont użytkowników z profilami zawierającymi preferencje turystyczne
- Generowanie planów podróży przez AI na podstawie notatek
- Wyświetlanie planów podróży z uwzględnieniem czasu zwiedzania i przemieszczania się
- Możliwość ustawienia planów jako publiczne lub prywatne
- Filtrowanie i sortowanie publicznych planów podróży
- Prosty panel administratora z podstawowymi metrykami
- Eksport planów do PDF
- Funkcja polubienia planów innych użytkowników

### 4.2 Co NIE wchodzi w zakres MVP

- Współdzielenie planów wycieczkowych między kontami
- Bogata obsługa i analiza multimediów (np. zdjęć miejsc do odwiedzenia)
- Zaawansowane planowanie czasu i logistyki
- Komentowanie planów innych użytkowników
- Wyszukiwanie planów według słów kluczowych
- Integracja z systemami rezerwacji (hotele, bilety)
- System powiadomień dla użytkowników
- Wsparcie dla wielojęzyczności
- Uwzględnianie budżetu w planach podróży

### 4.3 Ograniczenia techniczne

- Czas trwania wycieczek: minimum 1 dzień, maksimum 5 dni
- Limit generowania planów: maksymalnie 2 dziennie per użytkownik
- Maksymalny czas generowania planu: 3 minuty
- Maksymalny czas ładowania strony: 2 minuty
- Ograniczenie wielkości pól: maksimum 5000 znaków dla atrakcji, po 500 dla pozostałych pól

## 5. Historyjki użytkowników

### Zarządzanie kontem

#### US-001: Rejestracja konta

- Jako nowy użytkownik, chcę zarejestrować konto, aby móc korzystać z funkcjonalności aplikacji.
- Kryteria akceptacji:
  1. Użytkownik może wypełnić formularz rejestracyjny z danymi: imię, nazwisko, email, płeć i hasło.
  2. System weryfikuje, czy email nie jest już w użyciu.
  3. System wymaga hasła o długości minimum 8 znaków, zawierającego co najmniej jedną wielką literę, jedną cyfrę i jeden znak specjalny.
  4. Formularz jest zabezpieczony przez CAPTCHA.
  5. Po rejestracji system wysyła email z linkiem aktywacyjnym.
  6. Konto nie jest aktywne do momentu kliknięcia w link aktywacyjny.
  7. Link aktywacyjny pozostaje ważny przez 24 godziny.

#### US-002: Logowanie do systemu

- Jako zarejestrowany użytkownik, chcę zalogować się do aplikacji, aby uzyskać dostęp do moich planów podróży.
- Kryteria akceptacji:
  1. Użytkownik może zalogować się podając email i hasło.
  2. System weryfikuje poprawność danych logowania.
  3. Formularz logowania jest zabezpieczony przez CAPTCHA.
  4. Po 5 nieudanych próbach logowania konto jest tymczasowo blokowane na 30 minut.
  5. Użytkownik jest przekierowywany do strony głównej po udanym logowaniu.

#### US-003: Odzyskiwanie hasła

- Jako użytkownik, który zapomniał hasła, chcę zresetować moje hasło, aby odzyskać dostęp do konta.
- Kryteria akceptacji:
  1. Użytkownik może kliknąć w link "Zapomniałem hasła" na stronie logowania.
  2. System prosi o podanie adresu email.
  3. System wysyła email z linkiem do resetowania hasła (ważny przez 1 godzinę).
  4. Po kliknięciu w link użytkownik może ustawić nowe hasło.
  5. Nowe hasło musi spełniać te same wymagania co przy rejestracji.
  6. Po zmianie hasła użytkownik jest przekierowywany na stronę logowania.

#### US-004: Uzupełnienie preferencji w profilu

- Jako zalogowany użytkownik, chcę uzupełnić moje preferencje turystyczne, aby otrzymywać lepiej dopasowane plany wycieczek.
- Kryteria akceptacji:
  1. Użytkownik może wypełnić formularz preferencji zawierający: ulubiony segment, typ segmentu, ulubione kierunki, typ wycieczki, typ transportu.
  2. System zapisuje preferencje w profilu użytkownika.
  3. Użytkownik może w dowolnym momencie zaktualizować swoje preferencje.
  4. System potwierdza zapisanie preferencji.

#### US-005: Przeglądanie statystyk użytkownika

- Jako zalogowany użytkownik, chcę przeglądać statystyki moich planów podróży, aby śledzić moją aktywność.
- Kryteria akceptacji:
  1. Użytkownik może zobaczyć liczbę wygenerowanych planów.
  2. Użytkownik może zobaczyć łączną liczbę polubień swoich planów.
  3. Użytkownik może zobaczyć liczbę pozostałych generowań planów na dany dzień.
  4. Statystyki są aktualizowane w czasie rzeczywistym.

### Zarządzanie notatkami i planami

#### US-006: Tworzenie notatek o planowanej wycieczce

- Jako zalogowany użytkownik, chcę utworzyć notatkę o planowanej wycieczce, aby później wygenerować szczegółowy plan.
- Kryteria akceptacji:
  1. Użytkownik może wypełnić formularz z danymi: miejsce docelowe, typ segmentu, typ transportu, długość wycieczki (1-5 dni), polecane atrakcje.
  2. System waliduje dane wejściowe pod kątem ograniczeń (max 5000 znaków dla atrakcji, max 500 znaków dla pozostałych pól).
  3. Użytkownik może zapisać notatkę jako wersję roboczą, jeśli nie wypełnił wszystkich wymaganych pól.
  4. System potwierdza zapisanie notatki.

#### US-007: Generowanie planu podróży przez AI

- Jako zalogowany użytkownik, chcę wygenerować szczegółowy plan podróży na podstawie mojej notatki, aby otrzymać gotowy harmonogram wycieczki.
- Kryteria akceptacji:
  1. Użytkownik może wybrać notatkę i zainicjować generowanie planu.
  2. System weryfikuje, czy użytkownik nie przekroczył limitu 2 generowań dziennie.
  3. System informuje użytkownika o szacowanym czasie generowania.
  4. System generuje plan uwzględniający: średni czas zwiedzania atrakcji, czas przemieszczania się, dni zamknięcia i święta.
  5. System proponuje alternatywne atrakcje w przypadku niedostępności wskazanych miejsc.
  6. Generowanie nie przekracza 3 minut.
  7. Użytkownik otrzymuje powiadomienie o zakończeniu generowania.
  8. Plan zawiera trasę z zaznaczonymi punktami na mapie.

#### US-008: Zapisywanie wersji roboczej planu

- Jako zalogowany użytkownik, chcę zapisać niedokończony plan jako wersję roboczą, aby móc wrócić do niego później.
- Kryteria akceptacji:
  1. System automatycznie zapisuje stan formularza jako wersję roboczą, jeśli nie wypełniono wszystkich wymaganych pól.
  2. Użytkownik może ręcznie zapisać plan jako wersję roboczą.
  3. Wersje robocze są wyraźnie oznaczone na liście planów użytkownika.
  4. Użytkownik może kontynuować pracę nad wersją roboczą w dowolnym momencie.

#### US-009: Zarządzanie statusem planu (publiczny/prywatny)

- Jako zalogowany użytkownik, chcę ustawić mój plan jako publiczny lub prywatny, aby kontrolować jego widoczność dla innych.
- Kryteria akceptacji:
  1. Domyślnie wszystkie plany są ustawione jako publiczne.
  2. Użytkownik może zmienić status planu z publicznego na prywatny i odwrotnie.
  3. Plany prywatne są widoczne tylko dla ich twórcy.
  4. Plany publiczne są dostępne w wyszukiwarce i mogą być przeglądane przez innych użytkowników.

#### US-010: Eksport planu do PDF

- Jako zalogowany użytkownik, chcę wyeksportować mój plan podróży do pliku PDF, aby mieć do niego dostęp offline.
- Kryteria akceptacji:
  1. Użytkownik może wybrać opcję eksportu planu do PDF.
  2. Wygenerowany PDF zawiera wszystkie szczegóły planu, w tym mapę i opisy.
  3. PDF jest sformatowany w sposób czytelny i przyjazny do druku.
  4. System potwierdza pomyślne wygenerowanie PDF i udostępnia link do pobrania.

#### US-011: Przeglądanie historii planów

- Jako zalogowany użytkownik, chcę przeglądać historię moich planów podróży, aby wrócić do wcześniej wygenerowanych planów.
- Kryteria akceptacji:
  1. Użytkownik może zobaczyć listę wszystkich swoich planów podróży.
  2. Lista zawiera zarówno plany publiczne, jak i prywatne.
  3. Użytkownik może filtrować plany według statusu (publiczny/prywatny) i daty utworzenia.
  4. Użytkownik może usunąć wybrane plany z historii.

#### US-012: Usuwanie planu

- Jako zalogowany użytkownik, chcę usunąć mój plan podróży, jeśli nie jest mi już potrzebny.
- Kryteria akceptacji:
  1. Użytkownik może wybrać opcję usunięcia planu.
  2. System wymaga potwierdzenia operacji.
  3. Po usunięciu plan nie jest już dostępny dla użytkownika ani dla innych osób (jeśli był publiczny).
  4. System potwierdza pomyślne usunięcie planu.

### Interakcja z planami publicznymi

#### US-013: Przeglądanie publicznych planów

- Jako użytkownik, chcę przeglądać publicznie dostępne plany podróży, aby znaleźć inspirację dla własnych wycieczek.
- Kryteria akceptacji:
  1. Użytkownik może przeglądać listę publicznych planów podróży.
  2. Dla każdego planu wyświetlane są: tytuł, miejsce docelowe, długość wycieczki, autor (imię i pierwsza litera nazwiska), liczba polubień.
  3. System ładuje plany porcjami (paginacja) dla lepszej wydajności.
  4. Czas ładowania strony nie przekracza 2 minut.

#### US-014: Filtrowanie i sortowanie planów

- Jako użytkownik, chcę filtrować i sortować publiczne plany, aby łatwiej znaleźć interesujące mnie propozycje.
- Kryteria akceptacji:
  1. Użytkownik może filtrować plany według: typu segmentu, miejsca, długości podróży, liczby polubień.
  2. Użytkownik może sortować plany według: liczby polubień, długości podróży.
  3. Filtry i sortowanie można łączyć.
  4. System dynamicznie aktualizuje listę wyników po zmianie filtrów.

#### US-015: Polubienie planu

- Jako zalogowany użytkownik, chcę polubić interesujący mnie plan podróży, aby wyrazić uznanie dla jego autora.
- Kryteria akceptacji:
  1. Użytkownik może kliknąć przycisk "Lubię to" przy wybranym planie.
  2. Użytkownik może cofnąć polubienie.
  3. Licznik polubień jest aktualizowany w czasie rzeczywistym.
  4. Użytkownik nie może polubić własnego planu.

#### US-016: Przeglądanie szczegółów planu

- Jako użytkownik, chcę zobaczyć szczegóły wybranego planu podróży, aby ocenić jego przydatność.
- Kryteria akceptacji:
  1. Użytkownik może wybrać plan z listy, aby zobaczyć jego szczegóły.
  2. Szczegóły zawierają: mapę z trasą, listę atrakcji z czasami zwiedzania, czas przemieszczania się między atrakcjami.
  3. Wszystkie dni planu są wyraźnie oznaczone i rozdzielone.
  4. Użytkownik może wrócić do listy planów z widoku szczegółów.

### Panel administratora

#### US-017: Monitorowanie podstawowych metryk

- Jako administrator systemu, chcę monitorować podstawowe metryki aplikacji, aby śledzić jej wydajność i wykorzystanie.
- Kryteria akceptacji:
  1. Administrator może zobaczyć liczbę zarejestrowanych użytkowników.
  2. Administrator może zobaczyć średnią liczbę planów per użytkownik.
  3. Administrator może zobaczyć całkowitą liczbę planów w systemie.
  4. Dane są aktualizowane w czasie rzeczywistym.

#### US-018: Zarządzanie błędami AI

- Jako administrator systemu, chcę otrzymywać powiadomienia o błędach AI, aby móc reagować na problemy.
- Kryteria akceptacji:
  1. System wysyła powiadomienia email o błędach AI do administratora.
  2. Powiadomienia zawierają szczegóły błędu i kontekst (ID użytkownika, dane wejściowe).
  3. System prowadzi dziennik błędów AI dostępny w panelu administratora.
  4. Administrator może filtrować błędy według typu i daty wystąpienia.

## 6. Metryki sukcesu

### 6.1 Główne wskaźniki sukcesu

1. Zaangażowanie użytkowników:

   - 90% użytkowników posiada wypełnione preferencje turystyczne w swoim profilu
   - 75% użytkowników generuje 3 lub więcej planów wycieczek na rok
   - Liczba polubień planów (wskaźnik jakości i przydatności wygenerowanych planów)

2. Wydajność systemu:

   - Średni czas generowania planu poniżej 2 minut
   - Procent udanych generacji planów (bez błędów AI) powyżej 95%
   - Średni czas ładowania strony poniżej 1 minuty

3. Wzrost bazy użytkowników:
   - Liczba nowych rejestracji miesięcznie
   - Wskaźnik retencji użytkowników (odsetek użytkowników wracających do aplikacji po miesiącu)

### 6.2 Mierzenie sukcesu

1. Zbieranie danych:

   - Automatyczne gromadzenie metryk użytkowania
   - Monitorowanie błędów i problemów wydajnościowych
   - Dashboard administratora z kluczowymi wskaźnikami

2. Ocena planów:

   - Monitorowanie liczby polubień jako wskaźnika jakości planów
   - Analiza wykorzystania funkcji eksportu do PDF (wskaźnik praktycznej użyteczności planów)

3. Cykl wdrożenia:
   - MVP musi zostać wdrożone do 16.05.2025
   - Ocena sukcesu MVP nastąpi po 3 miesiącach od wdrożenia
   - Decyzja o rozwoju funkcjonalności post-MVP na podstawie metryk z pierwszych 3 miesięcy
