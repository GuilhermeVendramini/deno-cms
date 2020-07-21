import router from "../../../../../router.ts";
import loginController from "../controllers/loginController.ts";
import loggedMiddleware from "../../../../../../shared/middlewares/loggedMiddleware.ts";
import mainMenuMiddleware from "../../../../main_menu/cms/middlewares/entityMiddleware.ts";

router
  .get(
    "/login",
    loggedMiddleware.alreadyLogged,
    mainMenuMiddleware.buildMenu,
    loginController.login,
  )
  .get(
    "/logout",
    loggedMiddleware.needToBeLogged,
    loginController.logout,
  )
  .post("/login", loginController.loginPost);

export default router;
