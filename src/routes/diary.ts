import { Elysia } from "elysia";
import { FavoriteDiaryResponseSchema, FavoriteDiaryGetResponseSchema } from "../schemas";
import { users, favorites } from "../state";
import { formatDate } from "../utils";

export const diaryRoutes = new Elysia()
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
        parameters: [],
        security: [{ auth_token: [] }]
      },
    }
  )
  .get("/api/diary", async () => {
    try {
      const diaryPath = `${process.cwd()}/public/diary/diaries.json`;
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
      const filePath = `${process.cwd()}/public/diary/${fileName}`;
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
      const filePath = `${process.cwd()}/public/user-agreement.html`;
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
  });
