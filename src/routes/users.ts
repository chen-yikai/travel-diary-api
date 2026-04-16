import { Elysia } from "elysia";
import { users } from "../state";

export const usersRoutes = new Elysia()
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
  );
