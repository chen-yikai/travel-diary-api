import Elysia, { t } from "elysia";
import { Data } from "../data";

const CollectionSchema = t.Object({
  diary_id: t.String(),
  favorite_datetime: t.String(),
});

const diaryRoute = new Elysia({ prefix: "/diary", tags: ["Diary"] })
  .get(
    "/",
    () => {
      const diaries = Bun.file("src/diaries.json").json();
      return diaries;
    },
    {
      detail: {
        summary: "Get All Diaries",
        description: "Retrieve all available diary entries",
      },
      response: {
        200: t.Object({
          msg: t.String(),
          data: t.Array(
            t.Object({
              diary_id: t.String(),
              diary_title: t.String(),
              diary_main_text: t.String(),
              diary_upload_datetime: t.String(),
              diary_image: t.String(),
              diary_upload_username: t.String(),
            }),
          ),
        }),
      },
    },
  )
  .guard(
    {
      headers: t.Object({
        auth_token: t.String({ error: "auth token is required" }),
      }),
      error({ code, error, set }) {
        if (code === "VALIDATION") {
          set.status = 401;
          return {
            msg: error.message,
            data: null,
          };
        }
        set.status = 403;
        return {
          msg: "Unauthorized",
          data: null,
        };
      },
    },
    (app) =>
      app
        .put(
          "/collection",
          ({ headers, body }) => {
            const diary = Data.addDiary(headers.auth_token, body.diary_id);
            return {
              msg: "Success",
              data: diary,
            };
          },
          {
            detail: {
              summary: "Add Diary to Collection",
              description: "Add a diary entry to the user's collection (requires authentication)",
            },
            body: t.Object({
              diary_id: t.String({ error: "diary_id is required" }),
            }),
            response: {
              200: t.Object({
                msg: t.String(),
                data: CollectionSchema,
              }),
            },
          },
        )
        .get(
          "/collection",
          ({ headers }) => {
            const diaries = Data.getAllDiaries(headers.auth_token);
            return {
              msg: "Success",
              data: diaries,
            };
          },
          {
            detail: {
              summary: "Get User's Diary Collection",
              description: "Retrieve all diary entries in the authenticated user's collection",
            },
            response: {
              200: t.Object({
                msg: t.String(),
                data: t.Array(CollectionSchema),
              }),
            },
          },
        ),
  );

export default diaryRoute;
