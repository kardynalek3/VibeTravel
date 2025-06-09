# Architektura UI dla VibeTravels

## 1. Przegląd struktury UI

Architektura UI dla VibeTravels wykorzystuje Astro 5 z komponentami React dla elementów interaktywnych, Tailwind CSS dla stylizacji oraz komponenty Shadcn/ui dla spójności interfejsu. Aplikacja podzielona jest na obszary publiczne i chronione, z dedykowanymi layoutami dla różnych typów stron. Struktura opiera się na następujących zasadach:

- Podział na publiczną i chronioną część aplikacji
- Hierarchia layoutów dla różnych kontekstów (publiczny, chroniony, administracyjny)
- Responsywność z podejściem mobile-first
- Asynchroniczne generowanie planów z paskiem postępu
- Obsługa błędów na trzech poziomach (HTTP, biznesowe, walidacji)
- Wielojęzyczność z przełącznikiem w nagłówku
- Optymalizacja jako PWA z możliwością pracy offline

Aplikacja wykorzystuje Astro routing do nawigacji, a uwierzytelnianie oparte jest na loginie i haśle z wykorzystaniem Supabase Auth. Eksport planów do PDF odbywa się po stronie serwera z zachowaniem kolorystyki i schematu aplikacji.

## 2. Lista widoków

### Widoki publiczne

#### Strona główna z logowaniem (/)
- **Główny cel**: Wprowadzenie do aplikacji i umożliwienie logowania
- **Kluczowe informacje**: Opis aplikacji, korzyści z korzystania z platformy
- **Kluczowe komponenty**:
  - Formularz logowania z walidacją
  - Linki do rejestracji i resetowania hasła
  - Sekcja z przykładowymi planami podróży
  - Hero section z call-to-action
- **UX, dostępność, bezpieczeństwo**:
  - Wyraźne komunikaty błędów logowania
  - Zabezpieczenie przed atakami brute force
  - Obsługa logowania z klawiatury

#### Rejestracja (/register)
- **Główny cel**: Utworzenie nowego konta użytkownika
- **Kluczowe informacje**: Wymagania dotyczące danych użytkownika
- **Kluczowe komponenty**:
  - Formularz rejestracyjny (imię, nazwisko, email, płeć, hasło)
  - CAPTCHA
  - Wskaźnik siły hasła
  - Link powrotu do logowania
- **UX, dostępność, bezpieczeństwo**:
  - Walidacja w czasie rzeczywistym
  - Wyraźne komunikaty błędów przy polach
  - Informacja o polityce prywatności

#### Resetowanie hasła (/password-reset)
- **Główny cel**: Inicjacja procesu resetowania hasła
- **Kluczowe informacje**: Instrukcje procesu resetowania
- **Kluczowe komponenty**:
  - Prosty formularz z polem email
  - Komunikat potwierdzający wysłanie linku
  - Link powrotu do logowania
- **UX, dostępność, bezpieczeństwo**:
  - Neutralne komunikaty (nie ujawniające czy email istnieje)
  - Zabezpieczenie przed masowym resetowaniem haseł

#### Potwierdzenie resetowania hasła (/password-reset-confirm)
- **Główny cel**: Ustawienie nowego hasła
- **Kluczowe informacje**: Wymagania dotyczące hasła
- **Kluczowe komponenty**:
  - Formularz z polami na nowe hasło i potwierdzenie
  - Wskaźnik siły hasła
  - Komunikat sukcesu
- **UX, dostępność, bezpieczeństwo**:
  - Zabezpieczenie przed wykorzystaniem przeterminowanych linków
  - Wyraźne komunikaty o sukcesie/błędzie

#### Weryfikacja email (/email-verification)
- **Główny cel**: Potwierdzenie adresu email
- **Kluczowe informacje**: Status weryfikacji
- **Kluczowe komponenty**:
  - Komunikat o statusie weryfikacji
  - Przycisk do logowania po pomyślnej weryfikacji
  - Opcja ponownego wysłania linku
- **UX, dostępność, bezpieczeństwo**:
  - Ochrona przed wielokrotną weryfikacją
  - Jasne komunikaty o sukcesie/błędzie

