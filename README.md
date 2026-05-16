# LeagueTracker

A League of Legends player tracking and statistics web application built with **Spring Boot** and **React** (wip).

## Features

- **User Authentication** - Register/Login with JWT-based security and role-based access (USER / ADMIN)
- **Player Search** - Search any League of Legends player via Riot API by Game Name, Tag Line, and Region
- **Player Tracking** - Automatically fetches and stores summoner data, ranked info, and recent match history
- **Watchlist** - Add tracked players to a personal watchlist with custom notes
- **Match Snapshots** - View recent match details (champion, KDA, win/loss, queue type)
- **Feedback System** - Users can submit feedback with category, rating, and message
- **Email Notifications** - Automatic email via Mailtrap when adding a player to watchlist or submitting feedback
- **Admin Panel** - ADMIN-only page to view/delete all feedback and browse all registered users

## Tech Stack

| Layer      | Technology                                      |
|------------|--------------------------------------------------|
| Backend    | Java 21, Spring Boot 4.0.5, Spring Security, Spring Mail |
| Database   | PostgreSQL 17, Flyway (migrations)               |
| Auth       | JWT (jjwt 0.12.6)                                |
| API Docs   | SpringDoc OpenAPI 3.0.2 (Swagger UI)             |
| External   | Riot Games API                                   |
| Build      | Maven                                            |
| Frontend   | React 18, TypeScript, Material UI v6             |
| Forms      | react-hook-form + yup                            |
| Routing    | React Router v6                                  |

## Prerequisites

