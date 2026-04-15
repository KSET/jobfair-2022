import axios from "axios";
import {
  Role,
} from "../../helpers/auth";
import {
  AuthRouter,
} from "../../helpers/route";

const authRouter = new AuthRouter({
  role: Role.Admin,
});

authRouter.get("/", async () => {
  const url = process.env.SUMMER_INTERNSHIPS_URL || "";
  const debug: Record<string, unknown> = {
    url: url || "(not set)",
    timestamp: new Date().toISOString(),
    response: null,
    error: null,
  };

  // Call the external summer internships URL
  if (!url) {
    debug.error = "SUMMER_INTERNSHIPS_URL env var is not set";
  } else {
    try {
      const res = await axios.get(url, { timeout: 15000 });
      debug.response = {
        status: res.status,
        statusText: res.statusText,
        data: res.data,
      };
    } catch (e) {
      if (axios.isAxiosError(e)) {
        debug.error = {
          message: e.message,
          status: e.response?.status ?? null,
          statusText: e.response?.statusText ?? null,
          responseData: e.response?.data ?? null,
          code: e.code ?? null,
        };
      } else {
        debug.error = e instanceof Error ? e.message : String(e);
      }
    }
  }

  return debug;
});

export default authRouter;