#### Publiczne plany podróży (/plans)
- **Główny cel**: Przeglądanie i filtrowanie publicznych planów
- **Kluczowe informacje**: Lista planów z podstawowymi danymi
- **Kluczowe komponenty**:
  - Filtry (segment, miejsce, długość, liczba polubień)
  - Sortowanie (polubienia, długość)
  - Karty planów z miniaturami
  - Paginacja
- **UX, dostępność, bezpieczeństwo**:
  - Skeletony ładowania podczas pobierania danych
  - Zapamiętywanie filtrów w sesji
  - Responsywny układ kart (grid/lista)

#### Szczegóły publicznego planu (/plans/[id])
- **Główny cel**: Wyświetlenie szczegółów planu podróży
- **Kluczowe informacje**: Dane planu, mapa, harmonogram
- **Kluczowe komponenty**:
  - Mapa z trasą i punktami
  - Zakładki dla dni podróży
  - Oś czasu z harmonogramem
  - Przycisk polubienia (dla zalogowanych)
  - Informacje o autorze
- **UX, dostępność, bezpieczeństwo**:
  - Blokada dostępu do prywatnych planów innych użytkowników
  - Stopniowe ładowanie mapy i szczegółów

### Widoki chronione

#### Dashboard użytkownika (/dashboard)
- **Główny cel**: Zapewnienie przeglądu aktywności i szybkiego dostępu do funkcji
- **Kluczowe informacje**: Statystyki, ostatnie notatki, ostatnie plany
- **Kluczowe komponenty**:
  - Karty statystyk (liczba planów, polubień)
  - Licznik pozostałych generowań na dzień
  - Lista ostatnich notatek z akcjami
  - Lista ostatnich planów z akcjami
  - Przyciski szybkich akcji
- **UX, dostępność, bezpieczeństwo**:
  - Skeletony ładowania dla sekcji
  - Zabezpieczenie routingu middleware'm

#### Profil użytkownika (/profile)
- **Główny cel**: Zarządzanie danymi i preferencjami
- **Kluczowe informacje**: Dane osobowe, preferencje podróżnicze
- **Kluczowe komponenty**:
  - Formularz danych osobowych
  - Formularz preferencji podróżniczych
  - Wizualizacja statystyk
  - Przyciski zapisania zmian
- **UX, dostępność, bezpieczeństwo**:
  - Walidacja w czasie rzeczywistym
  - Potwierdzenia zapisania zmian
  - Zabezpieczenie danych osobowych

#### Lista notatek (/notes)
- **Główny cel**: Przeglądanie i zarządzanie notatkami
- **Kluczowe informacje**: Lista notatek użytkownika
- **Kluczowe komponenty**:
  - Filtry (status, destynacja)
  - Lista notatek w formie kart
  - Przyciski akcji (podgląd, edycja, usuwanie, generowanie)
  - Przycisk tworzenia nowej notatki
- **UX, dostępność, bezpieczeństwo**:
  - Skeletony ładowania podczas pobierania danych
  - Potwierdzenia usuwania
  - Komunikaty o pustym stanie

#### Tworzenie/edycja notatki (/notes/new, /notes/[id]/edit)
- **Główny cel**: Tworzenie lub edycja notatki o wycieczce
- **Kluczowe informacje**: Formularz z polami notatki
- **Kluczowe komponenty**:
  - Pole wyszukiwania destynacji z autouzupełnianiem
  - Pola wyboru segmentu, transportu, długości
  - Pole tekstowe atrakcji z licznikiem znaków
  - Przyciski zapisania (wersja robocza/kompletna)
- **UX, dostępność, bezpieczeństwo**:
  - Walidacja React Hook Form z zod
  - Automatyczne zapisywanie wersji roboczych
  - Ostrzeżenia przed utratą zmian

#### Szczegóły notatki (/notes/[id])
- **Główny cel**: Wyświetlenie szczegółów notatki
- **Kluczowe informacje**: Wszystkie dane notatki
- **Kluczowe komponenty**:
  - Prezentacja danych notatki
  - Przyciski akcji (edycja, usuwanie)
  - Przycisk generowania planu
  - Informacja o limicie generowań
