import router from "../../../../../router.ts";
import loginController from "../controllers/loginController.ts";

router
  .get("/login", loginController.login)
  .post("/login", loginController.loginPost);

export default router;
