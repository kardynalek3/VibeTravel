/**
 * VibeTravels - Definicje typów DTO i modeli komend
 * Ten plik zawiera wszystkie struktury danych używane do komunikacji między klientem a API
 */

// ----------------------
// Typy Enum
// ----------------------

/**
 * Typy segmentów użytkowników
 */
export enum SegmentType {
  Family = "family",
  Couple = "couple",
  Solo = "solo",
}

/**
 * Typy wycieczek
 */
export enum TripType {
  Touring = "touring",
  Leisure = "leisure",
}

/**
 * Typy transportu
 */
export enum TransportType {
  Car = "car",
  PublicTransport = "public_transport",
  Plane = "plane",
  Walking = "walking",
}

// ----------------------
// Bazowe encje
// ----------------------

/**
 * Bazowa encja profilu użytkownika
 */
export type Profile = {
  id: string; // UUID
  first_name: string;
  last_name: string;
  email: string;
  gender?: string;
  preferred_segment?: SegmentType;
  preferred_trip_type?: TripType;
  preferred_transport?: TransportType;
  favorite_destinations?: string[];
  plans_count: number;
  likes_received_count: number;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
};

/**
 * Bazowa encja miejsca docelowego
 */
export type Destination = {
  id: number;
  city: string;
  country: string;
  location: any; // PostGIS Point
  created_at: string;
};

/**
 * Bazowa encja notatki
 */
export type Note = {
  id: string; // UUID
  user_id: string; // UUID
  destination_id: number;
  segment?: SegmentType;
  transport?: TransportType;
  duration: number;
  attractions: string;
  is_draft: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
};

/**
 * Bazowa encja planu podróży
 */
export type Plan = {
  id: string; // UUID
  note_id: string; // UUID
  user_id: string; // UUID
  destination_id: number;
  content: any; // JSONB
  is_public: boolean;
  likes_count: number;
  created_at: string;
  deleted_at?: string;
};

/**
 * Bazowa encja polubienia
 */
export type Like = {
  id: number;
  user_id: string; // UUID
  plan_id: string; // UUID
  created_at: string;
};

/**
 * Bazowa encja błędu AI
 */
export type AIError = {
  id: number;
  user_id?: string; // UUID
  note_id?: string; // UUID
  error_type: string;
  error_message: string;
  input_data?: string;
  created_at: string;
};

// ----------------------
// Typy pomocnicze
// ----------------------

/**
 * Reprezentacja punktu geograficznego
 */
export type GeoPoint = {
  lat: number;
  lng: number;
};

/**
 * Podstawowe informacje o użytkowniku
 */
export type UserBasicInfo = {
  first_name: string;
  last_name_initial: string;
};

/**
 * Podstawowe informacje o miejscu docelowym
 */
export type DestinationBasicInfo = {
  id: number;
  city: string;
  country: string;
};

/**
 * Parametry stronicowania dla list
 */
export type PaginationParams = {
  page: number;
  limit: number;
};

/**
 * Generyczny typ odpowiedzi ze stronicowaniem
 */
export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
};

// ----------------------
// DTO - Profile
// ----------------------

/**
 * DTO odpowiedzi dla profilu użytkownika
 */
export type ProfileResponseDTO = Profile;

/**
 * DTO żądania aktualizacji profilu użytkownika
 */
export type ProfileUpdateDTO = Partial<
  Pick<
    Profile,
    | "first_name"
    | "last_name"
    | "gender"
    | "preferred_segment"
    | "preferred_trip_type"
    | "preferred_transport"
    | "favorite_destinations"
  >
>;

// ----------------------
// DTO - Destinations
// ----------------------

/**
 * DTO odpowiedzi dla miejsca docelowego
 */
export type DestinationResponseDTO = Omit<Destination, "location"> & {
  location: GeoPoint;
};

/**
 * DTO odpowiedzi dla listy miejsc docelowych
 */
export type DestinationListResponseDTO = PaginatedResponse<DestinationResponseDTO>;

/**
 * Parametry filtrowania dla miejsc docelowych
 */
export type DestinationFilterParams = PaginationParams & {
  city?: string;
  country?: string;
};

// ----------------------
// DTO - Notes
// ----------------------

/**
 * DTO odpowiedzi dla notatki
 */
export type NoteResponseDTO = Omit<Note, "destination_id"> & {
  destination: DestinationBasicInfo;
};

/**
 * DTO odpowiedzi dla listy notatek
 */
export type NoteListResponseDTO = PaginatedResponse<NoteResponseDTO>;

/**
 * DTO żądania utworzenia notatki
 */
export type NoteCreateDTO = Pick<
  Note,
  "destination_id" | "segment" | "transport" | "duration" | "attractions" | "is_draft"
>;

/**
 * DTO żądania aktualizacji notatki
 */
export type NoteUpdateDTO = Partial<NoteCreateDTO>;

/**
 * Parametry filtrowania dla notatek
 */
export type NoteFilterParams = PaginationParams & {
  is_draft?: boolean;
  destination_id?: number;
};

// ----------------------
// DTO - Plans
// ----------------------

/**
 * DTO odpowiedzi dla planu podróży
 */
export type PlanResponseDTO = Omit<Plan, "user_id" | "destination_id"> & {
  user: UserBasicInfo;
  destination: DestinationBasicInfo;
  is_liked_by_me: boolean;
};

/**
 * DTO odpowiedzi dla listy planów podróży
 */
export type PlanListResponseDTO = PaginatedResponse<PlanResponseDTO>;

/**
 * DTO żądania aktualizacji planu podróży
 */
export type PlanUpdateDTO = Partial<Pick<Plan, "content" | "is_public">>;

/**
 * Parametry filtrowania dla planów podróży
 */
export type PlanFilterParams = PaginationParams & {
  is_public?: boolean;
  note_id?: string;
  destination_id?: number;
  segment?: SegmentType;
  duration?: number;
  sort?: "created_at" | "likes_count";
  order?: "asc" | "desc";
};

// ----------------------
// DTO - Admin
// ----------------------

/**
 * DTO odpowiedzi dla dashboardu administratora
 */
export type AdminDashboardDTO = {
  total_users: number;
  total_plans: number;
  total_likes: number;
  avg_plans_per_user: number;
  public_plans_count: number;
  private_plans_count: number;
  ai_errors_count: number;
  top_destinations: Array<{
    city: string;
    plan_count: number;
  }>;
};

// ----------------------
// Specjalne typy dla zawartości planu
// ----------------------

/**
 * Typ reprezentujący miejsce/atrakcję w planie podróży
 */
export type PlanPlace = {
  name: string;
  description: string;
  address?: string;
  opening_hours?: string;
  visit_duration: number; // w minutach
  coordinates?: GeoPoint;
};

/**
 * Typ reprezentujący transport między miejscami
 */
export type PlanTransport = {
  type: TransportType;
  duration: number; // w minutach
  distance?: number; // w metrach
  start_coordinates?: GeoPoint;
  end_coordinates?: GeoPoint;
};

/**
 * Typ reprezentujący pojedynczy punkt w harmonogramie dnia
 */
export type PlanItem = {
  time: string; // format "HH:MM"
  type: "place" | "transport";
  data: PlanPlace | PlanTransport;
};

/**
 * Typ reprezentujący plan dla jednego dnia
 */
export type PlanDay = {
  date: string; // format "YYYY-MM-DD"
  items: PlanItem[];
};

/**
 * Typ reprezentujący pełny plan podróży (zawartość pola content)
 */
export type PlanContent = {
  title: string;
  summary: string;
  days: PlanDay[];
  recommendations?: string[];
};
