import { Elysia } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { authRoutes } from "./routes/auth";
import { diaryRoutes } from "./routes/diary";
import { usersRoutes } from "./routes/users";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

new Elysia()
  .use(
    openapi({
      path: "/docs",
      scalar: {
        defaultOpenAllTags: true,
      },
      documentation: {
        info: {
          title: "Travel Diary API",
          version: "1.0.0",
          description: "API for managing travel diaries and favorites",
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
      },
    })
  )
  .use(authRoutes)
  .use(diaryRoutes)
  .use(usersRoutes)
  .listen(PORT, () => {
    console.log(`🦊 Server is running at http://0.0.0.0:${PORT}`);
    console.log(`📚 Swagger UI: http://0.0.0.0:${PORT}/docs`);
    console.log(`📖 OpenAPI: http://0.0.0.0:${PORT}/docs/openapi.json`);
  });
