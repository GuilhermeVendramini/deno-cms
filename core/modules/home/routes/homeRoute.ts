import router from "../../../router.ts";
import homeController from "../controllers/homeController.ts";
import mainMenuMiddleware from "../../main_menu/cms/middlewares/entityMiddleware.ts";
import footerMenuMiddleware from "../../footer/cms/middlewares/entityMiddleware.ts";

router
  .get(
    "/",
    mainMenuMiddleware.buildMenu,
    footerMenuMiddleware.buildMenu,
    homeController.home,
  );

export default router;
