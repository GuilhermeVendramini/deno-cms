import router from "../../../../router.ts";
import entityController from "../controllers/entityController.ts";
import loggedMiddleware from "../../../../../shared/middlewares/loggedMiddleware.ts";

router
  .get(
    "/api/content/basic-page/:id",
    loggedMiddleware.tokenValidated,
    entityController.view,
  )
  .get(
    "/api/content/basic-page",
    loggedMiddleware.tokenValidated,
    entityController.view,
  );

export default router;
