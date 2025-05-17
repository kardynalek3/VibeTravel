# Schemat bazy danych dla VibeTravels

## 1. Tabele, kolumny, typy danych i ograniczenia

### Typy ENUM

```sql
-- Typy ENUM dla kategoryzacji
CREATE TYPE segment_type AS ENUM ('family', 'couple', 'solo');
CREATE TYPE trip_type AS ENUM ('touring', 'leisure');
CREATE TYPE transport_type AS ENUM ('car', 'public_transport', 'plane', 'walking');
```

### Rozszerzenia

```sql
-- Włączenie niezbędnych rozszerzeń
CREATE EXTENSION IF NOT EXISTS "postgis";    -- Dla danych geograficznych
CREATE EXTENSION IF NOT EXISTS "pg_cron";    -- Dla planowania zadań
```

### Tabela: Profiles

```sql
-- Tabela profili użytkowników rozszerzająca auth.users Supabase
This table is managed by Supabase Auth.
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL
    gender TEXT(3),
    preferred_segment segment_type,
    preferred_trip_type trip_type,
    preferred_transport transport_type,
    favorite_destinations TEXT[],
    plans_count INT DEFAULT 0,
    likes_received_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Tylko jedno konto na adres email
    UNIQUE(email)
);
```

### Tabela: Destinations

