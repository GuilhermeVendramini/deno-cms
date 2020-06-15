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
  );

export default router;
