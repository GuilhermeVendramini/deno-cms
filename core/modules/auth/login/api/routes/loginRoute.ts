import router from "../../../../../router.ts";
import loginController from "../controllers/loginController.ts";

router
  .post("/api/login", loginController.login);

export default router;
