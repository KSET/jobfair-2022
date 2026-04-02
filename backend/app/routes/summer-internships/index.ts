import {
  Role,
} from "../../helpers/auth";
import {
  get,
} from "../../helpers/axios";
import {
  AuthRouter,
} from "../../helpers/route";

const authRouter = new AuthRouter({
  role: Role.Admin,
});

authRouter.get("/", async () => {
  return await get(process.env.SUMMER_INTERNSHIPS_URL!);
});

export default authRouter;
