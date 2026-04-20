import openapi from "@elysiajs/openapi";
import { Elysia } from "elysia";
import apiRoute from "./api";
import staticPlugin from "@elysiajs/static";
import cors from "@elysiajs/cors";
import { env } from "bun";

const app = new Elysia()
  .use(cors())
  .use(
    staticPlugin({
      prefix: "/",
      detail: {
        hide: false,
        summary: "Public",
        description: "User Agreement is in `/api/user-agreement.html`",
      },
    }),
  )
  .use(
    openapi({
      documentation: {
        info: {
          title: "Diary API",
          version: "1.0",
          description: "For french travel diary APP from WSC 2024 Module A PM",
        },
      },
      scalar: {
        defaultOpenAllTags: true,
      },
      path: "/docs",
    }),
  )
  .use(apiRoute)
  .listen(env.PORT || 3000);

console.log(
  `🦊 Elysia is running at ${app.server?.protocol}://${app.server?.hostname}:${app.server?.port}`,
);
console.log(
  `📖 Scalar UI is running on ${app.server?.protocol}://${app.server?.hostname}:${app.server?.port}/docs`,
);
