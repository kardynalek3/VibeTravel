# Dokument wymagań produktu (PRD) - TTHotDesk

## 1. Przegląd produktu

TTHotDesk to responsywna aplikacja webowa służąca do rezerwacji biurek w przestrzeni biurowej. Aplikacja jest przeznaczona dla firmy zatrudniającej 60 pracowników i ma na celu rozwiązanie problemu związanego z brakiem wolnych miejsc pracy. System umożliwia użytkownikom przeglądanie interaktywnego planu biura zawierającego 33 biurka, rezerwację biurek na konkretne dni oraz anulowanie rezerwacji.

Aplikacja wykorzystuje podejście Mobile First, co zapewnia jej pełną funkcjonalność na różnych urządzeniach, w tym telefonach komórkowych i tabletach. System jest wielojęzyczny, dostępny w trzech językach: polskim, angielskim i ukraińskim.

TTHotDesk przewiduje dwie główne role użytkowników:
- Zwykły użytkownik - może przeglądać plan biura, rezerwować i anulować rezerwacje
- Administrator - posiada dodatkowe uprawnienia do zarządzania kontami użytkowników, blokowania biurek oraz monitorowania aktywności w systemie

Termin realizacji MVP aplikacji to 16.05.2025.

## 2. Problem użytkownika

Głównym problemem, który rozwiązuje TTHotDesk, jest brak dostępnych biurek do pracy w biurze. Pracownicy napotykają trudności z znalezieniem wolnego miejsca, co prowadzi do:
- Straty czasu na szukanie dostępnego biurka
- Frustracji związanej z niepewnością dostępności miejsca pracy
- Nieefektywnego wykorzystania przestrzeni biurowej
- Konfliktów między pracownikami o miejsca pracy

TTHotDesk rozwiązuje te problemy poprzez wprowadzenie przejrzystego systemu rezerwacji biurek, który umożliwia pracownikom:
- Planowanie z wyprzedzeniem miejsca pracy
- Wizualizację dostępnych biurek na interaktywnym planie
- Łatwe zarządzanie własnymi rezerwacjami
- Eliminację niepewności związanej z dostępnością miejsca pracy

## 3. Wymagania funkcjonalne

### 3.1 Podstawowe funkcjonalności

1. Logowanie do systemu
   - Zabezpieczenie za pomocą Google reCAPTCHA v3
   - Wymagania dotyczące haseł: minimum 8 znaków, co najmniej jedna wielka litera, jedna cyfra i jeden znak specjalny
   - Możliwość resetowania hasła poprzez link wysyłany na adres email (ważność linku: 1 godzina)

2. Interaktywny plan biura
   - Wizualizacja 33 biurek w formie prostokątów z numerami
   - Kolorystyczne oznaczenie statusu biurek:
     - Zielone: wolne biurka (z numerem). Po najechaniu wyświetla się napis zarezerwuj.
     - Czerwone: zajęte biurka (z imieniem i pierwszą literą nazwiska rezerwującego)
     - Niebieskie: zablokowane biurka (z informacją o osobie, która je zarezerwowała)
   - Możliwość rezerwacji biurka poprzez kliknięcie na planie

3. System rezerwacji
   - Rezerwacja biurka na cały dzień
   - Widok tygodniowy z możliwością nawigacji między tygodniami
   - Odblokowywanie rezerwacji na nowy tydzień w niedzielę poprzedzającą o godzinie 10:00
   - Możliwość anulowania rezerwacji do godziny 9:00 w dniu rezerwacji

4. Panel administratora
   - Zarządzanie kontami użytkowników:
     - Ręczne dodawanie (imię, nazwisko, email, język)
     - Import z pliku CSV z walidacją
   - Blokowanie biurek:
     - Czasowe (z określonym terminem)
     - Stałe
     - Możliwość usunięcia blokady
   - Rezerwacja biurek dla konkretnych osób
   - Panel aktywności użytkowników (akcje, biurko, data, godzina)

