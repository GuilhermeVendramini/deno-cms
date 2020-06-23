import router from "../../../../router.ts";
import entityController from "../controllers/entityController.ts";
import loggedMiddleware from "../../../../../shared/middlewares/loggedMiddleware.ts";
import entity from "../../entity.ts";
import baseEntityMiddleware from "../../../../../shared/middlewares/baseEntityMiddleware.ts";

router
  .get(
    `/admin/content/${entity.type.replace("_", "-")}/add`,
    loggedMiddleware.needToBeLogged,
    entityController.add,
  )
  .get(
    `/admin/content/${entity.type.replace("_", "-")}/edit/:id`,
    loggedMiddleware.needToBeLogged,
    baseEntityMiddleware.needToBeContentAuthor,
    entityController.add,
  )
  .get(
    `/${entity.type.replace("_", "-")}/:id`,
    baseEntityMiddleware.contentNeedToBePublished,
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
    baseEntityMiddleware.needToBeContentAuthor,
    entityController.delete,
  )
  .post(
    `/admin/content/${entity.type.replace("_", "-")}/delete`,
    loggedMiddleware.needToBeLogged,
    baseEntityMiddleware.needToBeContentAuthor,
    entityController.deletePost,
  );

export default router;
