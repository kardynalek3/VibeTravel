# REST API Plan for VibeTravels

## 1. Resources

- **Profiles** → `profiles` table - User profiles with travel preferences
- **Destinations** → `destinations` table - Travel destinations with geographical data
- **Notes** → `notes` table - User notes about planned trips
- **Plans** → `plans` table - AI-generated trip plans
- **Likes** → `likes` table - User likes for plans
- **AI Errors** → `ai_errors` table - Logging of AI errors

## 2. Endpoints

### Authentication

Authentication is handled by Supabase Auth, which provides standard endpoints for:

- Registration
- Login
- Logout
- Password reset
- Email verification

### Profiles

#### GET /profiles/me

- **Description**: Get current user's profile
- **Authentication**: Required
- **Response Body**:
  ```json
  {
    "id": "uuid",
    "first_name": "string",
    "last_name": "string",
    "email": "string",
    "gender": "string",
    "preferred_segment": "family|couple|solo",
    "preferred_trip_type": "touring|leisure",
    "preferred_transport": "car|public_transport|plane|walking",
    "favorite_destinations": ["string"],
    "plans_count": "integer",
    "likes_received_count": "integer",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
  ```
- **Success Codes**:
  - 200 OK
- **Error Codes**:
  - 401 Unauthorized - User not authenticated
  - 404 Not Found - Profile not found

#### PATCH /profiles/me

- **Description**: Update current user's profile
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "first_name": "string",
    "last_name": "string",
    "gender": "string",
    "preferred_segment": "family|couple|solo",
    "preferred_trip_type": "touring|leisure",
    "preferred_transport": "car|public_transport|plane|walking",
    "favorite_destinations": ["string"]
  }
  ```
- **Response Body**: Same as GET /profiles/me
- **Success Codes**:
  - 200 OK
- **Error Codes**:
  - 400 Bad Request - Invalid data
  - 401 Unauthorized - User not authenticated
  - 404 Not Found - Profile not found

### Destinations

#### GET /destinations

- **Description**: Get all destinations with optional filtering
- **Query Parameters**:
  - `city` (string): Filter by city name
  - `country` (string): Filter by country name
  - `page` (integer): Page number for pagination
  - `limit` (integer): Results per page (default: 20, max: 100)
- **Authentication**: Optional
- **Response Body**:
  ```json
  {
    "data": [
      {
        "id": "integer",
        "city": "string",
        "country": "string",
        "location": {
          "lat": "number",
          "lng": "number"
        },
        "created_at": "timestamp"
      }
    ],
    "pagination": {
      "total": "integer",
      "page": "integer",
      "limit": "integer",
      "pages": "integer"
    }
  }
  ```
- **Success Codes**:
  - 200 OK
- **Error Codes**:
  - 400 Bad Request - Invalid query parameters

#### GET /destinations/{id}

- **Description**: Get a specific destination
- **Authentication**: Optional
- **Response Body**:
  ```json
  {
    "id": "integer",
    "city": "string",
    "country": "string",
    "location": {
      "lat": "number",
      "lng": "number"
    },
    "created_at": "timestamp"
  }
  ```
- **Success Codes**:
  - 200 OK
- **Error Codes**:
  - 404 Not Found - Destination not found

### Notes

#### GET /notes

- **Description**: Get all notes for the current user
- **Query Parameters**:
  - `is_draft` (boolean): Filter by draft status
  - `destination_id` (integer): Filter by destination
  - `page` (integer): Page number for pagination
  - `limit` (integer): Results per page (default: 20, max: 100)
- **Authentication**: Required
- **Response Body**:
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "destination_id": "integer",
        "destination": {
          "city": "string",
          "country": "string"
        },
        "segment": "family|couple|solo",
        "transport": "car|public_transport|plane|walking",
        "duration": "integer",
        "attractions": "string",
        "is_draft": "boolean",
        "created_at": "timestamp",
        "updated_at": "timestamp"
      }
    ],
    "pagination": {
      "total": "integer",
      "page": "integer",
      "limit": "integer",
      "pages": "integer"
    }
  }
  ```
- **Success Codes**:
  - 200 OK
- **Error Codes**:
  - 401 Unauthorized - User not authenticated
  - 400 Bad Request - Invalid query parameters

#### GET /notes/{id}