5. System powiadomień
   - Powiadomienia email o:
     - Potwierdzeniu rejestracji z linkiem do ustawienia hasła
     - Udanej rezerwacji biurka (numer biurka, data)
     - Anulowaniu rezerwacji (numer biurka, data)
     - Błędach systemu (dla administratora, z trace błędu)

6. Wielojęzyczność
   - Dostępne języki: polski, angielski, ukraiński
   - Zarządzanie poprzez pliki tłumaczeń
   - Wybór języka w nagłówku strony
   - Możliwość ustawienia preferowanego języka w profilu użytkownika

### 3.2 Wymagania niefunkcjonalne

1. Technologie
   - Backend: Laravel
   - Frontend: Blade
   - Baza danych: MY-SQL
   - AI - generowanie planu biurek na podstawie przesłanego planu biura w pliku JPG: gotowe biblioteki JS do przetworzenia mapy biura z pliku jpg na warstwę graficzną planu biurek strony rezerwacji
   - CI/CD: Github Actions do tworzenia pipeline’ów CI/CD

2. Bezpieczeństwo
   - Szyfrowanie haseł w bazie danych
   - Ochrona przed atakami (SQL Injection i inne)
   - Walidacja danych po stronie klienta i serwera
   - Sesje z czasem wygaśnięcia

3. Interfejs użytkownika
   - Responsywny design z podejściem Mobile First
   - Kolorystyka: niebieski i pomarańczowy
   - Intuicyjny i przejrzysty układ
   - Kompatybilność ze wszystkimi popularnymi przeglądarkami

4. Wydajność
   - Brak ściśle określonych wymagań wydajnościowych

## 4. Granice produktu

### 4.1 Co NIE wchodzi w zakres MVP

1. Aplikacja mobilna (natywna)
2. Uwierzytelnianie dwuskładnikowe
3. Historia rezerwacji użytkowników
4. Algorytmy sugerujące najlepsze miejsce do pracy
5. Raporty wykorzystania biurek

### 4.2 Integracje

Aplikacja TTHotDesk nie będzie integrowana z innymi systemami w ramach MVP.

### 4.3 Ograniczenia

1. Czas realizacji: do 16.05.2025
2. Dostępny czas pracy: maksymalnie 2 godziny dziennie
3. Brak określonych wymagań dotyczących wydajności systemu

## 5. Historyjki użytkowników

### 5.1 Logowanie i zarządzanie kontem

#### US-001: Logowanie do systemu
Jako użytkownik, chcę zalogować się do systemu, aby uzyskać dostęp do funkcji rezerwacji biurek.

Kryteria akceptacji:
- Użytkownik może wprowadzić adres email i hasło
- System weryfikuje poprawność danych logowania
- System chroni formularz logowania za pomocą Google reCAPTCHA v3
- W przypadku poprawnego logowania, użytkownik jest przekierowany do widoku rezerwacji biurek
- W przypadku błędnych danych, system wyświetla odpowiedni komunikat

#### US-002: Resetowanie hasła
Jako użytkownik, chcę zresetować swoje hasło, gdy go zapomnę, aby nadal móc korzystać z systemu.

Kryteria akceptacji:
- Użytkownik może kliknąć opcję "Zapomniałem hasła" na ekranie logowania
- System prosi o podanie adresu email
- System wysyła email z unikalnym linkiem do resetowania hasła
- Link jest ważny przez 1 godzinę
- Po kliknięciu w link, użytkownik może ustawić nowe hasło
- Nowe hasło musi spełniać wymagania bezpieczeństwa (min. 8 znaków, wielka litera, cyfra, znak specjalny)

#### US-003: Zmiana języka interfejsu
Jako użytkownik, chcę zmienić język interfejsu, aby korzystać z aplikacji w preferowanym przeze mnie języku.

Kryteria akceptacji:
- Użytkownik może wybrać język z rozwijanej listy w nagłówku strony
- Dostępne są trzy języki: polski, angielski i ukraiński
- Interfejs natychmiast aktualizuje się do wybranego języka
- Preferowany język jest zapisywany w profilu użytkownika