- **UX, dostępność, bezpieczeństwo**:
  - Blokada przycisku generowania przy braku limitu
  - Potwierdzenia usuwania
  - Skeletony ładowania

#### Plany użytkownika (/plans/my)
- **Główny cel**: Przeglądanie i zarządzanie własnymi planami
- **Kluczowe informacje**: Lista planów użytkownika
- **Kluczowe komponenty**:
  - Filtry (status, destynacja, segment)
  - Lista planów w formie kart
  - Przyciski akcji (podgląd, edycja, usuwanie, eksport)
  - Status publiczny/prywatny z możliwością zmiany
- **UX, dostępność, bezpieczeństwo**:
  - Skeletony ładowania podczas pobierania danych
  - Potwierdzenia usuwania
  - Komunikaty o pustym stanie

#### Szczegóły planu użytkownika (/plans/[id])
- **Główny cel**: Wyświetlenie szczegółów własnego planu
- **Kluczowe informacje**: Dane planu, mapa, harmonogram
- **Kluczowe komponenty**:
  - Mapa z trasą i punktami
  - Zakładki dla dni podróży
  - Oś czasu z harmonogramem
  - Przyciski akcji (edycja, usuwanie, eksport, zmiana statusu)
  - Licznik polubień
- **UX, dostępność, bezpieczeństwo**:
  - Skeletony ładowania dla mapy i harmonogramu
  - Potwierdzenia usuwania i zmiany statusu
  - Zabezpieczenie routingu middleware'm

#### Proces generowania planu (/notes/[id]/generate-plan)
- **Główny cel**: Monitorowanie procesu generowania planu przez AI
- **Kluczowe informacje**: Postęp generowania, status
- **Kluczowe komponenty**:
  - Pasek postępu procentowego
  - Komunikaty o statusie generowania
  - Animacja podczas oczekiwania
  - Możliwość anulowania procesu
- **UX, dostępność, bezpieczeństwo**:
  - Automatyczne przekierowanie po zakończeniu
  - Możliwość pozostawienia procesu w tle
  - Komunikaty o błędach generowania

### Widoki administratora

#### Dashboard administratora (/admin/dashboard)
- **Główny cel**: Monitorowanie podstawowych metryk aplikacji
- **Kluczowe informacje**: Liczba użytkowników, planów, statystyki
- **Kluczowe komponenty**:
  - Karty z kluczowymi metrykami
  - Wykresy aktywności
  - Statystyki generowania planów
  - Skróty do zarządzania błędami
- **UX, dostępność, bezpieczeństwo**:
  - Ograniczenie dostępu tylko dla administratorów
  - Skeletony ładowania dla danych
  - Możliwość eksportu danych

#### Zarządzanie błędami AI (/admin/ai-errors)
- **Główny cel**: Przeglądanie i analiza błędów AI
- **Kluczowe informacje**: Lista błędów z detalami
- **Kluczowe komponenty**:
  - Filtry czasowe i typu błędu
  - Lista błędów z podstawowymi informacjami
  - Widok szczegółów błędu
  - Eksport listy błędów
- **UX, dostępność, bezpieczeństwo**:
  - Ograniczenie dostępu tylko dla administratorów
  - Paginacja wyników
  - Sortowanie i filtrowanie

### Widoki błędów

#### 404 - Nie znaleziono
- **Główny cel**: Informacja o nieistniejącej stronie
- **Kluczowe komponenty**:
  - Przyjazny komunikat o błędzie
  - Ilustracja odpowiednia do błędu
  - Przycisk powrotu do bezpiecznej lokalizacji

#### 500 - Błąd serwera
- **Główny cel**: Informacja o błędzie serwera
- **Kluczowe komponenty**:
  - Przyjazny komunikat o błędzie
  - Ilustracja odpowiednia do błędu
  - Przycisk powrotu do bezpiecznej lokalizacji

#### 403 - Brak dostępu
- **Główny cel**: Informacja o braku uprawnień
- **Kluczowe komponenty**:
  - Przyjazny komunikat o błędzie
  - Ilustracja odpowiednia do błędu
  - Przycisk powrotu do bezpiecznej lokalizacji

## 3. Mapa podróży użytkownika

