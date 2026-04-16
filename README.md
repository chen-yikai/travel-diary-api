# diary-api

A high-performance travel diary API built with [Elysia](https://elysiajs.com/) and [Bun](https://bun.sh/). This is a TypeScript/Bun port of the original Kotlin/Ktor travel-diary-api.

## Features

- 🦊 **Elysia** - Fast, elegant TypeScript web framework
- 🍞 **Bun** - All-in-one JavaScript runtime with superior performance
- 🔐 **Authentication** - Email and password-based user authentication
- 📝 **Diary Management** - Create, read, and manage diary entries
- ⭐ **Favorites** - Mark diaries as favorites with timestamps
- 📦 **Type-Safe** - Full TypeScript support with Elysia schema validation
- 📚 **Interactive Docs** - Swagger UI and OpenAPI specification included

## Prerequisites

- [Bun](https://bun.sh/) (v1.0+)

## Installation

```bash
bun install
```

## Development

Start the development server with hot reloading:

```bash
bun run dev
```

The API will be available at `http://localhost:3000`

## Building

Build an optimized version:

```bash
bun run build
```

## Running

Start the production server:

```bash
bun start
```

## Documentation

The API comes with interactive Swagger UI and OpenAPI specification:

- **Swagger UI**: `http://localhost:3000/docs` - Interactive API documentation
- **OpenAPI Spec**: `http://localhost:3000/docs/openapi.json` - Machine-readable API specification

## Environment Variables

- `PORT` - Server port (default: 3000)

## API Endpoints

### Authentication

**POST** `/api/users/signin`

Sign in or create a new user.

Request body:
```json
{
  "userEmailAddress": "user@example.com",
  "userPassword": "password123"
}
```

Response:
```json
{
  "msg": "Sign in successful",
  "data": {
    "auth_token": "..."
  }
}
```

### Users

**GET** `/api/users`

Get all registered users (email -> token mapping).

### Diary Collection (Favorites)

**GET** `/api/diary/collection`

Get favorite diaries for the authenticated user.

Headers:
- `auth_token` - Authentication token

Response:
```json
{
  "msg": "Success",
  "data": [
    {
      "diary_id": "...",
      "favorite_datetime": "2024-01-15 10:30:45"
    }
  ]
}
```

**PUT** `/api/diary/collection?diary_id=<id>`

Toggle a diary in favorites (add if not present, remove if present).

Headers:
- `auth_token` - Authentication token

### Diary Data

**GET** `/api/diary`

Get the main diary data file (diaries.json).

**GET** `/api/:file`

Get a specific file from the diary directory (supports .json, .jpg, etc.).

### User Agreement

**GET** `/api/user-agreement`

Get the user agreement HTML page.

## Project Structure

```
src/
├── index.ts              # Application entry point
├── routes/               # API route handlers
│   ├── auth.ts          # Authentication routes
│   ├── diary.ts         # Diary and favorites routes
│   └── users.ts         # User routes
├── schema/              # TypeScript/Elysia type schemas
│   ├── auth.ts          # Auth types
│   └── favorite-diary.ts # Diary types
└── utils/               # Utility functions
    ├── auth.ts          # Auth validation and token generation
    └── date.ts          # Date formatting
public/
├── diary/               # Static diary files
│   ├── diaries.json     # Main diary data
│   └── ...              # Diary images
└── user-agreement.html  # User agreement page
```

## Key Differences from Ktor Version

1. **Faster startup** - Bun starts significantly faster than Kotlin/JVM
2. **Lower memory footprint** - TypeScript on Bun uses less memory
3. **Simplified build** - No need for Gradle, just Bun's built-in tooling
4. **Type safety** - Elysia provides compile-time validation of request/response schemas
5. **Better error handling** - Elysia's context system provides cleaner error management

## License

MIT
