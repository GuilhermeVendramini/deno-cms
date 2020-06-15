import router from "../../../../router.ts";
import entityController from "../controllers/entityController.ts";
import loggedMiddleware from "../../../../../shared/middlewares/loggedMiddleware.ts";
import entity from "../../entity.ts";

router
  .get(
    `/admin/content/${entity.type.replace("_", "-")}/add`,
    loggedMiddleware.needToBeLogged,
    entityController.add,
  )
  .get(
    `/admin/content/${entity.type.replace("_", "-")}/edit/:id`,
    loggedMiddleware.needToBeLogged,
    entityController.add,
  )
  .get(
    `/${entity.type.replace("_", "-")}/:id`,
    entityController.view,
  )
  .post(
    `/admin/content/${entity.type.replace("_", "-")}/add`,
    loggedMiddleware.needToBeLogged,
    entityController.addPost,
  )
  .get(
    `/admin/content/${entity.type.replace("_", "-")}/delete/:id`,
    loggedMiddleware.needToBeLogged,
    entityController.delete,
  )
  .post(
    `/admin/content/${entity.type.replace("_", "-")}/delete`,
    loggedMiddleware.needToBeLogged,
    entityController.deletePost,
  );

export default router;