### Rejestracja i logowanie
1. **Rejestracja nowego użytkownika**:
   - Strona główna → Przycisk "Zarejestruj się" → Formularz rejestracji → Wypełnienie danych → Potwierdzenie → Komunikat o wysłaniu linku weryfikacyjnego
   - Email z linkiem → Weryfikacja email → Komunikat o sukcesie → Przekierowanie do logowania
   - Logowanie → Uzupełnienie profilu → Dashboard

2. **Logowanie istniejącego użytkownika**:
   - Strona główna → Formularz logowania → Wypełnienie danych → Walidacja → Dashboard

3. **Resetowanie hasła**:
   - Strona główna → Link "Zapomniałem hasła" → Formularz resetowania → Podanie adresu email → Komunikat o wysłaniu linku
   - Email z linkiem → Formularz nowego hasła → Potwierdzenie → Komunikat o sukcesie → Logowanie

### Tworzenie planu podróży
1. **Tworzenie notatki i generowanie planu**:
   - Dashboard → Przycisk "Nowa notatka" → Formularz notatki → Wypełnienie danych → Zapisanie notatki
   - Lista notatek → Wybór notatki → Przycisk "Generuj plan" → Ekran procesu generowania z paskiem postępu
   - Automatyczne przekierowanie do szczegółów planu po zakończeniu → Przeglądanie planu → Opcjonalnie: Eksport do PDF

2. **Edycja istniejącej notatki i regeneracja planu**:
   - Dashboard → Lista notatek → Wybór notatki → Przycisk "Edytuj" → Formularz edycji → Zapisanie zmian
   - Szczegóły notatki → Przycisk "Generuj plan" → Ekran procesu generowania → Szczegóły planu

### Zarządzanie planami
1. **Przeglądanie i zarządzanie planami**:
   - Dashboard → "Moje plany" → Lista planów → Filtrowanie/sortowanie planów
   - Wybór planu → Szczegóły planu → Możliwe akcje: Edycja, Eksport do PDF, Zmiana statusu, Usunięcie

2. **Zmiana statusu planu**:
   - Lista planów → Wybór planu → Przełącznik statusu lub
   - Szczegóły planu → Przycisk zmiany statusu → Potwierdzenie → Aktualizacja statusu

3. **Eksport planu do PDF**:
   - Szczegóły planu → Przycisk "Eksportuj do PDF" → Pobranie pliku PDF

### Przeglądanie publicznych planów
1. **Przeglądanie i filtrowanie publicznych planów**:
   - Nawigacja → "Publiczne plany" → Lista planów → Filtrowanie według segmentu/miejsca/długości/polubień
   - Wybór planu → Szczegóły publicznego planu

2. **Interakcja z publicznym planem**:
   - Szczegóły publicznego planu → Przycisk "Lubię to" → Aktualizacja licznika polubień
   - Opcjonalnie: Szczegóły publicznego planu → Zakładki dni → Przeglądanie harmonogramu

### Zarządzanie profilem
1. **Edycja danych i preferencji**:
   - Dashboard → "Profil" → Formularz danych osobowych → Edycja danych → Zapisanie zmian
   - Formularz preferencji podróżniczych → Edycja preferencji → Zapisanie zmian

### Administracja
1. **Monitorowanie metryk**:
   - Logowanie jako admin → Dashboard administratora → Przeglądanie metryk i statystyk

2. **Zarządzanie błędami AI**:
   - Dashboard administratora → "Błędy AI" → Lista błędów → Filtrowanie/sortowanie
   - Wybór błędu → Szczegóły błędu → Eksport listy błędów

## 4. Układ i struktura nawigacji

### Hierarchia layoutów
Aplikacja wykorzystuje hierarchiczną strukturę layoutów:

1. **MainLayout** (bazowy dla wszystkich stron):
   - Podstawowa struktura HTML
   - Meta tagi i SEO
   - Przełącznik języków w nagłówku
   - Obsługa PWA

2. **PublicLayout** (dla stron dostępnych bez logowania):
   - Dziedziczy z MainLayout
   - Nagłówek z logo, linkami do rejestracji/logowania
   - Stopka z linkami do informacji prawnych

