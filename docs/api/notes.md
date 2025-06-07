# Notes API

## Tworzenie notatki

Endpoint do tworzenia nowych notatek dotyczących planowanych wycieczek.

### Szczegóły żądania

- **Metoda HTTP**: `POST`
- **URL**: `/api/notes`
- **Wymagane nagłówki**:
  - `Authorization`: Bearer token (token JWT z Supabase Auth)
  - `Content-Type`: application/json

### Format danych wejściowych

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

### Pola danych wejściowych

| Pole             | Typ     | Wymagane | Opis                            | Ograniczenia                                                      |
| ---------------- | ------- | -------- | ------------------------------- | ----------------------------------------------------------------- |
| `destination_id` | integer | Tak      | ID miejsca docelowego           | Liczba całkowita dodatnia                                         |
| `segment`        | string  | Nie      | Typ segmentu                    | Dozwolone wartości: `family`, `couple`, `solo`                    |
| `transport`      | string  | Nie      | Preferowany środek transportu   | Dozwolone wartości: `car`, `public_transport`, `plane`, `walking` |
| `duration`       | integer | Tak      | Czas trwania wycieczki w dniach | Wartość od 1 do 5                                                 |
| `attractions`    | string  | Tak      | Opis atrakcji do odwiedzenia    | Maksymalnie 500 znaków                                            |
| `is_draft`       | boolean | Nie      | Czy notatka jest wersją roboczą | Domyślnie: `true`                                                 |

### Odpowiedzi

#### Sukces (201 Created)

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

#### Błędy

##### Nieprawidłowe dane wejściowe (400 Bad Request)

```json
{
  "status": 400,
  "message": "Nieprawidłowe dane wejściowe",
  "errors": [
    { "field": "duration", "message": "Czas trwania musi wynosić co najmniej 1 dzień" },
    { "field": "attractions", "message": "Opis atrakcji nie może przekraczać 500 znaków" }
  ]
}
```

##### Brak uwierzytelnienia (401 Unauthorized)

```json
{
  "status": 401,
  "message": "Wymagane uwierzytelnienie"
}
```

##### Miejsce docelowe nie istnieje (404 Not Found)

```json
{
  "status": 404,
  "message": "Nie znaleziono miejsca docelowego o ID: 123"
}
```

##### Nieprawidłowy typ danych (422 Unprocessable Entity)

```json
{
  "status": 422,
  "message": "Nie można przetworzyć żądania",
  "details": "Nieprawidłowy typ segmentu. Dozwolone wartości: family, couple, solo"
}
```

##### Błąd serwera (500 Internal Server Error)

```json
{
  "status": 500,
  "message": "Wystąpił nieoczekiwany błąd serwera"
}
```

### Przykłady użycia

#### Przykład: Tworzenie notatki dla rodzinnej wycieczki do Krakowa

```javascript
const createNote = async () => {
  const response = await fetch("https://vibetravels.app/api/notes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${supabase.auth.session().access_token}`,
    },
    body: JSON.stringify({
      destination_id: 1, // ID Krakowa
      segment: "family",
      transport: "car",
      duration: 3,
      attractions: "Wawel, Sukiennice, Muzeum Narodowe, Kazimierz, Zoo",
      is_draft: true,
    }),
  });

  if (response.ok) {
    const note = await response.json();
    console.log("Utworzono notatkę:", note);
    return note;
  } else {
    const error = await response.json();
    console.error("Błąd tworzenia notatki:", error);
    throw new Error(error.message);
  }
};
```

### Bezpieczeństwo

- Endpoint wymaga uwierzytelnienia za pomocą tokenu JWT z Supabase Auth.
- Notatka jest automatycznie przypisywana do zalogowanego użytkownika.
- Walidacja danych wejściowych zapobiega atakom typu injection i XSS.
- Row Level Security (RLS) w Supabase zapewnia, że użytkownicy mają dostęp tylko do swoich notatek.
