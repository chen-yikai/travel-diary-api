import { Elysia, t } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { openapi } from "@elysiajs/openapi";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Types
type FavoriteDiaryData = {
  diary_id: string;
  favorite_datetime: string;
};

// State
const users = new Map<string, string>(); // email -> authToken
const passwords = new Map<string, string>(); // email -> password
const favorites: FavoriteDiaryData[] = [];

// Utility functions
function generateToken(): string {
  return crypto
    .getRandomValues(new Uint8Array(16))
    .reduce((acc, byte) => acc + byte.toString(16).padStart(2, "0"), "");
}

function validateEmail(email: string): boolean {
  return /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$/.test(email);
}

function validatePassword(password: string): boolean {
  return password.length >= 6 && /\d/.test(password) && /[a-zA-Z]/.test(password);
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Schemas
const AuthRequestSchema = t.Object({
  userEmailAddress: t.String({
    description: "User email address",
    format: "email",
    examples: ["user@example.com"],
  }),
  userPassword: t.String({
    description: "User password",
    minLength: 1,
    examples: ["password123"],
  }),
});

const AuthResponseSchema = t.Object({
  msg: t.String({
    description: "Response message",
    examples: ["Sign in successful", "Invalid email format", "Wrong password"],
  }),
  data: t.Object({
    auth_token: t.String({
      description: "Authentication token for the user",
      examples: ["abc123def456"],
    }),
  }),
});

const FavoriteDiaryDataSchema = t.Object({
  diary_id: t.String({
    description: "Unique identifier of the diary entry",
    examples: ["C8F2A1B3-9D4E-7F5A-B8C6-2E1D9A7F3B5C"],
    default: "",
  }),
  favorite_datetime: t.String({
    description: "Timestamp when the diary was favorited in YYYY-MM-DD HH:mm:ss format",
    examples: ["2024-04-16 22:30:15"],
    default: "",
  }),
});

const FavoriteDiaryResponseSchema = t.Object({
  msg: t.String({
    description: "Response message",
    examples: ["Success", "UnAuthorized"],
  }),
  data: FavoriteDiaryDataSchema,
});

const FavoriteDiaryGetResponseSchema = t.Object({
  msg: t.String({
    description: "Response message",
    examples: ["Success", "UnAuthorized"],
  }),
  data: t.Array(FavoriteDiaryDataSchema, {
    description: "Array of favorited diary entries",
  }),
});

// Create and start server
new Elysia()
  .use(
    swagger({
      path: "/docs",
      documentation: {
        info: {
          title: "Travel Diary API",
          version: "1.0.0",
          description: "API for managing travel diaries and favorites",
          contact: {
            name: "API Support",
            email: "support@diary-api.com",
          },
        },
        tags: [
          { 
            name: "Auth", 
            description: "User authentication endpoints" 
          },
          { 
            name: "Diary", 
            description: "View diaries and manage favorites" 
          },
          { 
            name: "Users", 
            description: "User information endpoints" 
          },
        ],
        components: {
          securitySchemes: {
            auth_token: {
              type: "apiKey",
              in: "header",
              name: "auth_token",
              description: "Authentication token from signin endpoint",
            },
          },
        },
        servers: [
          {
            url: "http://0.0.0.0:3000",
            description: "Local development server",
          },
        ],
      },
    })
  )
  .use(openapi())
  // Auth route
  .post(
    "/api/users/signin",
    async ({ body, set }) => {
      try {
        const { userEmailAddress: email, userPassword: password } = body;

        if (!validateEmail(email)) {
          set.status = 400;
          return { msg: "Invalid email format", data: { auth_token: "" } };
        }

        if (!validatePassword(password)) {
          set.status = 400;
          return { msg: "Invalid password", data: { auth_token: "" } };
        }

        if (!users.has(email)) {
          const token = generateToken();
          users.set(email, token);
          passwords.set(email, password);
          return { msg: "Sign in successful", data: { auth_token: token } };
        }

        const storedPassword = passwords.get(email);
        if (storedPassword === password) {
          return { msg: "Sign in successful", data: { auth_token: users.get(email)! } };
        }

        set.status = 401;
        return { msg: "Wrong password", data: { auth_token: "" } };
      } catch (error) {
        set.status = 400;
        return {
          msg: error instanceof Error ? error.message : "Invalid auth format",
          data: { auth_token: "" },
        };
      }
    },
    {
      body: AuthRequestSchema,
      response: AuthResponseSchema,
      detail: {
        tags: ["Auth"],
        summary: "Sign in or register user",
        description: "Sign in existing user or create new account. Password: min 6 chars with letter & number",
      },
    }
  )
  // Diary routes
  .put(
    "/api/diary/collection",
    async ({ request, set }) => {
      const token = request.headers.get("auth_token") || "";

      if (!Array.from(users.values()).includes(token)) {
        set.status = 403;
        return { msg: "UnAuthorized", data: { diary_id: "", favorite_datetime: "" } };
      }

      const url = new URL(request.url);
      const diaryId = url.searchParams.get("diary_id") || "";

      const existingIndex = favorites.findIndex((item) => item.diary_id === diaryId);
      if (existingIndex >= 0) {
        favorites.splice(existingIndex, 1);
      } else {
        const currentTime = formatDate(new Date());
        favorites.push({ diary_id: diaryId, favorite_datetime: currentTime });
      }

      return { msg: "Success", data: { diary_id: "", favorite_datetime: "" } };
    },
    {
      response: FavoriteDiaryResponseSchema,
      detail: {
        tags: ["Diary"],
        summary: "Toggle favorite diary",
        description: "Add or remove a diary from favorites. Requires auth_token header.",
        parameters: [
          {
            name: "auth_token",
            in: "header",
            required: true,
            schema: { type: "string" },
            description: "Authentication token from sign in",
          },
          {
            name: "diary_id",
            in: "query",
            required: true,
            schema: { type: "string" },
            description: "ID of the diary to toggle",
          },
        ],
        security: [{ auth_token: [] }]
      },
    }
  )
  .get(
    "/api/diary/collection",
    async ({ request, set }) => {
      const token = request.headers.get("auth_token") || "";

      if (!Array.from(users.values()).includes(token)) {
        set.status = 403;
        return { msg: "UnAuthorized", data: [] };
      }

      return { msg: "Success", data: favorites };
    },
    {
      response: FavoriteDiaryGetResponseSchema,
      detail: {
        tags: ["Diary"],
        summary: "Get favorite diaries",
        description: "Retrieve all favorite diaries for the authenticated user. Requires auth_token header.",
        parameters: [
          {
            name: "auth_token",
            in: "header",
            required: true,
            schema: { type: "string" },
            description: "Authentication token from sign in",
          },
        ],
        security: [{ auth_token: [] }]
      },
    }
  )
  .get("/api/diary", async () => {
    try {
      const diaryPath = new URL(import.meta.url).pathname.replace(
        /\/src\/.*/,
        "/public/diary/diaries.json"
      );
      const diaries = await Bun.file(diaryPath).text();
      return new Response(diaries, { headers: { "Content-Type": "application/json" } });
    } catch {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
  }, {
    detail: {
      tags: ["Diary"],
      summary: "Get all diary entries",
      description: "Retrieve a list of all available travel diary entries",
      responses: {
        200: {
          description: "Successfully retrieved diary list",
        },
        404: {
          description: "Diary file not found",
        }
      }
    }
  })
  .get("/api/:file", async ({ params, set }) => {
    const fileName = params.file;
    try {
      const filePath = new URL(import.meta.url).pathname.replace(
        /\/src\/.*/,
        `/public/diary/${fileName}`
      );
      const file = Bun.file(filePath);
      const exists = await file.exists();

      if (!exists) {
        set.status = 404;
        return { error: "File not found" };
      }

      const contentType = fileName.endsWith(".json")
        ? "application/json"
        : fileName.endsWith(".jpg")
        ? "image/jpeg"
        : "application/octet-stream";

      return new Response(file, { headers: { "Content-Type": contentType } });
    } catch {
      set.status = 404;
      return { error: "File not found" };
    }
  }, {
    detail: {
      tags: ["Diary"],
      summary: "Get diary file or image",
      description: "Retrieve a specific diary file or image (JSON or JPEG)",
      parameters: [
        {
          name: "file",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Filename to retrieve (e.g., d2.json, eiffel_tower.jpg)",
        }
      ],
      responses: {
        200: {
          description: "File retrieved successfully",
        },
        404: {
          description: "File not found",
        }
      }
    }
  })
  .get("/api/user-agreement", async () => {
    try {
      const filePath = new URL(import.meta.url).pathname.replace(
        /\/src\/.*/,
        "/public/user-agreement.html"
      );
      const html = await Bun.file(filePath).text();
      return new Response(html, { headers: { "Content-Type": "text/html" } });
    } catch {
      return new Response("Not found", { status: 404 });
    }
  }, {
    detail: {
      tags: ["Diary"],
      summary: "Get user agreement",
      description: "Retrieve the user agreement document in HTML format",
      responses: {
        200: {
          description: "User agreement HTML",
        },
        404: {
          description: "User agreement file not found",
        }
      }
    }
  })
  // Users route
  .get(
    "/api/users",
    async () => {
      return Object.fromEntries(users);
    },
    {
      detail: {
        tags: ["Users"],
        summary: "Get all registered users",
        description: "Retrieve a mapping of all registered users (email -> auth_token)",
        responses: {
          200: {
            description: "Successfully retrieved users",
          }
        }
      },
    }
  )
  .listen(PORT, () => {
    console.log(`🦊 Server is running at http://0.0.0.0:${PORT}`);
    console.log(`📚 Swagger UI: http://0.0.0.0:${PORT}/docs`);
    console.log(`📖 OpenAPI: http://0.0.0.0:${PORT}/docs/openapi.json`);
  });
