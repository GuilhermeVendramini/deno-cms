import router from "../../../../router.ts";
import entityController from "../controllers/entityController.ts";
import loggedMiddleware from "../../../../../shared/middlewares/loggedMiddleware.ts";
import entity from "../../entity.ts";

router
  .get(
    `/admin/taxonomy/${entity.type.replace("_", "-")}`,
    loggedMiddleware.needToBeLogged,
    entityController.list,
  )
  .get(
    `/admin/taxonomy/${entity.type.replace("_", "-")}/add`,
    loggedMiddleware.needToBeLogged,
    entityController.add,
  )
  .get(
    `/admin/taxonomy/${entity.type.replace("_", "-")}/edit/:id`,
    loggedMiddleware.needToBeLogged,
    entityController.add,
  )
  .get(
    `/taxonomy/${entity.type.replace("_", "-")}/:id`,
    entityController.view,
  )
  .post(
    `/admin/taxonomy/${entity.type.replace("_", "-")}/add`,
    loggedMiddleware.needToBeLogged,
    entityController.addPost,
  )
  .get(
    `/admin/taxonomy/${entity.type.replace("_", "-")}/delete/:id`,
    loggedMiddleware.needToBeLogged,
    entityController.delete,
  )
  .post(
    `/admin/taxonomy/${entity.type.replace("_", "-")}/delete`,
    loggedMiddleware.needToBeLogged,
    entityController.deletePost,
  );

export default router;
