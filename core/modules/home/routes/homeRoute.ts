import router from "../../../router.ts";
import homeController from "../controllers/homeController.ts";
import mainMenuMiddleware from "../../main_menu/cms/middlewares/entityMiddleware.ts";

router
  .get("/", mainMenuMiddleware.buildMenu, homeController.home);

export default router;