- **Java 21**
- **PostgreSQL 17**
- **Maven**
- **Node.js 18+**
- **Riot API Key** - [developer.riotgames.com](https://developer.riotgames.com)
- **Mailtrap Account**  - [mailtrap.io](https://mailtrap.io)

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/sebihutanu/lol-stats-app.git
cd lol-stats-app
```

### 2. Create the PostgreSQL database

```sql
CREATE DATABASE lol_stats_db;
```

### 3. Create the local properties file

Create `src/main/resources/application-local.properties`:

```properties
# Database password
spring.datasource.password=your_postgres_password

# JWT secret (64-char hex string)
app.jwt.secret=your_jwt_secret_here

# Mailtrap SMTP credentials
spring.mail.host=sandbox.smtp.mailtrap.io
spring.mail.port=2525
spring.mail.username=your_mailtrap_username
spring.mail.password=your_mailtrap_password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# Riot API key
riot.api.key=RGAPI-your-riot-api-key
```

### 4. Run the application

The app will start on **http://localhost:8080**.

Flyway will automatically run all database migrations on startup.

### 5. Run the frontend

```bash
cd frontend
npm install
npm start   # runs on http://localhost:3000
```

> The backend must be running before starting the frontend.

## API Endpoints

### Authentication
| Method | Endpoint              | Description       | Auth     |
|--------|-----------------------|-------------------|----------|
| POST   | `/api/auth/register`  | Register new user | No       |
| POST   | `/api/auth/login`     | Login, get JWT    | No       |

### Users
| Method | Endpoint          | Description         | Auth       |
|--------|-------------------|---------------------|------------|
| GET    | `/api/users/me`   | Get current user    | USER       |
| GET    | `/api/users`      | List all users      | ADMIN      |

### Tracked Players
| Method | Endpoint                  | Description                          | Auth  |
|--------|---------------------------|--------------------------------------|-------|
| POST   | `/api/players/search`     | Search player via Riot API & sync    | USER  |
| POST   | `/api/players`            | Manually create tracked player       | ADMIN |
| GET    | `/api/players`            | List all players (paginated, search) | USER  |
| GET    | `/api/players/{id}`       | Get player by ID                     | USER  |
| PUT    | `/api/players/{id}`       | Update player                        | ADMIN |
| DELETE | `/api/players/{id}`       | Delete player                        | ADMIN |

### Watchlist
| Method | Endpoint              | Description              | Auth |
|--------|-----------------------|--------------------------|------|
| POST   | `/api/watchlist`      | Add player to watchlist  | USER |
| GET    | `/api/watchlist`      | Get my watchlist         | USER |
| PUT    | `/api/watchlist/{id}` | Update note              | USER |
| DELETE | `/api/watchlist/{id}` | Remove from watchlist    | USER |

### Match Snapshots
| Method | Endpoint                                     | Description                  | Auth  |
|--------|----------------------------------------------|------------------------------|-------|
| GET    | `/api/players/{playerId}/matches`            | Get matches for a player     | USER  |
| POST   | `/api/players/{playerId}/matches`            | Manually create match        | ADMIN |
| DELETE | `/api/players/{playerId}/matches/{matchId}`  | Delete match                 | ADMIN |

### Feedback
| Method | Endpoint              | Description            | Auth  |
|--------|-----------------------|------------------------|-------|
| POST   | `/api/feedback`       | Submit feedback        | USER  |
| GET    | `/api/feedback/me`    | Get my feedback        | USER  |
| GET    | `/api/feedback`       | Get all feedback       | ADMIN |
| DELETE | `/api/feedback/{id}`  | Delete feedback        | ADMIN |

### Other
| Method | Endpoint       | Description   | Auth |
|--------|----------------|---------------|------|
| GET    | `/api/health`  | Health check  | No   |

## API Documentation

Once the app is running, visit:

- **Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

Click the **Authorize** button in Swagger UI and paste your JWT token (from the login response) to test authenticated endpoints.

## Frontend

### Pages

| Page           | Route           | Description                                                                         | Access     |
|----------------|-----------------|-------------------------------------------------------------------------------------|------------|
| Login          | `/login`        | Email + password login, JWT stored in localStorage                                  | Public     |
| Register       | `/register`     | Name, email, password + confirm password                                            | Public     |
| Home           | `/home`         | Dashboard with live stats                                                           | USER       |
| Players        | `/players`      | Paginated table, search, add player via Riot API                                    | USER       |
| Player Details | `/players/:id`  | Profile icon, rank, champion stats, match history table                             | USER       |
| Watchlist      | `/watchlist`    | Add / edit note / delete; player details page                                       | USER       |
| Match History  | `/matches`      | Player selector, search by champion, filter by WIN / LOSS                           | USER       |
| Feedback       | `/feedback`     | Category (select), rating (radio 1–5), allow contact (checkbox), message (textarea) | USER       |
| Admin Panel    | `/admin`        | All feedback with delete confirmation; all users list                               | ADMIN only |

### Authentication Flow

- JWT token is stored in `localStorage` after login / register
- All API calls automatically include `Authorization: Bearer <token>`
- Protected routes redirect to `/login` if not authenticated
- Admin routes redirect to `/home` if role is not `ADMIN`

### Creating an Admin User

Register a normal account through the app, then run the following SQL and log in again:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';
```

> A new login is required because the role is embedded in the JWT token.

### Frontend Project Structure

```
frontend/src/
├── api/
├── components/     # Layout (AppLayout + navbar), ProtectedRoute, AdminRoute, ConfirmDeleteDialog
├── hooks/          # useAuth (localStorage helpers), usePageTitle
├── pages/          # one folder per page (Admin, Feedback, Home, Login, Matches, Players, Register, Watchlist)
└── types/          # shared TypeScript interfaces
```

## Project Structure

```
src/main/java/com/sebihutanu/lolstatsapp/
├── config/          # OpenAPI configuration
├── controller/      # REST controllers
├── dto/             # Request/Response DTOs
├── entity/          # JPA entities
├── exception/       # Global exception handling
├── repository/      # Spring Data JPA repositories
├── security/        # JWT filter, Security config
├── service/         # Business logic + Riot API + Email
└── LolStatsAppApplication.java

src/main/resources/
├── db/migration/    # Flyway SQL migrations (V1-V5)
├── application.properties
└── application-local.properties (gitignored)
```

## Entities

- **User** - App users with email, password, role (USER/ADMIN)
- **TrackedPlayer** - LoL players tracked via Riot API (PUUID, rank, level)
- **WatchlistEntry** - Many-to-many between User and TrackedPlayer
- **MatchSnapshot** - Recent match data for tracked players
- **Feedback** - User feedback with category, rating, message

## Author

**Sebastian Hutanu** - [github.com/sebihutanu](https://github.com/sebihutanu)



