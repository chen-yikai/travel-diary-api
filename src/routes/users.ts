import Elysia, { t } from "elysia";
import { Data } from "../data";

const AuthResponse = t.Object({
  msg: t.String(),
  data: t.Object({
    auth_token: t.String(),
  }),
});

const userRoute = new Elysia({ prefix: "/users", tags: ["Users"] }).post(
  "/signin",
  async ({ body }) => {
    const token = Data.auth(body.userEmailAddress, body.userPassword);

    return {
      msg: "Sign in successful",
      data: {
        auth_token: token,
      },
    };
  },
  {
    detail: {
      summary: "User Sign In",
      description: "Authenticate a user with email and password to get an authentication token",
    },
    body: t.Object({
      userEmailAddress: t.String({
        format: "email",
        error: "Vaild Email Address",
      }),
      userPassword: t.String({
        minLength: 6,
        pattern: "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{6,}$",
        error:
          "No less than six characters and include English letters and numbers",
      }),
    }),
    response: {
      200: AuthResponse,
      400: AuthResponse,
    },
    error({ code, error, set }) {
      const isValidationError = code === "VALIDATION";
      set.status = isValidationError ? 400 : 302;
      return {
        msg: isValidationError ? error.message : "incorrect password",
        data: { auth_token: "" },
      };
    },
  },
);

export default userRoute;
