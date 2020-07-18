import router from "../../../router.ts";
import adminController from "../controllers/adminController.ts";
import loggedMiddleware from "../../../../shared/middlewares/loggedMiddleware.ts";

router
  .get(
    "/admin/content",
    loggedMiddleware.needToBeLogged,
    adminController.content,
  )
  .get(
    "/admin/taxonomy",
    loggedMiddleware.needToBeLogged,
    adminController.taxonomy,
  )
  .get(
    "/admin/menu",
    loggedMiddleware.needToBeLogged,
    adminController.menu,
  )
  .get(
    "/admin/media",
    loggedMiddleware.needToBeLogged,
    adminController.media,
  )
  .get(
    "/admin/block",
    loggedMiddleware.needToBeLogged,
    adminController.block,
  );

export default router;
