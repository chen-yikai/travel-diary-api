import Elysia from "elysia";
import userRoute from "./routes/users";
import diaryRoute from "./routes/diary";

const apiRoute = new Elysia({ prefix: "/api" }).use(userRoute).use(diaryRoute);
export default apiRoute;
