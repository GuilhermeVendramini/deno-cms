import router from "../../../../../router.ts";
import loginController from "../controllers/loginController.ts";

router
  .get("/login",loginController.login);

export default router;