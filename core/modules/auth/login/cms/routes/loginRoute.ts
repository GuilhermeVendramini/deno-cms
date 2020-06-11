import router from "../../../../../router.ts";
import loginController from "../controllers/loginController.ts";
import loggedMiddleware from "../../../../../../shared/middlewares/loggedMiddleware.ts";

router
  .get("/login", loggedMiddleware.alreadyLogged, loginController.login)
  .get("/logout", loggedMiddleware.needToBeLogged, loginController.logout)
  .post("/login", loginController.loginPost);

export default router;
