import router from "../../../../../router.ts";
import basicPageController from "../controllers/basicPageController.ts";
import loggedMiddleware from "../../../../../../shared/middlewares/loggedMiddleware.ts";

router
  .get(
    "/api/content/basic-page/:id",
    loggedMiddleware.tokenValidated,
    basicPageController.view,
  )
  .get(
    "/api/content/basic-page",
    loggedMiddleware.tokenValidated,
    basicPageController.view,
  );

export default router;
