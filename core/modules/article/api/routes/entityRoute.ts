import router from "../../../../router.ts";
import entityController from "../controllers/entityController.ts";
import loggedMiddleware from "../../../../../shared/middlewares/loggedMiddleware.ts";
import entity from "../../entity.ts";

router
  .get(
    `/api/content/${entity.type}/:id`,
    loggedMiddleware.tokenValidated,
    entityController.view,
  )
  .get(
    `/api/content/${entity.type}`,
    loggedMiddleware.tokenValidated,
    entityController.view,
  );

export default router;
