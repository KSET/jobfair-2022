import {
  Role,
} from "../../../helpers/auth";
import {
  AuthRouter,
} from "../../../helpers/route";

const authRouter = new AuthRouter({
  role: Role.PR,
});

authRouter.get("/", () => {
  return {
    shareUrl: process.env.PLAUSIBLE_SHARE_URL || null,
  };
});

export default authRouter;
