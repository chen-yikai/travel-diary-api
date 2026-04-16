import { t } from "elysia";

export const AuthRequestSchema = t.Object(
  {
    userEmailAddress: t.String({
      description: "User email address",
      format: "email",
      default: "user@example.com",
      examples: ["user@example.com"],
    }),
    userPassword: t.String({
      description: "User password",
      minLength: 1,
      default: "password123",
      examples: ["password123"],
    }),
  },
  {
    examples: [
      {
        userEmailAddress: "user@example.com",
        userPassword: "password123",
      },
    ],
  }
);

export const AuthResponseSchema = t.Object({
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

export const FavoriteDiaryDataSchema = t.Object({
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

export const FavoriteDiaryResponseSchema = t.Object({
  msg: t.String({
    description: "Response message",
    examples: ["Success", "UnAuthorized"],
  }),
  data: FavoriteDiaryDataSchema,
});

export const FavoriteDiaryGetResponseSchema = t.Object({
  msg: t.String({
    description: "Response message",
    examples: ["Success", "UnAuthorized"],
  }),
  data: t.Array(FavoriteDiaryDataSchema, {
    description: "Array of favorited diary entries",
  }),
});