3. **ProtectedLayout** (dla stron wymagających uwierzytelnienia):
   - Dziedziczy z MainLayout
   - Nagłówek z logo, nawigacją główną, wylogowaniem
   - Sidebar z nawigacją kontekstową
   - Pasek powiadomień

4. **AdminLayout** (dla panelu administratora):
   - Dziedziczy z ProtectedLayout
   - Rozszerzona nawigacja z opcjami administracyjnymi
   - Dodatkowe zabezpieczenia dostępu

### Nawigacja główna
Struktura nawigacji dostosowuje się do stanu uwierzytelnienia użytkownika:

1. **Nawigacja dla niezalogowanych użytkowników**:
   - Logo (link do strony głównej)
   - Link do publicznych planów
   - Przycisk logowania
   - Przycisk rejestracji
   - Wybór języka

2. **Nawigacja dla zalogowanych użytkowników**:
   - Logo (link do dashboardu)
   - Dashboard
   - Notatki
   - Moje plany
   - Publiczne plany
   - Profil
   - Wyloguj
   - Wybór języka

3. **Nawigacja dla administratorów** (dodatkowe opcje):
   - Dashboard administratora
   - Zarządzanie błędami AI

### Responsywność i mobilna nawigacja
- Na urządzeniach mobilnych nawigacja główna chowa się za przyciskiem hamburger
- Sidebar w ProtectedLayout zamienia się w panel wysuwany z boku ekranu
- Komponenty dostosowują się do rozmiaru ekranu (karty, formularze, mapy)

### Middleware nawigacyjny
- Middleware Astro weryfikuje uwierzytelnienie użytkownika
- Przekierowanie na stronę logowania przy próbie dostępu do chronionych zasobów
- Dodatkowa weryfikacja roli administratora dla panelu administracyjnego

## 5. Kluczowe komponenty

### Komponenty layoutu i nawigacji
1. **Header** - Nagłówek aplikacji z logo, nawigacją i kontrolkami użytkownika
2. **Footer** - Stopka z informacjami prawnymi i linkami pomocniczymi
3. **Sidebar** - Boczny panel nawigacyjny dla zalogowanych użytkowników
4. **LanguageSwitcher** - Przełącznik języków aplikacji
5. **Breadcrumbs** - Ścieżka nawigacyjna pokazująca aktualną lokalizację w aplikacji

### Komponenty formularzy
1. **AuthForm** - Bazowy komponent formularzy uwierzytelniania
2. **NoteForm** - Formularz tworzenia/edycji notatki
3. **ProfileForm** - Formularz edycji profilu i preferencji
4. **SearchDestination** - Komponent wyszukiwania destynacji z autouzupełnianiem
5. **FilterPanel** - Panel filtrów dla list notatek i planów

### Komponenty prezentacji danych
1. **PlanCard** - Karta planu podróży z podstawowymi informacjami
2. **NoteCard** - Karta notatki z podstawowymi informacjami
3. **PlanDetails** - Szczegółowy widok planu podróży
4. **DayTimeline** - Oś czasu dla pojedynczego dnia planu
5. **TripMap** - Mapa z trasą i punktami planu podróży
6. **StatisticsCard** - Karta z wizualizacją statystyk

### Komponenty informacyjne i interakcji
1. **LikeButton** - Przycisk polubienia planu
2. **ProgressBar** - Pasek postępu dla procesów asynchronicznych
3. **StatusBadge** - Etykieta statusu (publiczny/prywatny, wersja robocza)
4. **Toast** - Powiadomienia systemowe (sukces, błąd, informacja)
5. **Skeleton** - Komponenty szkieletowe podczas ładowania danych
6. **EmptyState** - Komunikat o braku danych z sugerowanymi akcjami
7. **ConfirmDialog** - Dialog potwierdzenia dla krytycznych operacji

### Komponenty biznesowe
1. **PlanGenerator** - Komponent zarządzający procesem generowania planu
2. **PDFExporter** - Komponent obsługujący eksport do PDF
3. **LimitCounter** - Licznik pozostałych generowań na dzień
4. **PasswordStrengthMeter** - Wskaźnik siły hasła
5. **PublicPrivateToggle** - Przełącznik statusu publiczny/prywatny 