- **Description**: Get a specific note
- **Authentication**: Required
- **Response Body**:
  ```json
  {
    "id": "uuid",
    "user_id": "uuid",
    "destination_id": "integer",
    "destination": {
      "city": "string",
      "country": "string"
    },
    "segment": "family|couple|solo",
    "transport": "car|public_transport|plane|walking",
    "duration": "integer",
    "attractions": "string",
    "is_draft": "boolean",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
  ```
- **Success Codes**:
  - 200 OK
- **Error Codes**:
  - 401 Unauthorized - User not authenticated
  - 403 Forbidden - Note belongs to another user
  - 404 Not Found - Note not found

#### POST /notes

- **Description**: Create a new note
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "destination_id": "integer",
    "segment": "family|couple|solo",
    "transport": "car|public_transport|plane|walking",
    "duration": "integer",
    "attractions": "string",
    "is_draft": "boolean"
  }
  ```
- **Response Body**: Same as GET /notes/{id}
- **Success Codes**:
  - 201 Created
- **Error Codes**:
  - 400 Bad Request - Invalid data
  - 401 Unauthorized - User not authenticated
  - 404 Not Found - Destination not found
  - 422 Unprocessable Entity - Validation errors

#### PATCH /notes/{id}

- **Description**: Update a note
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "destination_id": "integer",
    "segment": "family|couple|solo",
    "transport": "car|public_transport|plane|walking",
    "duration": "integer",
    "attractions": "string",
    "is_draft": "boolean"
  }
  ```
- **Response Body**: Same as GET /notes/{id}
- **Success Codes**:
  - 200 OK
- **Error Codes**:
  - 400 Bad Request - Invalid data
  - 401 Unauthorized - User not authenticated
  - 403 Forbidden - Note belongs to another user
  - 404 Not Found - Note not found
  - 422 Unprocessable Entity - Validation errors

#### DELETE /notes/{id}

- **Description**: Soft delete a note
- **Authentication**: Required
- **Success Codes**:
  - 204 No Content
- **Error Codes**:
  - 401 Unauthorized - User not authenticated
  - 403 Forbidden - Note belongs to another user
  - 404 Not Found - Note not found

### Plans

#### GET /plans

- **Description**: Get plans with filtering options
- **Query Parameters**:
  - `is_public` (boolean): Filter by public/private status
  - `note_id` (uuid): Filter by note
  - `destination_id` (integer): Filter by destination
  - `segment` (string): Filter by segment type
  - `duration` (integer): Filter by trip duration
  - `sort` (string): Sort field (created_at, likes_count)
  - `order` (string): Sort order (asc, desc)
  - `page` (integer): Page number for pagination
  - `limit` (integer): Results per page (default: 20, max: 100)
- **Authentication**: Optional (returns only public plans if not authenticated)
- **Response Body**:
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "note_id": "uuid",
        "user_id": "uuid",
        "user": {
          "first_name": "string",
          "last_name_initial": "string"
        },
        "destination_id": "integer",
        "destination": {
          "city": "string",
          "country": "string"
        },
        "content": "json",
        "is_public": "boolean",
        "likes_count": "integer",
        "created_at": "timestamp",
        "is_liked_by_me": "boolean"
      }
    ],
    "pagination": {
      "total": "integer",
      "page": "integer",
      "limit": "integer",
      "pages": "integer"
    }
  }
  ```
- **Success Codes**:
  - 200 OK
- **Error Codes**:
  - 400 Bad Request - Invalid query parameters

#### GET /plans/{id}

- **Description**: Get a specific plan
- **Authentication**: Optional (must be authenticated to view private plans)
- **Response Body**:
  ```json
  {
    "id": "uuid",
    "note_id": "uuid",
    "user_id": "uuid",
    "user": {
      "first_name": "string",
      "last_name_initial": "string"
    },
    "destination_id": "integer",
    "destination": {
      "city": "string",
      "country": "string"
    },
    "content": "json",
    "is_public": "boolean",
    "likes_count": "integer",
    "created_at": "timestamp",
    "is_liked_by_me": "boolean"
  }
  ```
- **Success Codes**:
  - 200 OK
- **Error Codes**:
  - 403 Forbidden - Private plan belongs to another user
  - 404 Not Found - Plan not found

#### POST /notes/{noteId}/plans

- **Description**: Generate a plan from a note using AI
- **Authentication**: Required
- **Response Body**: Same as GET /plans/{id}
- **Success Codes**:
  - 201 Created
  - 202 Accepted (if generation is asynchronous)
- **Error Codes**:
  - 401 Unauthorized - User not authenticated
  - 403 Forbidden - Note belongs to another user or daily limit exceeded
  - 404 Not Found - Note not found
  - 422 Unprocessable Entity - Note is not valid for plan generation

#### PATCH /plans/{id}

- **Description**: Update a plan
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "content": "json",
    "is_public": "boolean"
  }
  ```
