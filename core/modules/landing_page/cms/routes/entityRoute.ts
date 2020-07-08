import router from "../../../../router.ts";
import entityMiddleware from "../middlewares/entityMiddleware.ts";
import loggedMiddleware from "../../../../../shared/middlewares/loggedMiddleware.ts";
import entity from "../../entity.ts";
import baseEntityMiddleware from "../../../../../shared/middlewares/baseEntityMiddleware.ts";
import cmsMiddleware from "../../../../../shared/middlewares/cmsMiddleware.ts";
import entityBaseController from "../../../../entities/controllers/entityBaseController.ts";
import entityReferenceMiddleware from "../../../entity_reference/middlewares/entityReferenceMiddleware.ts";

router
  .get(
    `/admin/${entity.bundle}/${entity.type}/add`,
    loggedMiddleware.needToBeLogged,
    entityMiddleware.add,
    entityBaseController.add,
  )
  .get(
    `/admin/${entity.bundle}/${entity.type}/edit/:id`,
    loggedMiddleware.needToBeLogged,
    baseEntityMiddleware.needToBeContentAuthor,
    entityMiddleware.add,
    entityBaseController.add,
  )
  .get(
    `/${entity.bundle.replace("_", "-")}/${
      entity.type.replace("_", "-")
    }/:title`,
    baseEntityMiddleware.contentNeedToBePublished,
    entityMiddleware.view,
    entityBaseController.view,
  )
  .post(
    `/admin/${entity.bundle}/${entity.type}/add`,
    loggedMiddleware.needToBeLogged,
    cmsMiddleware.submittedByForm,
    entityMiddleware.addPost,
    entityReferenceMiddleware.addRelation,
    entityBaseController.addPost,
  )
  .get(
    `/admin/${entity.bundle}/${entity.type}/delete/:id`,
    loggedMiddleware.needToBeLogged,
    baseEntityMiddleware.needToBeContentAuthor,
    entityMiddleware.delete,
    entityBaseController.delete,
  )
  .post(
    `/admin/${entity.bundle}/${entity.type}/delete`,
    loggedMiddleware.needToBeLogged,
    baseEntityMiddleware.needToBeContentAuthor,
    cmsMiddleware.submittedByForm,
    entityMiddleware.deletePost,
    entityReferenceMiddleware.deleteRelation,
    entityBaseController.deletePost,
  );

export default router;