```sql
-- Tabela miejsc docelowych
CREATE TABLE destinations (
    id SERIAL PRIMARY KEY,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,  -- Współrzędne geograficzne z PostGIS
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Tabela: Notes

```sql
-- Tabela notatek użytkowników
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    destination_id INT REFERENCES destinations(id) NOT NULL,
    segment segment_type NULL,
    transport transport_type NULL,
    duration INT NOT NULL CHECK (duration BETWEEN 1 AND 5),  -- 1-5 dni
    attractions TEXT NOT NULL CHECK (length(attractions) <= 500),  -- Limit 500 znaków
    is_draft BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    deleted_at TIMESTAMP WITH TIME ZONE
);
```

### Tabela: Plans

```sql
-- Tabela planów podróży
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id UUID REFERENCES notes(id) NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    destination_id INT REFERENCES destinations(id) NOT NULL,
    content JSONB NOT NULL CHECK (length(content::text) <= 5000),  -- Limit 5000 znaków
    is_public BOOLEAN DEFAULT TRUE,
    likes_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Ograniczenie do maksymalnie 3 planów na notatkę
    CONSTRAINT max_plans_per_note CHECK (
        (SELECT COUNT(*) FROM plans p WHERE p.note_id = note_id AND p.deleted_at IS NULL) <= 3
    )
);
```

### Tabela: Likes

```sql
-- Tabela polubień
CREATE TABLE likes (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    plan_id UUID REFERENCES plans(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Tylko jedno polubienie na plan od użytkownika
    UNIQUE(user_id, plan_id)
);
```

### Tabela: AI Errors

```sql
-- Tabela logowania błędów AI
CREATE TABLE ai_errors (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    note_id UUID REFERENCES notes(id),
    error_type TEXT NOT NULL,
    error_message TEXT NOT NULL,
    input_data TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## 2. Relacje między tabelami

1. **auth.users** 1:1 **profiles**
   - Każdy użytkownik ma jeden profil z unikalnym adresem email

2. **users** 1:N **notes**
   - Użytkownik może mieć wiele notatek

3. **destinations** 1:N **notes**
   - Miejsce docelowe może być powiązane z wieloma notatkami

4. **notes** 1:N **plans** (maksymalnie 3)
   - Z jednej notatki można wygenerować maksymalnie 3 plany podróży

5. **users** 1:N **plans**
   - Użytkownik może mieć wiele planów

6. **destinations** 1:N **plans**
   - Miejsce docelowe może być powiązane z wieloma planami

7. **users** N:M **plans** (przez tabele **likes**)
   - Użytkownik może polubić wiele planów
   - Plan może być polubiony przez wielu użytkowników

## 3. Indeksy

```sql
-- Indeksy dla tabeli notes
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_destination_id ON notes(destination_id);
CREATE INDEX idx_notes_deleted_at_null ON notes(deleted_at) WHERE deleted_at IS NULL;

-- Indeksy dla tabeli plans
CREATE INDEX idx_plans_user_id ON plans(user_id);
CREATE INDEX idx_plans_note_id ON plans(note_id);
CREATE INDEX idx_plans_destination_id ON plans(destination_id);
CREATE INDEX idx_plans_deleted_at_null ON plans(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_plans_public ON plans(created_at) WHERE is_public = TRUE AND deleted_at IS NULL;
CREATE INDEX idx_plans_content_gin ON plans USING GIN (content);  -- Indeks GIN dla efektywnego wyszukiwania w JSONB
CREATE INDEX idx_plans_likes_count ON plans(likes_count DESC) WHERE is_public = TRUE AND deleted_at IS NULL;

-- Indeksy dla tabeli likes
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_likes_plan_id ON likes(plan_id);

-- Indeksy dla tabeli destinations
CREATE INDEX idx_destinations_location ON destinations USING GIST (location);  -- Indeks przestrzenny
CREATE INDEX idx_destinations_city ON destinations(city);
```

## 4. Materialized Views

```sql
-- Zmaterializowany widok popularnych planów publicznych
CREATE MATERIALIZED VIEW popular_public_plans AS
SELECT p.id, p.user_id, p.destination_id, p.content, p.likes_count,
       d.city as destination_city, d.location as destination_location,
       pr.first_name as user_first_name,
       LEFT(pr.last_name, 1) as user_last_initial
FROM plans p
JOIN destinations d ON p.destination_id = d.id
JOIN profiles pr ON p.user_id = pr.id
WHERE p.is_public = TRUE AND p.deleted_at IS NULL
ORDER BY p.likes_count DESC, p.created_at DESC;

-- Zmaterializowany widok aktywności według regionów
CREATE MATERIALIZED VIEW region_activity AS
SELECT d.city, COUNT(p.id) as plan_count
FROM plans p
JOIN destinations d ON p.destination_id = d.id
WHERE p.is_public = TRUE AND p.deleted_at IS NULL
GROUP BY d.city
ORDER BY plan_count DESC;

-- Indeksy dla zmaterializowanych widoków
CREATE INDEX idx_popular_plans_likes ON popular_public_plans(likes_count DESC);
CREATE INDEX idx_popular_plans_destination ON popular_public_plans(destination_city);
CREATE INDEX idx_region_activity_count ON region_activity(plan_count DESC);
```

## 5. Funkcje i wyzwalacze

```sql
-- Funkcja odświeżania zmaterializowanych widoków
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY popular_public_plans;
  REFRESH MATERIALIZED VIEW CONCURRENTLY region_activity;
END;
$$ LANGUAGE plpgsql;

-- Zaplanowanie odświeżania zmaterializowanych widoków raz w tygodniu
SELECT cron.schedule('0 0 * * 0', 'SELECT refresh_materialized_views()');

-- Zaplanowanie VACUUM ANALYZE raz w tygodniu
SELECT cron.schedule('0 2 * * 0', 'VACUUM ANALYZE');

-- Funkcja aktualizacji licznika planów
CREATE OR REPLACE FUNCTION update_plans_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET plans_count = plans_count + 1 WHERE id = NEW.user_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    UPDATE profiles SET plans_count = plans_count - 1 WHERE id = NEW.user_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Funkcja aktualizacji licznika polubień
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE plans SET likes_count = likes_count + 1 WHERE id = NEW.plan_id;
    UPDATE profiles SET likes_received_count = likes_received_count + 1 
    WHERE id = (SELECT user_id FROM plans WHERE id = NEW.plan_id);
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE plans SET likes_count = likes_count - 1 WHERE id = OLD.plan_id;
    UPDATE profiles SET likes_received_count = likes_received_count - 1 
    WHERE id = (SELECT user_id FROM plans WHERE id = OLD.plan_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Funkcja czyszczenia starych błędów AI
CREATE OR REPLACE FUNCTION cleanup_old_ai_errors()
RETURNS void AS $$
BEGIN
  DELETE FROM ai_errors
  WHERE created_at < NOW() - INTERVAL '1 month';
END;
$$ LANGUAGE plpgsql;

-- Zaplanowanie czyszczenia starych błędów AI raz dziennie
SELECT cron.schedule('0 3 * * *', 'SELECT cleanup_old_ai_errors()');

-- Funkcja generowania raportu dla panelu administratora
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS TABLE (
  total_users BIGINT,
  total_plans BIGINT,
  total_likes BIGINT,
  avg_plans_per_user NUMERIC,
  public_plans_count BIGINT,
  private_plans_count BIGINT,
  ai_errors_count BIGINT,
  top_destinations JSON
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM profiles),
    (SELECT COUNT(*) FROM plans WHERE deleted_at IS NULL),
    (SELECT COUNT(*) FROM likes),
    (SELECT COALESCE(AVG(plans_count), 0) FROM profiles),
    (SELECT COUNT(*) FROM plans WHERE is_public = TRUE AND deleted_at IS NULL),
    (SELECT COUNT(*) FROM plans WHERE is_public = FALSE AND deleted_at IS NULL),
    (SELECT COUNT(*) FROM ai_errors WHERE created_at > (NOW() - INTERVAL '30 days')),
    (SELECT json_agg(t) FROM (
      SELECT city, plan_count FROM region_activity LIMIT 10
    ) t);
END;
$$ LANGUAGE plpgsql;

-- Wyzwalacze
CREATE TRIGGER tr_update_plans_count
AFTER INSERT OR UPDATE ON plans
FOR EACH ROW EXECUTE FUNCTION update_plans_count();

CREATE TRIGGER tr_update_likes_count
AFTER INSERT OR DELETE ON likes
FOR EACH ROW EXECUTE FUNCTION update_likes_count();
```

## 6. Row Level Security (RLS)

```sql
-- Włączenie RLS dla wszystkich tabel
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_errors ENABLE ROW LEVEL SECURITY;

-- Polityki RLS dla profiles
CREATE POLICY profiles_select_own ON profiles FOR SELECT
  USING (auth.uid() = id);
CREATE POLICY profiles_update_own ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Polityki RLS dla notes
CREATE POLICY notes_select_own ON notes FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY notes_insert_own ON notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY notes_update_own ON notes FOR UPDATE
  USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY notes_delete_own ON notes FOR DELETE
  USING (auth.uid() = user_id);

-- Polityki RLS dla plans
CREATE POLICY plans_select_own ON plans FOR SELECT
  USING ((auth.uid() = user_id OR is_public = TRUE) AND deleted_at IS NULL);
CREATE POLICY plans_insert_own ON plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY plans_update_own ON plans FOR UPDATE
  USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY plans_delete_own ON plans FOR DELETE
  USING (auth.uid() = user_id);

-- Polityki RLS dla likes
CREATE POLICY likes_select_all ON likes FOR SELECT
  USING (TRUE);
CREATE POLICY likes_insert_own ON likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY likes_delete_own ON likes FOR DELETE
  USING (auth.uid() = user_id);

-- Polityki RLS dla destinations
CREATE POLICY destinations_select_all ON destinations FOR SELECT
  USING (TRUE);

-- Polityki RLS dla ai_errors (tylko admin ma dostęp)
CREATE POLICY ai_errors_select_admin ON ai_errors FOR SELECT
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE auth.users.role = 'admin'));
```

## 7. Uwagi i wyjaśnienia

1. **Miękkie usuwanie rekordów**:
   - Tabele `notes` i `plans` zawierają kolumnę `deleted_at`, która umożliwia miękkie usuwanie
   - Indeksy częściowe z warunkiem `WHERE deleted_at IS NULL` optymalizują zapytania o aktywne rekordy
   - Polityki RLS uwzględniają warunek `deleted_at IS NULL`

2. **Cache'owanie z Redis**:
   - Choć sam schemat bazy danych nie zawiera konfiguracji Redis, zaleca się implementację cache'owania na poziomie aplikacji dla:
     - Popularnych planów publicznych (timeout: 1 godzina)
     - Wyników wyszukiwania (timeout: 15 minut)
     - Profili użytkowników i popularnych miejsc docelowych

3. **Limity i ograniczenia**:
   - Ograniczenie długości notatek do 500 znaków
   - Ograniczenie długości planów do 5000 znaków
   - Ograniczenie maksymalnej liczby planów do 3 dla jednej notatki
   - Ograniczenie długości wycieczek od 1 do 5 dni

4. **Bezpieczeństwo**:
   - Zarządzanie użytkownikami i uwierzytelnianie realizowane przez Supabase
   - RLS zapewnia dostęp do danych tylko dla uprawnionych użytkowników
   - Polityki RLS implementują reguły biznesowe dotyczące dostępu do danych

5. **Monitorowanie i konserwacja**:
   - Automatyczne wykonywanie VACUUM ANALYZE raz w tygodniu
   - Odświeżanie zmaterializowanych widoków raz w tygodniu
   - Automatyczne usuwanie starych błędów AI po miesiącu

6. **Wydajność**:
   - Indeksy na często używanych ścieżkach zapytań
   - Zmaterializowane widoki dla popularnych zapytań
   - Częściowe indeksy dla optymalizacji zapytań o aktywne i publiczne plany
   - Indeks GIN dla efektywnego wyszukiwania w polu JSONB 