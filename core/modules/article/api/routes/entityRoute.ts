import router from "../../../../router.ts";
import entityController from "../controllers/entityController.ts";
import loggedMiddleware from "../../../../../shared/middlewares/loggedMiddleware.ts";

router
  .get(
    "/api/content/article/:id",
    loggedMiddleware.tokenValidated,
    entityController.view,
  )
  .get(
    "/api/content/article",
    loggedMiddleware.tokenValidated,
    entityController.view,
  );

export default router;