### 5.2 Rezerwacja biurek

#### US-004: Przeglądanie dostępnych biurek
Jako pracownik, chcę zobaczyć dostępne biurka na interaktywnym planie, aby wybrać odpowiednie miejsce do pracy.

Kryteria akceptacji:
- Po zalogowaniu, użytkownik widzi plan biura z 33 biurkami
- Biurka są oznaczone kolorami: zielone (wolne), czerwone (zajęte), niebieskie (zablokowane)
- Wolne biurka pokazują numer biurka
- Zajęte biurka pokazują imię i pierwszą literę nazwiska osoby rezerwującej
- Zablokowane biurka pokazują informację o osobie przypisanej

#### US-005: Nawigacja między tygodniami
Jako pracownik, chcę nawigować między tygodniami, aby planować rezerwacje z wyprzedzeniem.

Kryteria akceptacji:
- Użytkownik widzi widok tygodniowy z podziałem na poszczególne dni
- Dostępne są strzałki do nawigacji między tygodniami (w lewo - poprzedni tydzień, w prawo - następny tydzień)
- System blokuje możliwość rezerwacji na kolejny tydzień do niedzieli poprzedzającej
- System wyraźnie oznacza aktualny tydzień

#### US-006: Rezerwacja biurka
Jako pracownik, chcę zarezerwować biurko na konkretny dzień, aby mieć zapewnione miejsce do pracy.

Kryteria akceptacji:
- Użytkownik może kliknąć na wolne biurko na planie
- System wyświetla okno potwierdzenia rezerwacji
- Po potwierdzeniu, biurko zmienia kolor na czerwony i pokazuje dane rezerwującego
- System wysyła email potwierdzający rezerwację (numer biurka, data)
- W przypadku próby rezerwacji zajętego biurka, system wyświetla odpowiedni komunikat

#### US-007: Anulowanie rezerwacji
Jako pracownik, chcę anulować swoją rezerwację, gdy moje plany się zmieniły.

Kryteria akceptacji:
- Użytkownik może anulować własną rezerwację
- Anulowanie jest możliwe najpóźniej do godziny 9:00 w dniu rezerwacji
- Po anulowaniu, biurko zmienia kolor na zielony i staje się dostępne dla innych
- System wysyła email potwierdzający anulowanie rezerwacji
- Po godzinie 9:00 opcja anulowania jest niedostępna

### 5.3 Administracja systemem

#### US-008: Dodawanie pojedynczego użytkownika
Jako administrator, chcę ręcznie dodać nowego użytkownika, aby zapewnić mu dostęp do systemu.

Kryteria akceptacji:
- Administrator może wypełnić formularz z danymi użytkownika (imię, nazwisko, email, język)
- System waliduje poprawność wprowadzonych danych
- Po dodaniu, system wysyła email z linkiem do ustawienia hasła
- Nowy użytkownik pojawia się na liście użytkowników
- System uniemożliwia dodanie duplikatu (ten sam adres email)

#### US-009: Import użytkowników z CSV
Jako administrator, chcę zaimportować wielu użytkowników z pliku CSV, aby zaoszczędzić czas przy dodawaniu wielu kont.

Kryteria akceptacji:
- Administrator może przesłać plik CSV z danymi użytkowników
- System sprawdza poprawność formatu pliku
- System waliduje dane (poprawność emaili, unikalne adresy, język)
- System pokazuje podgląd danych przed finalnym importem
- Po imporcie, system wysyła emaile do wszystkich dodanych użytkowników
- System raportuje błędy importu, jeśli wystąpią

#### US-010: Blokowanie biurka
Jako administrator, chcę zablokować biurko, aby wyłączyć je z możliwości rezerwacji.

Kryteria akceptacji:
- Administrator może kliknąć na biurko i wybrać opcję blokowania
- Administrator może wybrać między blokadą czasową a stałą
- Przy blokadzie czasowej, administrator określa okres blokady
- Administrator może podać informację o osobie przypisanej do biurka
- Zablokowane biurko zmienia kolor na niebieski i pokazuje podaną informację
- Biurko nie może być zarezerwowane przez zwykłych użytkowników

