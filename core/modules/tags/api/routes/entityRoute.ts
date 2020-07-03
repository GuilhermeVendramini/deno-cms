import router from "../../../../router.ts";
import entityController from "../controllers/entityController.ts";
import loggedMiddleware from "../../../../../shared/middlewares/loggedMiddleware.ts";
import entity from "../../entity.ts";

router
  .get(
    `/api/${entity.bundle}/${entity.type}/:id`,
    loggedMiddleware.tokenValidated,
    entityController.view,
  )
  .get(
    `/api/${entity.bundle}/${entity.type}`,
    loggedMiddleware.tokenValidated,
    entityController.view,
  );

export default router;
