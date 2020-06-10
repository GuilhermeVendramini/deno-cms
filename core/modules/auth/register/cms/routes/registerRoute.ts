import router from "../../../../../router.ts";
import registerController from "../controllers/registerController.ts";

router
  .get("/register", registerController.register)
  .post("/register", registerController.registerPost);

export default router;