#### US-011: Odblokowywanie biurka
Jako administrator, chcę odblokować wcześniej zablokowane biurko, aby umożliwić jego rezerwację.

Kryteria akceptacji:
- Administrator może kliknąć na zablokowane biurko i wybrać opcję odblokowania
- Po odblokowaniu, biurko zmienia kolor na zielony i staje się dostępne do rezerwacji
- System usuwa informację o osobie przypisanej

#### US-012: Rezerwacja biurka dla konkretnego użytkownika
Jako administrator, chcę zarezerwować biurko dla konkretnego użytkownika, aby pomóc w organizacji miejsc pracy.

Kryteria akceptacji:
- Administrator może wybrać biurko i opcję rezerwacji dla innego użytkownika
- Administrator może wybrać użytkownika z listy
- Administrator może wybrać datę rezerwacji
- System dokonuje rezerwacji i wysyła powiadomienie do użytkownika
- Biurko zmienia kolor na czerwony i pokazuje dane użytkownika

#### US-013: Przeglądanie aktywności użytkowników
Jako administrator, chcę przeglądać aktywność użytkowników, aby monitorować korzystanie z systemu.

Kryteria akceptacji:
- Administrator ma dostęp do panelu aktywności
- Panel pokazuje listę akcji użytkowników (rezerwacja/anulowanie)
- Dla każdej akcji widoczne są: użytkownik, typ akcji, biurko, data i godzina
- Administrator może filtrować listę aktywności
- Panel pokazuje najnowsze aktywności na górze listy

### 5.4 Powiadomienia

#### US-014: Otrzymywanie powiadomień o rezerwacji
Jako użytkownik, chcę otrzymywać powiadomienia email o dokonanych rezerwacjach, aby mieć potwierdzenie.

Kryteria akceptacji:
- System wysyła email po dokonaniu rezerwacji
- Email zawiera informacje o numerze biurka i dacie rezerwacji
- Email jest wysyłany w języku preferowanym przez użytkownika

#### US-015: Otrzymywanie powiadomień o anulowaniu
Jako użytkownik, chcę otrzymywać powiadomienia email o anulowanych rezerwacjach, aby mieć potwierdzenie.

Kryteria akceptacji:
- System wysyła email po anulowaniu rezerwacji
- Email zawiera informacje o numerze biurka i dacie anulowanej rezerwacji
- Email jest wysyłany w języku preferowanym przez użytkownika

#### US-016: Otrzymywanie powiadomień o błędach
Jako administrator, chcę otrzymywać powiadomienia o błędach systemu, aby szybko reagować na problemy.

Kryteria akceptacji:
- System wysyła email do administratora w przypadku wystąpienia błędu
- Email zawiera informacje o rodzaju błędu oraz trace błędu
- Email zawiera datę i godzinę wystąpienia błędu
- Email umożliwia szybką identyfikację problemu

## 6. Metryki sukcesu

### 6.1 Główne wskaźniki sukcesu

1. Adaptacja systemu
   - 90% użytkowników (54 z 60 pracowników) korzysta z systemu TTHotDesk
   - Pomiar: liczba unikalnych użytkowników logujących się do systemu w ciągu tygodnia

2. Eliminacja problemu braku miejsca
   - 80% redukcja problemu braku miejsca do pracy
   - Pomiar: porównanie liczby zgłoszeń problemu "brak miejsca" przed i po wdrożeniu

### 6.2 Dodatkowe wskaźniki

1. Wykorzystanie biurek
   - Liczba rezerwacji biurek dziennie/tygodniowo

2. Aktywność użytkowników
   - Liczba rezerwacji na użytkownika
   - Częstotliwość anulowania rezerwacji

3. Efektywność systemu
   - Liczba błędów systemu
   - Czas potrzebny na dokonanie rezerwacji 