- **Response Body**: Same as GET /plans/{id}
- **Success Codes**:
  - 200 OK
- **Error Codes**:
  - 400 Bad Request - Invalid data
  - 401 Unauthorized - User not authenticated
  - 403 Forbidden - Plan belongs to another user
  - 404 Not Found - Plan not found
  - 422 Unprocessable Entity - Validation errors

#### DELETE /plans/{id}

- **Description**: Soft delete a plan
- **Authentication**: Required
- **Success Codes**:
  - 204 No Content
- **Error Codes**:
  - 401 Unauthorized - User not authenticated
  - 403 Forbidden - Plan belongs to another user
  - 404 Not Found - Plan not found

#### GET /plans/{id}/export

- **Description**: Export a plan to PDF
- **Authentication**: Required for private plans
- **Response**: PDF file
- **Success Codes**:
  - 200 OK
- **Error Codes**:
  - 401 Unauthorized - User not authenticated
  - 403 Forbidden - Private plan belongs to another user
  - 404 Not Found - Plan not found

### Likes

#### POST /plans/{id}/like

- **Description**: Like a plan
- **Authentication**: Required
- **Success Codes**:
  - 204 No Content
- **Error Codes**:
  - 401 Unauthorized - User not authenticated
  - 403 Forbidden - Cannot like own plan or already liked
  - 404 Not Found - Plan not found

#### DELETE /plans/{id}/like

- **Description**: Unlike a plan
- **Authentication**: Required
- **Success Codes**:
  - 204 No Content
- **Error Codes**:
  - 401 Unauthorized - User not authenticated
  - 404 Not Found - Like not found

### Admin

#### GET /admin/dashboard

- **Description**: Get admin dashboard metrics
- **Authentication**: Required (admin only)
- **Response Body**:
  ```json
  {
    "total_users": "integer",
    "total_plans": "integer",
    "total_likes": "integer",
    "avg_plans_per_user": "number",
    "public_plans_count": "integer",
    "private_plans_count": "integer",
    "ai_errors_count": "integer",
    "top_destinations": [
      {
        "city": "string",
        "plan_count": "integer"
      }
    ]
  }
  ```
- **Success Codes**:
  - 200 OK
- **Error Codes**:
  - 401 Unauthorized - User not authenticated
  - 403 Forbidden - User is not an admin

## 3. Authentication and Authorization

### Authentication

- Authentication is handled by Supabase Auth
- JWT tokens are used for API authentication
- API endpoints validate the JWT token from the Authorization header
- Token expiration is set to 1 hour, with refresh tokens available

### Authorization

- Row Level Security (RLS) in Supabase enforces access control at the database level
- API endpoints include additional authorization checks:
  - Users can only access their own notes and plans (unless plans are public)
  - Users cannot like their own plans
  - Only admins can access the admin dashboard
  - Rate limiting is applied to plan generation (2 per day per user)

## 4. Validation and Business Logic

### Profiles

- Email must be unique
- First name and last name are required

### Destinations

- City and country are required
- Location must be valid geographical coordinates

### Notes

- Destination must exist
- Duration must be between 1 and 5 days
- Attractions text must not exceed 500 characters
- Segment must be one of: family, couple, solo
- Transport must be one of: car, public_transport, plane, walking

### Plans

- Note must exist and belong to the user
- Content JSON text must not exceed 5000 characters
- Maximum 3 plans per note
- Plan generation is limited to 2 per day per user
- AI generation errors are logged

### Likes

- Users cannot like their own plans
- Users can only like a plan once

### Security

- All endpoints use HTTPS
- Rate limiting is applied to all endpoints
- Input validation protects against injection attacks
- Error messages do not expose sensitive information
