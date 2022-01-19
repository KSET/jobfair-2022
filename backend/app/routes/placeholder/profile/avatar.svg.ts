import {
  AuthRouter,
} from "../../../helpers/route";
import {
  AvatarService,
} from "../../../services/avatar-service";

const router = new AuthRouter();

router.getRaw("/", (req, res) => {
  const {
    uid,
  } = req.user!;

  const svg = AvatarService.placeholder(uid);

  return res.contentType("svg").end(svg);
});

export default router;
