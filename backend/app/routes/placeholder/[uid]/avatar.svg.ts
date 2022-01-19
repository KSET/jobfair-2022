import {
  Router,
} from "../../../helpers/route";
import {
  AvatarService,
} from "../../../services/avatar-service";

const router = new Router();

router.getRaw("/", (req, res) => {
  const { uid } = req.params as Record<string, string>;

  const svg = AvatarService.placeholder(uid);

  return res.contentType("svg").end(svg);
});

export default router;
