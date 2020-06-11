import router from "../../../../../router.ts";
import registerController from "../controllers/registerController.ts";

router
  .post("/api/register", registerController.register);

export default router;
