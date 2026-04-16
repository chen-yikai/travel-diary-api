import { Elysia } from "elysia";
import { AuthRequestSchema, AuthResponseSchema } from "../schemas";
import { users, passwords } from "../state";
import { generateToken, validateEmail, validatePassword } from "../utils";

export const authRoutes = new Elysia()
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
  );
